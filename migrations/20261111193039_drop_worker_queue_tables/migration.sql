/*
  Warnings:

  - You are about to drop the column `outboxMessage` on the `WebhookDelivery` table. All the data in the column will be lost.
  - You are about to drop the `DeadLetter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutboxMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduledJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkerHeartbeat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeadLetter" DROP CONSTRAINT "DeadLetter_tenant_fkey";

-- DropForeignKey
ALTER TABLE "OutboxMessage" DROP CONSTRAINT "OutboxMessage_tenant_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledJob" DROP CONSTRAINT "ScheduledJob_tenant_fkey";

-- DropForeignKey
ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_outboxMessage_fkey";

-- DropIndex
DROP INDEX "WebhookDelivery_outboxMessage_idx";

-- AlterTable
ALTER TABLE "WebhookDelivery" DROP COLUMN "outboxMessage";

-- DropTable
DROP TABLE "DeadLetter";

-- DropTable
DROP TABLE "OutboxMessage";

-- DropTable
DROP TABLE "ScheduledJob";

-- DropTable
DROP TABLE "WorkerHeartbeat";

-- DropEnum
DROP TYPE "OutboxMessageStatusType";

-- DropEnum
DROP TYPE "ScheduledJobStatusType";

-- DropEnum
DROP TYPE "ScheduledJobTypeType";

-- DropEnum
DROP TYPE "WorkerHeartbeatStatusType";
