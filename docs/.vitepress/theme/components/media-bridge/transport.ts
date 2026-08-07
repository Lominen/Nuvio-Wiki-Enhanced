export interface JsonResponse<T = any> {
  data: T
  headers: Headers
}

export interface BridgeRequestInit extends RequestInit {
  timeoutMs?: number
  timeoutMessage?: string
}

export type AsyncLimiter = <T>(operation: () => Promise<T>) => Promise<T>

export interface RetryBridgeOperationOptions {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  signal?: AbortSignal
  shouldRetry?: (error: any) => boolean
}

const lastServiceWrite = new WeakMap<object, number>()

export function createAsyncLimiter(concurrency: number): AsyncLimiter {
  let active = 0
  const waiting: Array<() => void> = []
  return async function limit<T>(operation: () => Promise<T>): Promise<T> {
    if (active >= concurrency) await new Promise<void>(resolve => waiting.push(resolve))
    active++
    try {
      return await operation()
    } finally {
      active--
      waiting.shift()?.()
    }
  }
}

export async function waitForWriteSlot(credentials: object, minimumGapMs: number) {
  const waitMs = Math.max(
    0,
    (lastServiceWrite.get(credentials) || 0) + minimumGapMs - Date.now()
  )
  if (waitMs) await sleep(waitMs)
  lastServiceWrite.set(credentials, Date.now())
}

export function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason || new DOMException('The operation was aborted.', 'AbortError'))
      return
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timeout)
      reject(signal?.reason || new DOMException('The operation was aborted.', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function retryAfterMs(error: any): number {
  const value = String(error?.headers?.get?.('retry-after') || '').trim()
  if (!value) return 0
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, Math.round(seconds * 1000))
  const retryAt = Date.parse(value)
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - Date.now()) : 0
}

export function isTransientBridgeError(error: any): boolean {
  const status = Number(error?.status)
  return status === 408
    || status === 425
    || status === 429
    || status >= 500
    || error?.name === 'TimeoutError'
    || error?.name === 'TypeError'
}

export async function retryBridgeOperation<T>(
  operation: () => Promise<T>,
  options: RetryBridgeOperationOptions = {}
): Promise<T> {
  const retries = Math.max(0, Math.floor(options.retries ?? 2))
  const baseDelayMs = Math.max(0, Math.floor(options.baseDelayMs ?? 250))
  const maxDelayMs = Math.max(baseDelayMs, Math.floor(options.maxDelayMs ?? 2_000))
  const shouldRetry = options.shouldRetry || isTransientBridgeError

  for (let attempt = 0; ; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (attempt >= retries || options.signal?.aborted || !shouldRetry(error)) throw error
      const backoffMs = Math.min(maxDelayMs, baseDelayMs * (2 ** attempt))
      await sleep(Math.max(backoffMs, retryAfterMs(error)), options.signal)
    }
  }
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function mapLimit<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from(
    { length: Math.min(Math.max(1, concurrency), items.length) },
    () => worker()
  ))
  return results
}

export function errorDetail(data: any, statusText: string): string {
  if (data && typeof data === 'object') {
    return String(
      data.error_description
      || data.message
      || data.msg
      || data.error?.message
      || data.error
      || JSON.stringify(data)
    )
  }
  return String(data || statusText || 'Request failed')
}

function requestTimeoutError(timeoutMs: number, message?: string): Error {
  const error = new Error(message || `Request did not respond within ${timeoutMs}ms.`)
  error.name = 'TimeoutError'
  return error
}

export async function requestBridgeJson<T = any>(
  url: string,
  options: BridgeRequestInit = {}
): Promise<JsonResponse<T>> {
  const {
    timeoutMs: requestedTimeoutMs,
    timeoutMessage,
    signal: callerSignal,
    ...fetchOptions
  } = options
  const timeoutMs = Number(requestedTimeoutMs)
  const hasTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0
  const timeoutController = hasTimeout ? new AbortController() : null
  const relayCallerAbort = () => timeoutController?.abort(
    callerSignal?.reason || new DOMException('The operation was aborted.', 'AbortError')
  )
  let timeout: ReturnType<typeof setTimeout> | undefined

  if (timeoutController) {
    if (callerSignal?.aborted) relayCallerAbort()
    else callerSignal?.addEventListener('abort', relayCallerAbort, { once: true })
    timeout = setTimeout(() => {
      timeoutController.abort(requestTimeoutError(timeoutMs, timeoutMessage))
    }, timeoutMs)
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: timeoutController?.signal || callerSignal
    })
    const text = await response.text()
    let data: any = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
    if (!response.ok) {
      const error = new Error(`${response.status} ${errorDetail(data, response.statusText)}`) as Error & {
        status?: number
        body?: any
        headers?: Headers
      }
      error.status = response.status
      error.body = data
      error.headers = response.headers
      throw error
    }
    return { data: data as T, headers: response.headers }
  } catch (error) {
    if (timeoutController?.signal.aborted && timeoutController.signal.reason) {
      throw timeoutController.signal.reason
    }
    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
    callerSignal?.removeEventListener('abort', relayCallerAbort)
  }
}
