import type { z } from "zod/v4"

export const fetchApi = async <T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(path, init)
  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`)
  }
  const data: unknown = await res.json()

  return schema.parse(data)
}
