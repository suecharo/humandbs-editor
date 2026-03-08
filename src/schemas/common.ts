import { z } from "zod/v4"

export const TextValueSchema = z.object({
  text: z.string(),
  rawHtml: z.string(),
})
export type TextValue = z.infer<typeof TextValueSchema>

export const UrlValueSchema = z.object({
  text: z.string(),
  url: z.string(),
})
export type UrlValue = z.infer<typeof UrlValueSchema>

export const BilingualTextSchema = z.object({
  ja: z.string().nullable(),
  en: z.string().nullable(),
})
export type BilingualText = z.infer<typeof BilingualTextSchema>

export const BilingualTextValueSchema = z.object({
  ja: TextValueSchema.nullable(),
  en: TextValueSchema.nullable(),
})
export type BilingualTextValue = z.infer<typeof BilingualTextValueSchema>

export const BilingualUrlValueSchema = z.object({
  ja: UrlValueSchema.nullable(),
  en: UrlValueSchema.nullable(),
})
export type BilingualUrlValue = z.infer<typeof BilingualUrlValueSchema>

export const PeriodOfDataUseSchema = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
})
export type PeriodOfDataUse = z.infer<typeof PeriodOfDataUseSchema>

export const CriteriaCanonicalSchema = z.enum([
  "Controlled-access (Type I)",
  "Controlled-access (Type II)",
  "Unrestricted-access",
])
export type CriteriaCanonical = z.infer<typeof CriteriaCanonicalSchema>

export const PolicyCanonicalSchema = z.enum([
  "nbdc-policy",
  "company-limitation-policy",
  "cancer-research-policy",
  "familial-policy",
  "custom-policy",
])
export type PolicyCanonical = z.infer<typeof PolicyCanonicalSchema>

export const NormalizedPolicySchema = z.object({
  id: PolicyCanonicalSchema,
  name: z.object({ ja: z.string(), en: z.string() }),
  url: z.string().nullable(),
})
export type NormalizedPolicy = z.infer<typeof NormalizedPolicySchema>
