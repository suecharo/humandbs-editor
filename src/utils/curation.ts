import type { CurationStatus, SectionCurationStatus } from "../schemas/editor-state"

export const RESEARCH_SECTION_IDS = [
  "title",
  "summary",
  "dataProvider",
  "grant",
  "publication",
  "controlledAccessUser",
] as const

export type ResearchSectionId = typeof RESEARCH_SECTION_IDS[number]

export const deriveCurationStatus = (
  sectionStatuses: Record<string, SectionCurationStatus>,
): CurationStatus => {
  const values = Object.values(sectionStatuses)
  if (values.length === 0) return "uncurated"
  if (values.every((v) => v === "curated")) return "curated"
  if (values.every((v) => v === "uncurated")) return "uncurated"

  return "in-progress"
}
