import type { PaginationMeta } from '@/types/pagination'

export interface ApiErrorShape {
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  code: string
  details?: unknown
  status: number

  constructor(status: number, shape: ApiErrorShape) {
    super(shape.message)
    this.name = 'ApiError'
    this.code = shape.code
    this.details = shape.details
    this.status = status
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

let accessToken: string | null = null
let onSessionExpired: (() => void) | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

// Called when a request fails auth even after a refresh attempt - lets
// AuthContext reset its state without httpClient depending on React.
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

interface RequestOptions {
  method?: string
  body?: unknown
  skipAuthRetry?: boolean
}

interface Envelope {
  data: unknown
  meta?: PaginationMeta
}

// Does the actual fetch + envelope parsing, returning the full {data, meta}
// shape rather than plucking just `data` - lets callers decide what they need.
async function rawRequestFull(path: string, options: RequestOptions = {}): Promise<Envelope> {
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      // Let the browser set Content-Type (with multipart boundary) for FormData bodies.
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: isFormData ? (options.body as FormData) : options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) return { data: undefined }

  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.success) {
    const shape: ApiErrorShape = json?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
    }
    throw new ApiError(res.status, shape)
  }

  return { data: json.data, meta: json.meta }
}

// Wraps rawRequestFull with a single silent-refresh-and-retry on a 401, so
// callers never have to think about token expiry. `extract` picks what shape
// of the envelope the caller actually wants (just `data`, or `data` + `meta`).
async function withAuthRetry<T>(
  path: string,
  options: RequestOptions,
  extract: (envelope: Envelope) => T
): Promise<T> {
  try {
    return extract(await rawRequestFull(path, options))
  } catch (error) {
    const shouldRetry =
      !options.skipAuthRetry &&
      error instanceof ApiError &&
      error.code === 'UNAUTHORIZED' &&
      path !== '/auth/refresh' &&
      path !== '/auth/login'

    if (!shouldRetry) throw error

    try {
      const refreshed = await rawRequestFull('/auth/refresh', { method: 'POST', skipAuthRetry: true })
      setAccessToken((refreshed.data as { accessToken: string }).accessToken)
      return extract(await rawRequestFull(path, { ...options, skipAuthRetry: true }))
    } catch (refreshError) {
      setAccessToken(null)
      onSessionExpired?.()
      throw refreshError
    }
  }
}

function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return withAuthRetry(path, options, (envelope) => envelope.data as T)
}

function requestPaginated<T>(path: string, options: RequestOptions = {}): Promise<{ data: T[]; meta: PaginationMeta }> {
  return withAuthRetry(path, options, (envelope) => ({
    data: envelope.data as T[],
    meta: envelope.meta as PaginationMeta,
  }))
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  getPaginated: <T>(path: string) => requestPaginated<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
