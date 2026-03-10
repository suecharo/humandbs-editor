import type { NormalizedPolicy } from "./common"
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

export const createDefaultNormalizedPolicy = (): NormalizedPolicy => ({
  id: "nbdc-policy",
  name: { ja: "", en: "" },
  url: null,
})
