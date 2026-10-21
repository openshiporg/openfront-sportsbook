export const MAX_WEBHOOK_BODY_BYTES = 1_000_000

export type WebhookBodyErrorCode = 'PAYLOAD_TOO_LARGE' | 'MALFORMED_BODY' | 'UNREADABLE_BODY'

export class WebhookBodyError extends Error {
  constructor(readonly code: WebhookBodyErrorCode) {
    super(code)
    this.name = 'WebhookBodyError'
  }
}

function cancelStreamSafely(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return
  try {
    void stream.cancel().catch(() => undefined)
  } catch {
    // A locked or already errored request stream is still rejected by the caller.
  }
}

function cancelReaderSafely(reader: ReadableStreamDefaultReader<Uint8Array>) {
  try {
    void reader.cancel().catch(() => undefined)
  } catch {
    // Cancellation is best-effort; the body read remains fail-closed.
  }
}

export async function readBoundedWebhookBody(request: Request): Promise<Uint8Array> {
  const contentLength = request.headers.get('content-length')
  let declaredLength: bigint | null = null

  if (contentLength !== null) {
    const normalizedLength = contentLength.trim()
    if (!/^\d+$/.test(normalizedLength)) {
      cancelStreamSafely(request.body)
      throw new WebhookBodyError('MALFORMED_BODY')
    }

    try {
      declaredLength = BigInt(normalizedLength)
    } catch {
      cancelStreamSafely(request.body)
      throw new WebhookBodyError('MALFORMED_BODY')
    }

    if (declaredLength > BigInt(MAX_WEBHOOK_BODY_BYTES)) {
      cancelStreamSafely(request.body)
      throw new WebhookBodyError('PAYLOAD_TOO_LARGE')
    }
  }

  const body = request.body
  if (!body) {
    if (declaredLength !== null && declaredLength !== 0n) throw new WebhookBodyError('MALFORMED_BODY')
    return new Uint8Array(0)
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>
  try {
    reader = body.getReader()
  } catch {
    cancelStreamSafely(body)
    throw new WebhookBodyError('UNREADABLE_BODY')
  }

  let buffer = new Uint8Array(0)
  let totalBytes = 0
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      if (!(result.value instanceof Uint8Array)) throw new WebhookBodyError('UNREADABLE_BODY')
      if (result.value.byteLength > MAX_WEBHOOK_BODY_BYTES - totalBytes) {
        throw new WebhookBodyError('PAYLOAD_TOO_LARGE')
      }
      const nextTotal = totalBytes + result.value.byteLength
      if (nextTotal > buffer.byteLength) {
        let capacity = Math.max(16_384, buffer.byteLength)
        while (capacity < nextTotal) capacity = Math.min(MAX_WEBHOOK_BODY_BYTES, capacity * 2)
        const expanded = new Uint8Array(capacity)
        expanded.set(buffer.subarray(0, totalBytes))
        buffer = expanded
      }
      buffer.set(result.value, totalBytes)
      totalBytes = nextTotal
    }
  } catch (error) {
    cancelReaderSafely(reader)
    if (error instanceof WebhookBodyError) throw error
    throw new WebhookBodyError('UNREADABLE_BODY')
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // Keep cleanup best-effort if the underlying stream has already failed.
    }
  }

  if (declaredLength !== null && BigInt(totalBytes) !== declaredLength) {
    throw new WebhookBodyError('MALFORMED_BODY')
  }

  return buffer.subarray(0, totalBytes)
}
