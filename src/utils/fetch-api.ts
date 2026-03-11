import type { z } from "zod/v4"

export class ConflictError extends Error {
  readonly path: string
  readonly body: unknown

  constructor(path: string, body: unknown) {
    super(`Conflict: ${path}`)
    this.name = "ConflictError"
    this.path = path
    this.body = body
  }
}

export interface FetchApiResult<T> {
  data: T
  headers: Headers
}

export const fetchApi = async <T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(path, init)
  if (res.status === 409) {
    const body: unknown = await res.json()
    throw new ConflictError(path, body)
  }
  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`)
  }
  const data: unknown = await res.json()

  return schema.parse(data)
}

export const fetchApiWithHeaders = async <T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<FetchApiResult<T>> => {
  const res = await fetch(path, init)
  if (res.status === 409) {
    const body: unknown = await res.json()
    throw new ConflictError(path, body)
  }
  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`)
  }
  const data: unknown = await res.json()

  return { data: schema.parse(data), headers: res.headers }
}
