import { z } from "zod/v4"

import {
  BilingualTextSchema,
  BilingualTextValueSchema,
  CriteriaCanonicalSchema,
  NormalizedPolicySchema,
  TextValueSchema,
} from "./common"

// Enums
export const SubjectCountTypeSchema = z.enum(["individual", "sample", "mixed"])
export type SubjectCountType = z.infer<typeof SubjectCountTypeSchema>

export const HealthStatusSchema = z.enum(["healthy", "affected", "mixed"])
export type HealthStatus = z.infer<typeof HealthStatusSchema>

export const ReadTypeSchema = z.enum(["single-end", "paired-end", "mixed"])
export type ReadType = z.infer<typeof ReadTypeSchema>

export const SexSchema = z.enum(["male", "female", "mixed"])
export type Sex = z.infer<typeof SexSchema>

export const AgeGroupSchema = z.enum(["infant", "child", "adult", "elderly", "mixed"])
export type AgeGroup = z.infer<typeof AgeGroupSchema>

export const IsTumorSchema = z.enum(["tumor", "normal", "mixed"])
export type IsTumor = z.infer<typeof IsTumorSchema>

// Objects
export const DiseaseInfoSchema = z.object({
  label: z.string(),
  icd10: z.string().nullable(),
})
export type DiseaseInfo = z.infer<typeof DiseaseInfoSchema>

export const PlatformInfoSchema = z.object({
  vendor: z.string().nullable(),
  model: z.string().nullable(),
})
export type PlatformInfo = z.infer<typeof PlatformInfoSchema>

export const VariantCountsSchema = z.object({
  snv: z.number().nullable(),
  indel: z.number().nullable(),
  cnv: z.number().nullable(),
  sv: z.number().nullable(),
  total: z.number().nullable(),
})
export type VariantCounts = z.infer<typeof VariantCountsSchema>

// Searchable fields
export const SearchableExperimentFieldsSchema = z.object({
  subjectCount: z.number().nullable(),
  subjectCountType: SubjectCountTypeSchema.nullable(),
  healthStatus: HealthStatusSchema.nullable(),
  diseases: z.array(DiseaseInfoSchema),
  tissues: z.array(z.string()),
  isTumor: IsTumorSchema.nullable(),
  cellLine: z.array(z.string()),
  population: z.array(z.string()),
  sex: SexSchema.nullable(),
  ageGroup: AgeGroupSchema.nullable(),
  assayType: z.array(z.string()),
  libraryKits: z.array(z.string()),
  platforms: z.array(PlatformInfoSchema),
  readType: ReadTypeSchema.nullable(),
  readLength: z.number().nullable(),
  sequencingDepth: z.number().nullable(),
  targetCoverage: z.number().nullable(),
  referenceGenome: z.array(z.string()),
  variantCounts: VariantCountsSchema.nullable(),
  hasPhenotypeData: z.boolean().nullable(),
  targets: z.string().nullable(),
  fileTypes: z.array(z.string()),
  processedDataTypes: z.array(z.string()),
  dataVolumeGb: z.number().nullable(),
  policies: z.array(NormalizedPolicySchema),
})
export type SearchableExperimentFields = z.infer<typeof SearchableExperimentFieldsSchema>

// Experiment
export const ExperimentSchema = z.object({
  header: BilingualTextValueSchema,
  data: z.record(z.string(), BilingualTextValueSchema.nullable()),
  footers: z.object({
    ja: z.array(TextValueSchema),
    en: z.array(TextValueSchema),
  }),
  searchable: SearchableExperimentFieldsSchema.optional(),
})
export type Experiment = z.infer<typeof ExperimentSchema>

// Dataset
export const DatasetSchema = z.object({
  datasetId: z.string(),
  version: z.string(),
  versionReleaseDate: z.string(),
  humId: z.string(),
  humVersionId: z.string(),
  releaseDate: z.string(),
  criteria: CriteriaCanonicalSchema,
  typeOfData: BilingualTextSchema,
  experiments: z.array(ExperimentSchema),
})
export type Dataset = z.infer<typeof DatasetSchema>

// GET /api/datasets response
export const AllDatasetIdsResponseSchema = z.object({
  datasetIds: z.array(z.string()),
})
export type AllDatasetIdsResponse = z.infer<typeof AllDatasetIdsResponseSchema>

// POST body
export const CreateDatasetBodySchema = z.object({
  datasetId: z.string().min(1),
  version: z.string().min(1),
  humId: z.string().min(1),
  humVersionId: z.string().min(1),
  criteria: CriteriaCanonicalSchema,
  typeOfData: BilingualTextSchema,
})
export type CreateDatasetBody = z.infer<typeof CreateDatasetBodySchema>
