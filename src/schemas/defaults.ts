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
