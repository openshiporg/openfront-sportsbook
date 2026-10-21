-- A posted reversal is a tenant-bound child of its original journal and its
-- entries must be the exact account/currency/side inverse, not merely balanced.
CREATE FUNCTION sportsbook_assert_journal_reversal() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_tenant text;
  parent_correlation text;
BEGIN
  IF NEW."reversalOf" IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT "tenant", "correlationId" INTO parent_tenant, parent_correlation
    FROM "JournalTransaction" WHERE id = NEW."reversalOf" FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'journal reversal parent is missing';
  END IF;
  IF NEW."tenant" IS DISTINCT FROM parent_tenant OR NEW."correlationId" IS DISTINCT FROM parent_correlation THEN
    RAISE EXCEPTION 'journal reversal must retain its tenant and correlation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER journal_reversal_lineage
  BEFORE INSERT ON "JournalTransaction"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_journal_reversal();

CREATE FUNCTION sportsbook_check_journal_reversal_entries() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  original_id text;
  has_mismatch boolean;
BEGIN
  SELECT "reversalOf" INTO original_id
    FROM "JournalTransaction" WHERE id = NEW."transaction";
  IF original_id IS NULL THEN
    RETURN NULL;
  END IF;

  WITH original AS (
    SELECT account, currency,
           CASE WHEN side::text = 'DEBIT' THEN 'CREDIT' ELSE 'DEBIT' END AS expected_side,
           sum("amountMinor"::numeric) AS amount
    FROM "JournalEntry" WHERE "transaction" = original_id
    GROUP BY account, currency, expected_side
  ), reversal AS (
    SELECT account, currency, side::text AS actual_side,
           sum("amountMinor"::numeric) AS amount
    FROM "JournalEntry" WHERE "transaction" = NEW."transaction"
    GROUP BY account, currency, actual_side
  )
  SELECT EXISTS (
    SELECT 1 FROM original
    FULL OUTER JOIN reversal
      ON original.account = reversal.account
     AND original.currency = reversal.currency
     AND original.expected_side = reversal.actual_side
    WHERE original.account IS NULL OR reversal.account IS NULL OR original.amount <> reversal.amount
  ) INTO has_mismatch;
  IF has_mismatch THEN
    RAISE EXCEPTION 'journal reversal entries must exactly negate the original ledger transaction';
  END IF;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER journal_reversal_entries_immutable
  AFTER INSERT ON "JournalEntry"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION sportsbook_check_journal_reversal_entries();
