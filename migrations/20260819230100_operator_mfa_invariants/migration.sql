ALTER TABLE "User" ADD CONSTRAINT "User_operator_mfa_check" CHECK (
  "operatorMfaFailedAttempts" >= 0
  AND ("operatorMfaSecret" IS NULL OR "operatorMfaSecret" ~ '^totp:v1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$')
  AND ("operatorMfaEnabled" = false OR ("operatorMfaSecret" IS NOT NULL AND "operatorMfaEnrolledAt" IS NOT NULL))
);
