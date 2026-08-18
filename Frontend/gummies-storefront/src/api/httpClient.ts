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

interface RequestOptions {
  method?: string
  body?: unknown
}

interface Envelope {
  data: unknown
  meta?: PaginationMeta
}

// Every endpoint the storefront calls is either public or a stateless guest
// action (checkout, order lookup) - no bearer token or refresh loop needed,
// unlike the admin app's httpClient.
async function rawRequest(path: string, options: RequestOptions = {}): Promise<Envelope> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
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

function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return rawRequest(path, options).then((envelope) => envelope.data as T)
}

function requestPaginated<T>(path: string, options: RequestOptions = {}): Promise<{ data: T[]; meta: PaginationMeta }> {
  return rawRequest(path, options).then((envelope) => ({
    data: envelope.data as T[],
    meta: envelope.meta as PaginationMeta,
  }))
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  getPaginated: <T>(path: string) => requestPaginated<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
}
