import type { Response } from "express"
import { z } from "zod/v4"

export const HumIdSchema = z.string().regex(/^hum\d+$/)

/**
 * Parse and validate humId from request params.
 * Sends a 400 response and returns null if invalid.
 */
export const parseHumId = (raw: string, res: Response): string | null => {
  const result = HumIdSchema.safeParse(raw)
  if (!result.success) {
    res.status(400).json({ error: "Invalid humId format" })

    return null
  }

  return result.data
}
