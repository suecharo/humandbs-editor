import fs from "node:fs/promises"
import type { z } from "zod/v4"

export const readJson = async <T>(filePath: string, schema: z.ZodType<T>): Promise<T> => {
  const content = await fs.readFile(filePath, "utf-8")
  const data: unknown = JSON.parse(content)

  return schema.parse(data)
}
