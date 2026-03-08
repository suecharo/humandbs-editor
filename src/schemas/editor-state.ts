import { z } from "zod/v4"

export const CurationStatusSchema = z.enum([
  "uncurated",
  "in-progress",
  "curated",
])
export type CurationStatus = z.infer<typeof CurationStatusSchema>

export const ResearchStateSchema = z.object({
  status: CurationStatusSchema,
  updatedAt: z.string(),
  editingBy: z.string().nullable(),
  editingByName: z.string().nullable(),
  editingAt: z.string().nullable(),
})
export type ResearchState = z.infer<typeof ResearchStateSchema>

export const DatasetStateSchema = z.object({
  status: CurationStatusSchema,
  updatedAt: z.string(),
  editingBy: z.string().nullable(),
  editingByName: z.string().nullable(),
  editingAt: z.string().nullable(),
})
export type DatasetState = z.infer<typeof DatasetStateSchema>

export const ExperimentStateSchema = z.object({
  status: CurationStatusSchema,
  updatedAt: z.string(),
})
export type ExperimentState = z.infer<typeof ExperimentStateSchema>

export const EditorStateSchema = z.object({
  researches: z.record(z.string(), ResearchStateSchema),
  datasets: z.record(z.string(), DatasetStateSchema),
  experiments: z.record(z.string(), ExperimentStateSchema),
})
export type EditorState = z.infer<typeof EditorStateSchema>
