const required=['DATABASE_URL','SESSION_SECRET'] as const
const missing=required.filter(key=>!process.env[key])
if((process.env.SESSION_SECRET?.length??0)<32)missing.push('SESSION_SECRET')
const sandbox=process.env.SPORTSBOOK_SANDBOX==='true'
if(process.env.NODE_ENV==='production'&&(process.env.CUSTOMER_IDENTITY_SECRET?.length??0)<32)throw new Error('Production requires CUSTOMER_IDENTITY_SECRET')
if(process.env.NODE_ENV==='production'&&sandbox){
 const origin=process.env.SANDBOX_PUBLIC_ORIGIN??''
 const database=process.env.DATABASE_URL??''
 if(process.env.SPORTSBOOK_DEPLOYMENT_MODE!=='sandbox')throw new Error('Production sandbox requires SPORTSBOOK_DEPLOYMENT_MODE=sandbox')
 if(!/^https:\/\/[a-z0-9-]+\.local(?::\d+)?$/i.test(origin))throw new Error('Production sandbox requires a .local SANDBOX_PUBLIC_ORIGIN')
 if(!/(?:ephemeral|sandbox|validation|test)[_/?]/i.test(`${database}/`))throw new Error('Production sandbox requires an isolated sandbox/test database')
}
if(process.env.NODE_ENV==='production'&&process.env.ENABLE_SANDBOX_WEBHOOKS==='true'&&!sandbox)throw new Error('Sandbox webhooks require isolated sandbox mode')
// Integrations (mail, audit anchoring, telemetry, webhooks, KMS) are not process boot
// requirements: each capability fails closed where it is used, and /api/ready reports
// production readiness gaps (anchoring, RLS) without preventing an operator signing in.
if(missing.length)throw new Error(`Missing/invalid environment: ${[...new Set(missing)].join(', ')}`)
process.stdout.write(JSON.stringify({status:'valid',deploymentMode:sandbox?'sandbox':'production'})+'\n')
