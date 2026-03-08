import { z } from "zod/v4"

import {
  BilingualTextSchema,
  BilingualTextValueSchema,
  BilingualUrlValueSchema,
  PeriodOfDataUseSchema,
  TextValueSchema,
  UrlValueSchema,
} from "./common"

export const GrantSchema = z.object({
  id: z.array(z.string()),
  title: BilingualTextSchema,
  agency: z.object({ name: BilingualTextSchema }),
})
export type Grant = z.infer<typeof GrantSchema>

export const PublicationSchema = z.object({
  title: BilingualTextSchema,
  doi: z.string().nullable().optional(),
  datasetIds: z.array(z.string()).optional(),
})
export type Publication = z.infer<typeof PublicationSchema>

export const PersonSchema = z.object({
  name: BilingualTextValueSchema,
  email: z.string().nullable().optional(),
  orcid: z.string().nullable().optional(),
  organization: z.object({
    name: BilingualTextValueSchema,
    address: z.object({
      country: z.string().nullable().optional(),
    }).nullable().optional(),
  }).nullable().optional(),
  datasetIds: z.array(z.string()).optional(),
  researchTitle: BilingualTextSchema.optional(),
  periodOfDataUse: PeriodOfDataUseSchema.nullable().optional(),
})
export type Person = z.infer<typeof PersonSchema>

export const ResearchProjectSchema = z.object({
  name: BilingualTextValueSchema,
  url: BilingualUrlValueSchema.nullable().optional(),
})
export type ResearchProject = z.infer<typeof ResearchProjectSchema>

export const SummarySchema = z.object({
  aims: BilingualTextValueSchema,
  methods: BilingualTextValueSchema,
  targets: BilingualTextValueSchema,
  url: z.object({
    ja: z.array(UrlValueSchema),
    en: z.array(UrlValueSchema),
  }),
  footers: z.object({
    ja: z.array(TextValueSchema),
    en: z.array(TextValueSchema),
  }),
})
export type Summary = z.infer<typeof SummarySchema>

export const ResearchSchema = z.object({
  humId: z.string(),
  url: BilingualTextSchema,
  title: BilingualTextSchema,
  summary: SummarySchema,
  dataProvider: z.array(PersonSchema),
  researchProject: z.array(ResearchProjectSchema),
  grant: z.array(GrantSchema),
  relatedPublication: z.array(PublicationSchema),
  controlledAccessUser: z.array(PersonSchema),
  versionIds: z.array(z.string()),
  latestVersion: z.string(),
  datePublished: z.string(),
  dateModified: z.string(),
})
export type Research = z.infer<typeof ResearchSchema>

export const ResearchListItemSchema = z.object({
  humId: z.string(),
  title: BilingualTextSchema,
  datasetCount: z.number(),
  datasetIds: z.array(z.string()),
  versionCount: z.number(),
  accessRestrictions: z.array(z.string()),
  curationStatus: z.string(),
  datePublished: z.string(),
  dateModified: z.string(),
})
export type ResearchListItem = z.infer<typeof ResearchListItemSchema>
