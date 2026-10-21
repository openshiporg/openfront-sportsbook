-- Approved result facts remain valid evidence after the active result advances
-- to SUPERSEDED. Preserve the approval timestamp and immutable fact payload.
CREATE FUNCTION sportsbook_guard_result_version_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'result version evidence is append-only';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status::text IN ('APPROVED', 'SUPERSEDED') AND NEW."approvedAt" IS NULL THEN
      RAISE EXCEPTION 'approved result version requires approval evidence';
    END IF;
    IF NEW.status::text IN ('PENDING', 'REJECTED') AND NEW."approvedAt" IS NOT NULL THEN
      RAISE EXCEPTION 'unapproved result version cannot have approval evidence';
    END IF;
    RETURN NEW;
  END IF;

  IF ROW(NEW."tenant", NEW.event, NEW."providerConnection", NEW.version, NEW.payload, NEW."payloadHash")
     IS DISTINCT FROM
     ROW(OLD."tenant", OLD.event, OLD."providerConnection", OLD.version, OLD.payload, OLD."payloadHash") THEN
    RAISE EXCEPTION 'result version facts are immutable';
  END IF;

  IF OLD.status::text = 'PENDING' THEN
    IF NEW.status::text NOT IN ('PENDING', 'APPROVED', 'REJECTED') THEN
      RAISE EXCEPTION 'invalid pending result version transition';
    END IF;
    IF NEW.status::text = 'APPROVED' AND NEW."approvedAt" IS NULL THEN
      RAISE EXCEPTION 'approved result version requires approval evidence';
    END IF;
    IF NEW.status::text IN ('PENDING', 'REJECTED') AND NEW."approvedAt" IS NOT NULL THEN
      RAISE EXCEPTION 'unapproved result version cannot have approval evidence';
    END IF;
  ELSIF OLD.status::text = 'APPROVED' THEN
    IF NEW.status::text NOT IN ('APPROVED', 'SUPERSEDED') OR NEW."approvedAt" IS DISTINCT FROM OLD."approvedAt" THEN
      RAISE EXCEPTION 'approved result version approval evidence is immutable';
    END IF;
  ELSIF OLD.status::text = 'SUPERSEDED' THEN
    IF NEW.status::text <> 'SUPERSEDED' OR NEW."approvedAt" IS DISTINCT FROM OLD."approvedAt" THEN
      RAISE EXCEPTION 'superseded result version approval evidence is immutable';
    END IF;
  ELSIF OLD.status::text = 'REJECTED' THEN
    IF NEW.status::text <> 'REJECTED' OR NEW."approvedAt" IS DISTINCT FROM OLD."approvedAt" THEN
      RAISE EXCEPTION 'rejected result version is immutable';
    END IF;
  ELSE
    RAISE EXCEPTION 'invalid result version lifecycle state';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER result_version_approval_evidence_insert
  BEFORE INSERT ON "ResultVersion"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_guard_result_version_mutation();
CREATE TRIGGER result_version_immutable
  BEFORE UPDATE OR DELETE ON "ResultVersion"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_guard_result_version_mutation();

-- Historic result versions may be SUPERSEDED after approval. approvedAt is the
-- immutable evidence that the version was approved before it was superseded.
CREATE OR REPLACE FUNCTION sportsbook_assert_settlement_grade_versions() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  settlement_id text;
  parent_id text;
  tenant_id text;
  settlement_run_id text;
  new_line record;
  new_fact jsonb;
  leg_id text;
  old_grade_id text;
  new_grade_id text;
  old_result_version integer;
  new_result_version integer;
  advanced boolean := false;
BEGIN
  IF TG_TABLE_NAME = 'Settlement' THEN
    settlement_id := NEW.id;
  ELSE
    settlement_id := NEW."settlement";
  END IF;

  SELECT "reversalOf", "tenant", "settlementRun"
    INTO parent_id, tenant_id, settlement_run_id
    FROM "Settlement" WHERE id = settlement_id;
  IF parent_id IS NULL OR settlement_run_id IS NULL THEN
    RETURN NULL;
  END IF;

  FOR new_line IN
    SELECT "wagerPart", trace FROM "SettlementLine" WHERE "settlement" = settlement_id
  LOOP
    IF jsonb_typeof(new_line.trace->'grades') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'settlement correction grade evidence is missing';
    END IF;
    FOR new_fact IN SELECT value FROM jsonb_array_elements(new_line.trace->'grades')
    LOOP
      leg_id := new_fact->>'legId';
      new_grade_id := new_fact->>'gradeId';
      SELECT old_fact.value->>'gradeId' INTO old_grade_id
        FROM "SettlementLine" old_line
        CROSS JOIN LATERAL jsonb_array_elements(old_line.trace->'grades') AS old_fact(value)
        WHERE old_line."settlement" = parent_id
          AND old_line."wagerPart" = new_line."wagerPart"
          AND old_fact.value->>'legId' = leg_id
        LIMIT 1;
      IF leg_id IS NULL OR old_grade_id IS NULL OR new_grade_id IS NULL THEN
        RAISE EXCEPTION 'settlement correction grade lineage is incomplete';
      END IF;

      SELECT result.version INTO old_result_version
        FROM "LegGrade" leg
        JOIN "MarketGrade" market ON market.id = leg."marketGrade" AND market.tenant = leg.tenant
        JOIN "ResultVersion" result ON result.id = market."resultVersion" AND result.tenant = market.tenant
        WHERE leg.id = old_grade_id AND leg.tenant = tenant_id AND leg."wagerLeg" = leg_id
          AND result."approvedAt" IS NOT NULL;
      SELECT result.version INTO new_result_version
        FROM "LegGrade" leg
        JOIN "MarketGrade" market ON market.id = leg."marketGrade" AND market.tenant = leg.tenant
        JOIN "ResultVersion" result ON result.id = market."resultVersion" AND result.tenant = market.tenant
        WHERE leg.id = new_grade_id AND leg.tenant = tenant_id AND leg."wagerLeg" = leg_id
          AND result."approvedAt" IS NOT NULL;
      IF old_result_version IS NULL OR new_result_version IS NULL THEN
        RAISE EXCEPTION 'settlement correction requires approved tenant-bound grades';
      END IF;
      IF new_result_version < old_result_version THEN
        RAISE EXCEPTION 'settlement correction cannot regress a wager-leg result version';
      END IF;
      IF new_result_version > old_result_version THEN
        advanced := true;
      END IF;
    END LOOP;
  END LOOP;

  IF NOT advanced THEN
    RAISE EXCEPTION 'settlement correction requires a newer result version';
  END IF;
  RETURN NULL;
END $$;
