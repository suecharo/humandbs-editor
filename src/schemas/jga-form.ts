import { z } from "zod/v4"

// EAV output

export const EavComponentSchema = z.object({
  key: z.string(),
  value: z.string(),
})
export type EavComponent = z.infer<typeof EavComponentSchema>

export const EavOutputSchema = z.object({
  language_type: z.union([z.literal(1), z.literal(2)]),
  components: z.array(EavComponentSchema),
})
export type EavOutput = z.infer<typeof EavOutputSchema>

// Shared form types

export const BilingualFormTextSchema = z.object({
  ja: z.string(),
  en: z.string(),
})
export type BilingualFormText = z.infer<typeof BilingualFormTextSchema>

export const CollaboratorFormSchema = z.object({
  name: z.string(),
  division: z.string(),
  job: z.string(),
  eradid: z.string(),
  orcid: z.string(),
  seminar: z.string(),
})
export type CollaboratorForm = z.infer<typeof CollaboratorFormSchema>

// J-DS

export const DataAccessSchema = z.enum([
  "submission_open",
  "submission_type1",
  "submission_type2",
])
export type DataAccess = z.infer<typeof DataAccessSchema>

export const DsDataEntryFormSchema = z.object({
  dataAccess: z.string(),
  studyType: z.string(),
  studyTypeOther: z.string(),
  target: z.string(),
  fileFormat: z.string(),
  fileSize: z.string(),
})
export type DsDataEntryForm = z.infer<typeof DsDataEntryFormSchema>

export const DeIdentificationStatusSchema = z.enum([
  "completed",
  "scheduled",
  "unnecessary",
])
export type DeIdentificationStatus = z.infer<typeof DeIdentificationStatusSchema>

export const DsFormDataSchema = z.object({
  languageType: z.union([z.literal(1), z.literal(2)]),
  // 研究内容
  studyTitle: BilingualFormTextSchema,
  aim: BilingualFormTextSchema,
  method: BilingualFormTextSchema,
  participant: BilingualFormTextSchema,
  publication: z.string(),
  icd10: z.string(),
  // データ
  data: z.array(DsDataEntryFormSchema),
  restriction: BilingualFormTextSchema,
  releaseDate: z.string(),
  // 倫理審査
  nbdcGuidelineStatus: z.string(),
  deIdentificationStatus: z.string(),
  deIdentificationDate: z.string(),
  deIdentificationReason: z.string(),
  submissionReviewStatus: z.string(),
  submissionReviewDate: z.string(),
  companyUseStatus: z.string(),
  multicenterStatus: z.string(),
  nbdcDataProcessingStatus: z.string(),
  nbdcDataProcessingReason: z.string(),
  // 研究分担者
  collaborators: z.array(CollaboratorFormSchema),
})
export type DsFormData = z.infer<typeof DsFormDataSchema>

// J-DU

export const ServerLocationSchema = z.enum(["onpre", "offpre", "both"])
export type ServerLocation = z.infer<typeof ServerLocationSchema>

export const OffPremiseServerSchema = z.enum(["nig", "tombo", "hgc", "kog", "oasis"])
export type OffPremiseServer = z.infer<typeof OffPremiseServerSchema>

export const UseDatasetFormSchema = z.object({
  request: z.string(),
  purpose: z.string(),
})
export type UseDatasetForm = z.infer<typeof UseDatasetFormSchema>

export const MemberFormSchema = z.object({
  firstNameEn: z.string(),
  middleNameEn: z.string(),
  lastNameEn: z.string(),
  email: z.string(),
  institutionEn: z.string(),
  divisionEn: z.string(),
  jobEn: z.string(),
  eradid: z.string(),
  orcid: z.string(),
})
export type MemberForm = z.infer<typeof MemberFormSchema>

export const UseReviewStatusSchema = z.enum([
  "completed",
  "notyet",
  "unnecessary",
])
export type UseReviewStatus = z.infer<typeof UseReviewStatusSchema>

export const DuFormDataSchema = z.object({
  languageType: z.union([z.literal(1), z.literal(2)]),
  studyTitle: BilingualFormTextSchema,
  useSummary: z.string(),
  guidelineStatus: z.string(),
  usePublication: z.string(),
  useDatasets: z.array(UseDatasetFormSchema),
  usePeriodStart: z.string(),
  usePeriodEnd: z.string(),
  useReviewStatus: z.string(),
  useReviewDate: z.string(),
  serverStatus: z.string(),
  offPremiseStatus: z.array(OffPremiseServerSchema),
  isOffPremiseStatement: z.boolean(),
  acknowledgmentStatus: z.string(),
  collaborators: z.array(CollaboratorFormSchema),
})
export type DuFormData = z.infer<typeof DuFormDataSchema>

// Default factories

export const createDefaultBilingualFormText = (): BilingualFormText => ({
  ja: "",
  en: "",
})

export const createDefaultCollaborator = (): CollaboratorForm => ({
  name: "",
  division: "",
  job: "",
  eradid: "",
  orcid: "",
  seminar: "",
})

export const createDefaultDsDataEntry = (): DsDataEntryForm => ({
  dataAccess: "",
  studyType: "",
  studyTypeOther: "",
  target: "",
  fileFormat: "",
  fileSize: "",
})

export const createDefaultUseDataset = (): UseDatasetForm => ({
  request: "",
  purpose: "",
})

export const createDefaultMember = (): MemberForm => ({
  firstNameEn: "",
  middleNameEn: "",
  lastNameEn: "",
  email: "",
  institutionEn: "",
  divisionEn: "",
  jobEn: "",
  eradid: "",
  orcid: "",
})

export const createDefaultDsFormData = (): DsFormData => ({
  languageType: 1,
  studyTitle: createDefaultBilingualFormText(),
  aim: createDefaultBilingualFormText(),
  method: createDefaultBilingualFormText(),
  participant: createDefaultBilingualFormText(),
  publication: "",
  icd10: "",
  data: [],
  restriction: createDefaultBilingualFormText(),
  releaseDate: "",
  nbdcGuidelineStatus: "",
  deIdentificationStatus: "",
  deIdentificationDate: "",
  deIdentificationReason: "",
  submissionReviewStatus: "",
  submissionReviewDate: "",
  companyUseStatus: "",
  multicenterStatus: "",
  nbdcDataProcessingStatus: "",
  nbdcDataProcessingReason: "",
  collaborators: [],
})

export const createDefaultDuFormData = (): DuFormData => ({
  languageType: 1,
  studyTitle: createDefaultBilingualFormText(),
  useSummary: "",
  guidelineStatus: "",
  usePublication: "",
  useDatasets: [],
  usePeriodStart: "",
  usePeriodEnd: "",
  useReviewStatus: "",
  useReviewDate: "",
  serverStatus: "",
  offPremiseStatus: [],
  isOffPremiseStatement: false,
  acknowledgmentStatus: "",
  collaborators: [],
})
