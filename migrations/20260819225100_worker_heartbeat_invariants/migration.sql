ALTER TABLE "WorkerHeartbeat" ADD CONSTRAINT "WorkerHeartbeat_state_check" CHECK (
  "heartbeatAt" >= "startedAt" AND length("workerId") >= 8 AND length("buildVersion") > 0
  AND ((status='STOPPED' AND "stoppedAt" IS NOT NULL) OR status IN ('STARTING','READY','STOPPING'))
);
