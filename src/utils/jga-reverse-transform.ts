/**
 * JGA 申請フォームの friendly 形式 -> EAV (Entity-Attribute-Value) 形式への逆変換。
 * humandbs backend の reverse-transform.ts から適応。
 * ポータル側で入力するフィールドのみを対象とする。
 */
import type {
  BilingualFormText,
  CollaboratorForm,
  DsDataEntryForm,
  DsFormData,
  DuFormData,
  EavComponent,
  EavOutput,
  UseDatasetForm,
} from "@/schemas/jga-form"

// Helpers

const toNullable = (s: string): string | null => (s === "" ? null : s)

const pushComponent = (
  components: EavComponent[],
  key: string,
  value: string,
): void => {
  const v = toNullable(value)
  if (v != null) {
    components.push({ key, value: v })
  }
}

const pushBilingual = (
  components: EavComponent[],
  baseKey: string,
  text: BilingualFormText,
): void => {
  pushComponent(components, baseKey, text.ja)
  pushComponent(components, `${baseKey}_en`, text.en)
}

// MultiValue group builders
// multiValue フィールドはインデックス整合性を保つため、個々のフィールドの空文字はスキップせず保持する
// ただし全フィールドが空文字のエントリは丸ごとスキップする (同一インデックスを全プロパティから除外)

const pushMultiValueComponent = (
  components: EavComponent[],
  key: string,
  value: string,
): void => {
  components.push({ key, value })
}

const isAllEmpty = (obj: Record<string, string>): boolean =>
  Object.values(obj).every((v) => v === "")

const reverseCollaborators = (
  collaborators: CollaboratorForm[],
): EavComponent[] => {
  const filled = collaborators.filter((c) => !isAllEmpty(c))
  const components: EavComponent[] = []
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_name", c.name)
  }
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_division", c.division)
  }
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_job", c.job)
  }
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_eradid", c.eradid)
  }
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_orcid", c.orcid)
  }
  for (const c of filled) {
    pushMultiValueComponent(components, "collaborator_seminar", c.seminar)
  }

  return components
}

const reverseDataGroup = (data: DsDataEntryForm[]): EavComponent[] => {
  const filled = data.filter((d) => !isAllEmpty(d))
  const components: EavComponent[] = []
  for (const d of filled) {
    pushMultiValueComponent(components, "data_access", d.dataAccess)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "study_type", d.studyType)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "study_type_other", d.studyTypeOther)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "target", d.target)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "file_format", d.fileFormat)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "file_size", d.fileSize)
  }

  return components
}

const reverseUseDatasets = (datasets: UseDatasetForm[]): EavComponent[] => {
  const filled = datasets.filter((d) => !isAllEmpty(d))
  const components: EavComponent[] = []
  for (const d of filled) {
    pushMultiValueComponent(components, "use_dataset_request", d.request)
  }
  for (const d of filled) {
    pushMultiValueComponent(components, "use_dataset_purpose", d.purpose)
  }

  return components
}

// Application builders

const reverseDsComponents = (form: DsFormData): EavComponent[] => {
  const components: EavComponent[] = []

  // 研究内容
  pushBilingual(components, "submission_study_title", form.studyTitle)
  pushBilingual(components, "aim", form.aim)
  pushBilingual(components, "method", form.method)
  pushBilingual(components, "participant", form.participant)
  pushComponent(components, "submission_publication", form.publication)
  pushComponent(components, "icd10", form.icd10)

  // データ
  components.push(...reverseDataGroup(form.data))
  pushBilingual(components, "restriction", form.restriction)
  pushComponent(components, "release_date", form.releaseDate)

  // 倫理審査
  pushComponent(components, "nbdc_guideline_status", form.nbdcGuidelineStatus)
  pushComponent(components, "de_identification_status", form.deIdentificationStatus)
  pushComponent(components, "de_identification_date", form.deIdentificationDate)
  pushComponent(components, "de_identification_reason", form.deIdentificationReason)
  pushComponent(components, "submission_review_status", form.submissionReviewStatus)
  pushComponent(components, "submission_review_date", form.submissionReviewDate)
  pushComponent(components, "company_use_status", form.companyUseStatus)
  pushComponent(components, "multicenter_collaborative_study_status", form.multicenterStatus)
  pushComponent(components, "nbdc_data_processing_status", form.nbdcDataProcessingStatus)
  pushComponent(components, "nbdc_data_processing_reason", form.nbdcDataProcessingReason)

  // 研究分担者
  components.push(...reverseCollaborators(form.collaborators))

  return components
}

const reverseDuComponents = (form: DuFormData): EavComponent[] => {
  const components: EavComponent[] = []

  pushBilingual(components, "use_study_title", form.studyTitle)
  pushComponent(components, "use_summary", form.useSummary)
  pushComponent(components, "use_publication", form.usePublication)

  components.push(...reverseUseDatasets(form.useDatasets))

  pushComponent(components, "use_period_start", form.usePeriodStart)
  pushComponent(components, "use_period_end", form.usePeriodEnd)

  pushComponent(components, "use_review_status", form.useReviewStatus)
  pushComponent(components, "use_review_date", form.useReviewDate)

  pushComponent(components, "server_status", form.serverStatus)
  for (const s of form.offPremiseStatus) {
    components.push({ key: "off_premise_server_status", value: s })
  }
  components.push({
    key: "is_off_premise_server_statement",
    value: form.isOffPremiseStatement ? "TRUE" : "FALSE",
  })

  pushComponent(components, "acknowledgment_status", form.acknowledgmentStatus)

  components.push(...reverseCollaborators(form.collaborators))

  return components
}

export const buildDsOutput = (form: DsFormData): EavOutput => ({
  language_type: form.languageType,
  components: reverseDsComponents(form),
})

export const buildDuOutput = (form: DuFormData): EavOutput => ({
  language_type: form.languageType,
  components: reverseDuComponents(form),
})
