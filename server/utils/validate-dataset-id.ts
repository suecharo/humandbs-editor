import type { Response } from "express"
import { z } from "zod/v4"

export const DatasetKeySchema = z.string().regex(/^.+-(v\d+)$/)

export const parseDatasetKey = (raw: string, res: Response): { datasetId: string; version: string; fileKey: string } | null => {
  const result = DatasetKeySchema.safeParse(raw)
  if (!result.success) {
    res.status(400).json({ error: "Invalid dataset key format" })

    return null
  }

  const match = raw.match(/^(.+)-(v\d+)$/)
  if (!match) {
    res.status(400).json({ error: "Invalid dataset key format" })

    return null
  }

  const [, datasetId, version] = match
  if (!datasetId || !version) {
    res.status(400).json({ error: "Invalid dataset key format" })

    return null
  }

  return { datasetId, version, fileKey: raw }
}
