const required=['DATABASE_URL','SESSION_SECRET'] as const
const missing:string[]=required.filter(key=>!process.env[key])
if((process.env.SESSION_SECRET?.length??0)<32)missing.push('SESSION_SECRET')
// CUSTOMER_IDENTITY_SECRET is optional: without it the customer identity key is derived from SESSION_SECRET (domain-separated).
// Integrations (mail, audit anchoring, telemetry, webhooks, KMS) are not process boot
// requirements: each capability fails closed where it is used, and /api/ready reports
// production readiness gaps (anchoring, RLS) without preventing an operator signing in.
if(missing.length)throw new Error(`Missing/invalid environment: ${[...new Set(missing)].join(', ')}`)
process.stdout.write(JSON.stringify({status:'valid'})+'\n')
