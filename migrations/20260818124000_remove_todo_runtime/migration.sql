-- Remove obsolete starter-only authorization columns after Todo runtime models were retired.
ALTER TABLE "Role" DROP COLUMN IF EXISTS "canCreateTodos",
                   DROP COLUMN IF EXISTS "canManageAllTodos";
-- Historical starter tables are intentionally retained to avoid destructive data loss on upgrades.
