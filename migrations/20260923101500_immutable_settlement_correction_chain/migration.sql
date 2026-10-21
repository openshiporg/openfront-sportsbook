-- Reversals and settlement corrections are append-only, one-to-one chains.
-- Refuse to install the unique guards if historical branching already exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "JournalTransaction"
    WHERE "reversalOf" IS NOT NULL
    GROUP BY "tenant", "reversalOf"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'duplicate journal reversals must be reconciled before installing JournalTransaction_tenant_reversal_uq';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "Settlement"
    WHERE "reversalOf" IS NOT NULL
    GROUP BY "tenant", "reversalOf"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'branched settlement corrections must be reconciled before installing Settlement_tenant_reversal_uq';
  END IF;
END $$;

CREATE UNIQUE INDEX "JournalTransaction_tenant_reversal_uq"
  ON "JournalTransaction"("tenant", "reversalOf");
CREATE UNIQUE INDEX "Settlement_tenant_reversal_uq"
  ON "Settlement"("tenant", "reversalOf");

CREATE FUNCTION sportsbook_assert_settlement_correction() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_tenant text;
  parent_wager text;
  parent_version integer;
  parent_result_id text;
  parent_event_id text;
  parent_result_version integer;
  next_event_id text;
  next_result_version integer;
BEGIN
  IF NEW."reversalOf" IS NULL THEN
    IF NEW.version <> 1 THEN
      RAISE EXCEPTION 'settlement root version must be one';
    END IF;
    RETURN NEW;
  END IF;

  SELECT "tenant", "wager", version, "resultVersion"
    INTO parent_tenant, parent_wager, parent_version, parent_result_id
    FROM "Settlement"
    WHERE id = NEW."reversalOf"
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'settlement correction parent is missing';
  END IF;
  IF NEW."tenant" IS DISTINCT FROM parent_tenant OR NEW."wager" IS DISTINCT FROM parent_wager THEN
    RAISE EXCEPTION 'settlement correction must remain within its tenant and wager';
  END IF;
  IF NEW.version <> parent_version + 1 THEN
    RAISE EXCEPTION 'settlement correction version must immediately follow its parent';
  END IF;

  SELECT event, version INTO parent_event_id, parent_result_version
    FROM "ResultVersion" WHERE id = parent_result_id AND tenant = parent_tenant;
  SELECT event, version INTO next_event_id, next_result_version
    FROM "ResultVersion" WHERE id = NEW."resultVersion" AND tenant = NEW."tenant";
  IF parent_event_id IS NULL OR next_event_id IS NULL THEN
    RAISE EXCEPTION 'settlement correction requires tenant-bound result versions';
  END IF;
  IF next_event_id = parent_event_id AND next_result_version < parent_result_version THEN
    RAISE EXCEPTION 'settlement correction cannot regress its result version';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER settlement_correction_lineage
  BEFORE INSERT ON "Settlement"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_settlement_correction();
CREATE TRIGGER settlement_immutable
  BEFORE UPDATE OR DELETE ON "Settlement"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();

CREATE TRIGGER market_grade_immutable
  BEFORE UPDATE OR DELETE ON "MarketGrade"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER leg_grade_immutable
  BEFORE UPDATE OR DELETE ON "LegGrade"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();

-- Full-product corrections carry one or more result versions in the immutable
-- settlement-line grade trace. At commit, compare each corrected leg with the
-- grade that produced its parent settlement: versions may stay equal for
-- unaffected events, but may never regress and at least one must advance.
CREATE FUNCTION sportsbook_assert_settlement_grade_versions() RETURNS trigger LANGUAGE plpgsql AS $$
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
          AND result.status::text = 'APPROVED';
      SELECT result.version INTO new_result_version
        FROM "LegGrade" leg
        JOIN "MarketGrade" market ON market.id = leg."marketGrade" AND market.tenant = leg.tenant
        JOIN "ResultVersion" result ON result.id = market."resultVersion" AND result.tenant = market.tenant
        WHERE leg.id = new_grade_id AND leg.tenant = tenant_id AND leg."wagerLeg" = leg_id
          AND result.status::text = 'APPROVED';
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

CREATE CONSTRAINT TRIGGER settlement_correction_grade_versions
  AFTER INSERT ON "Settlement"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_settlement_grade_versions();
CREATE CONSTRAINT TRIGGER settlement_line_correction_grade_versions
  AFTER INSERT ON "SettlementLine"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_settlement_grade_versions();
