-- Canonical Openfront onboarding state for dashboard resume/routing.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStatus" TEXT DEFAULT 'not_started';

-- Existing tenant-assigned operators already completed the lifecycle before this field existed.
UPDATE "User" SET "onboardingStatus"='completed' WHERE tenant IS NOT NULL AND "onboardingStatus"='not_started';

ALTER TABLE "User" ADD CONSTRAINT "User_onboarding_status_check" CHECK ("onboardingStatus" IS NULL OR "onboardingStatus" IN ('not_started','in_progress','completed','dismissed')) NOT VALID;
ALTER TABLE "User" VALIDATE CONSTRAINT "User_onboarding_status_check";
