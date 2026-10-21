-- Apply the newly committed enum value in a separate migration transaction.
ALTER TABLE "Wager" ALTER COLUMN "status" SET DEFAULT 'PENDING';
