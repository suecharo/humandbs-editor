import type { NormalizedPolicy, PolicyCanonical } from "./common"
import type {
  DiseaseInfo,
  Experiment,
  PlatformInfo,
  SearchableExperimentFields,
  VariantCounts,
} from "./dataset"
import type { Grant, Person, Publication, ResearchProject } from "./research"

export const createDefaultPerson = (): Person => ({
  name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  email: null,
  orcid: null,
  organization: {
    name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    address: null,
  },
})

export const createDefaultControlledAccessUser = (): Person => ({
  ...createDefaultPerson(),
  researchTitle: { ja: null, en: null },
  periodOfDataUse: { startDate: null, endDate: null },
})

export const createDefaultGrant = (): Grant => ({
  id: [],
  title: { ja: null, en: null },
  agency: { name: { ja: null, en: null } },
})

export const createDefaultPublication = (): Publication => ({
  title: { ja: null, en: null },
  doi: null,
})

export const createDefaultResearchProject = (): ResearchProject => ({
  name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  url: null,
})

export const createDefaultSearchableFields = (): SearchableExperimentFields => ({
  subjectCount: null,
  subjectCountType: null,
  healthStatus: null,
  diseases: [],
  tissues: [],
  isTumor: null,
  cellLine: [],
  population: [],
  sex: null,
  ageGroup: null,
  assayType: [],
  libraryKits: [],
  platforms: [],
  readType: null,
  readLength: null,
  sequencingDepth: null,
  targetCoverage: null,
  referenceGenome: [],
  variantCounts: null,
  hasPhenotypeData: null,
  targets: null,
  fileTypes: [],
  processedDataTypes: [],
  dataVolumeGb: null,
  policies: [],
})

export const createDefaultExperiment = (): Experiment => ({
  header: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  data: {},
  footers: { ja: [], en: [] },
  searchable: createDefaultSearchableFields(),
})

export const createDefaultVariantCounts = (): VariantCounts => ({
  snv: null,
  indel: null,
  cnv: null,
  sv: null,
  total: null,
})

export const createDefaultDiseaseInfo = (): DiseaseInfo => ({
  label: "",
  icd10: null,
})

export const createDefaultPlatformInfo = (): PlatformInfo => ({
  vendor: null,
  model: null,
})

const POLICY_CANONICAL_DATA: Record<Exclude<PolicyCanonical, "custom-policy">, { ja: string; en: string; url: string }> = {
  "nbdc-policy": { ja: "NBDC policy", en: "NBDC policy", url: "https://humandbs.dbcls.jp/nbdc-policy" },
  "company-limitation-policy": { ja: "民間企業における利用禁止", en: "Company User Limit", url: "https://humandbs.dbcls.jp/policy-companylimitation" },
  "cancer-research-policy": { ja: "Cancer Research Use Only", en: "Cancer Research Use Only", url: "https://humandbs.dbcls.jp/policy-cancer" },
  "familial-policy": { ja: "Familial policy", en: "Familial policy", url: "https://humandbs.dbcls.jp/familial-policy" },
}

export const getPolicyDefaults = (id: PolicyCanonical): { name: { ja: string; en: string }; url: string | null } => {
  if (id === "custom-policy") return { name: { ja: "", en: "" }, url: null }
  const data = POLICY_CANONICAL_DATA[id]

  return { name: { ja: data.ja, en: data.en }, url: data.url }
}

export const createDefaultNormalizedPolicy = (): NormalizedPolicy => ({
  id: "nbdc-policy",
  ...getPolicyDefaults("nbdc-policy"),
})
