-- Cash-out acceptances remain append-only. A correction is one exact linked
-- reversal row; duplicate parents or altered economics are rejected in PostgreSQL.
CREATE UNIQUE INDEX "CashOutAcceptance_reversal_parent_uq"
  ON "CashOutAcceptance" ("tenant", "reversalOf")
  WHERE "reversalOf" IS NOT NULL;

CREATE FUNCTION sportsbook_assert_cashout_reversal() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_row "CashOutAcceptance"%ROWTYPE;
  reversal_parent text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Settlement"
    WHERE "tenant" = NEW."tenant" AND "wager" = NEW."wager"
  ) THEN
    IF NEW."reversalOf" IS NOT NULL THEN
      RAISE EXCEPTION 'CASHOUT_CORRECTION_REQUIRES_SETTLEMENT_CORRECTION';
    END IF;
    RAISE EXCEPTION 'CASH_OUT_AFTER_SETTLEMENT_UNSUPPORTED';
  END IF;

  IF NEW."reversalOf" IS NULL THEN
    IF NEW.status::text = 'REVERSED' THEN
      RAISE EXCEPTION 'cash-out reversal requires a linked accepted parent';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status::text IS DISTINCT FROM 'REVERSED' THEN
    RAISE EXCEPTION 'linked cash-out correction must be a reversal row';
  END IF;

  SELECT * INTO parent_row
    FROM "CashOutAcceptance"
    WHERE id = NEW."reversalOf"
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cash-out reversal parent is missing';
  END IF;
  IF parent_row.status::text IS DISTINCT FROM 'ACCEPTED' OR parent_row."reversalOf" IS NOT NULL THEN
    RAISE EXCEPTION 'cash-out reversal parent must be an original acceptance';
  END IF;
  IF NEW."tenant" IS DISTINCT FROM parent_row."tenant"
     OR NEW."wager" IS DISTINCT FROM parent_row."wager"
     OR NEW."player" IS DISTINCT FROM parent_row."player"
     OR NEW."offer" IS DISTINCT FROM parent_row."offer"
     OR NEW."amountMinor" IS DISTINCT FROM parent_row."amountMinor"
     OR NEW.currency IS DISTINCT FROM parent_row.currency
     OR NEW."portionNumerator" IS DISTINCT FROM parent_row."portionNumerator"
     OR NEW."portionDenominator" IS DISTINCT FROM parent_row."portionDenominator" THEN
    RAISE EXCEPTION 'cash-out reversal must retain parent economics and scope';
  END IF;

  SELECT "reversalOf" INTO reversal_parent
    FROM "JournalTransaction"
    WHERE id = NEW."journalTransaction";
  IF reversal_parent IS DISTINCT FROM parent_row."journalTransaction" THEN
    RAISE EXCEPTION 'cash-out reversal journal must reverse the accepted journal';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER cashout_acceptance_reversal_lineage
  BEFORE INSERT ON "CashOutAcceptance"
  FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_cashout_reversal();
