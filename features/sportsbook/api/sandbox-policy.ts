export function assertOperatorReady(tenantId: string, request?: Request) {
  void tenantId; void request
  throw new Error('OPERATOR_NOT_LICENSED')
}
export function assertSandboxRuntime() { throw new Error('OPERATOR_NOT_LICENSED') }
export function assertSameOrigin(request: Request) {
 const configured=process.env.SANDBOX_PUBLIC_ORIGIN;const origin=request.headers.get('origin');if(configured&&origin!==configured)throw new Error('ORIGIN_DENIED');const fetchSite=request.headers.get('sec-fetch-site');if(fetchSite&&fetchSite!=='same-origin'&&fetchSite!=='none')throw new Error('ORIGIN_DENIED')
}
