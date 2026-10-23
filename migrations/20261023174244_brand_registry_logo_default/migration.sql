/*
  Warnings:

  - The primary key for the `_Team_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_Team_members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "logoIcon" SET DEFAULT '<svg fill="none" height="100%" viewBox="0 0 36 48" width="100%" xmlns="http://www.w3.org/2000/svg"><g fill="#155eef"><path d="m0 7.5h28.8c2.5202 0 3.7804 0 4.743.49047.8467.43143 1.5351 1.11984 1.9665 1.96657.4905.96256.4905 2.22276.4905 4.74296v1.8h-28.8c-2.52024 0-3.78035 0-4.74296-.4905-.84673-.4314-1.535139-1.1198-1.966569-1.9665-.490471-.9626-.490471-2.2228-.490471-4.743z"/><path d="m0 28.5h28.8c2.5202 0 3.7804 0 4.743-.4905.8467-.4314 1.5351-1.1198 1.9665-1.9665.4905-.9626.4905-2.2228.4905-4.743v-1.8h-28.8c-2.52024 0-3.78035 0-4.74296.4905-.84673.4314-1.535139 1.1198-1.966569 1.9665-.490471.9626-.490471 2.2228-.490471 4.743z"/><path d="m14 31.5h14.8c2.5202 0 3.7804 0 4.743.4905.8467.4314 1.5351 1.1198 1.9665 1.9665.4905.9626.4905 2.2228.4905 4.743v1.8h-14.8c-2.5202 0-3.7804 0-4.743-.4905-.8467-.4314-1.5351-1.1198-1.9665-1.9665-.4905-.9626-.4905-2.2228-.4905-4.743z"/></g></svg>';

-- AlterTable
ALTER TABLE "_Team_members" DROP CONSTRAINT "_Team_members_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_Team_members_AB_unique" ON "_Team_members"("A", "B");
