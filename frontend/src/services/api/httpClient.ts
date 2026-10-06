import { env } from '@/config/env'

/** A non-2xx response. `status` is 0 when the server could not be reached. */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/** Small fetch wrapper: JSON in, JSON out, errors as HttpError. No axios needed. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers })
  } catch {
    throw new HttpError(0, 'Network error')
  }

  if (!response.ok) throw new HttpError(response.status, response.statusText || 'Request failed')
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
