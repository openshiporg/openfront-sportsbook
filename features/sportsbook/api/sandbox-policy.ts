export function assertSandboxRuntime(){
 if(process.env.SPORTSBOOK_SANDBOX!=='true')throw new Error('SANDBOX_DISABLED')
 if(process.env.NODE_ENV==='production'){
  const origin=process.env.SANDBOX_PUBLIC_ORIGIN??''
  const database=process.env.DATABASE_URL??''
  if(process.env.SPORTSBOOK_DEPLOYMENT_MODE!=='sandbox'||!/^https:\/\/[a-z0-9-]+\.local(?::\d+)?$/i.test(origin)||!/(?:ephemeral|sandbox|validation|test)[_/?]/i.test(`${database}/`))throw new Error('SANDBOX_ISOLATION_REQUIRED')
 }
}
export function assertSameOrigin(request:Request){const configured=process.env.SANDBOX_PUBLIC_ORIGIN;const origin=request.headers.get('origin');if(configured&&origin!==configured)throw new Error('ORIGIN_DENIED');const fetchSite=request.headers.get('sec-fetch-site');if(fetchSite&&fetchSite!=='same-origin'&&fetchSite!=='none')throw new Error('ORIGIN_DENIED')}
