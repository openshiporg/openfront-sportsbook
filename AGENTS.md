
NEVER build outbox/texting/email notification machinery or cron/worker services. External events = Openfront Commerce webhooks (features/webhooks) only. Time-based state is computed on read or advanced idempotently on the request that touches it (see `advanceOperatorClock`), or by a staff button.
