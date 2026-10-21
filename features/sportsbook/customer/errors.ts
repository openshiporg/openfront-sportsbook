import { assertSameOrigin, assertSandboxRuntime } from '../api/sandbox-policy'

export class CustomerError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(code)
    this.name = 'CustomerError'
  }
}

export function assertSandboxEnabled() {
  try {
    assertSandboxRuntime()
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SANDBOX_DISABLED'
    throw new CustomerError(code, code === 'SANDBOX_DISABLED' ? 404 : 503)
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof CustomerError) {
    return Response.json(
      { error: error.code, code: error.code, ...(error.details ?? {}) },
      { status: error.status, headers: { 'cache-control': 'no-store' } },
    )
  }
  console.error('Customer sportsbook request failed',{name:error instanceof Error?error.name:'UnknownError'})
  return Response.json(
    { error: 'REQUEST_FAILED', code: 'REQUEST_FAILED' },
    { status: 500, headers: { 'cache-control': 'no-store' } },
  )
}

export function assertCustomerMutationRequest(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 32_768) {
    throw new CustomerError('PAYLOAD_TOO_LARGE', 413)
  }

  try {
    assertSameOrigin(request)
  } catch {
    throw new CustomerError('ORIGIN_DENIED', 403)
  }

  const origin = request.headers.get('origin')
  if (origin && !process.env.SANDBOX_PUBLIC_ORIGIN && origin !== new URL(request.url).origin) {
    throw new CustomerError('ORIGIN_DENIED', 403)
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (contentLength > 0 && !contentType.toLowerCase().startsWith('application/json')) {
    throw new CustomerError('JSON_REQUIRED', 415)
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  try {
    if (!request.body) throw new CustomerError('INVALID_REQUEST', 400)
    const reader = request.body.getReader(), chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > 32_768) { await reader.cancel(); throw new CustomerError('PAYLOAD_TOO_LARGE', 413) }
      chunks.push(value)
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CustomerError('INVALID_REQUEST', 400)
    return value as Record<string, unknown>
  } catch (error) {
    if (error instanceof CustomerError) throw error
    throw new CustomerError('INVALID_JSON', 400)
  }
}
