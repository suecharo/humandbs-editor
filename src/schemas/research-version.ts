import { z } from "zod/v4"

import { BilingualTextValueSchema } from "./common"

export const DatasetRefSchema = z.object({
  datasetId: z.string(),
  version: z.string(),
})
export type DatasetRef = z.infer<typeof DatasetRefSchema>

export const ResearchVersionSchema = z.object({
  humId: z.string(),
  humVersionId: z.string(),
  version: z.string(),
  versionReleaseDate: z.string(),
  datasets: z.array(DatasetRefSchema),
  releaseNote: BilingualTextValueSchema,
})
export type ResearchVersion = z.infer<typeof ResearchVersionSchema>
