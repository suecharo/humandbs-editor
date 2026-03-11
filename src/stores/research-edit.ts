import equal from "fast-deep-equal"
import { atom } from "jotai"

import type { Dataset } from "@/schemas/dataset"
import type { Research } from "@/schemas/research"
import type { ResearchVersion } from "@/schemas/research-version"

export const fileModifiedAtAtom = atom<string | null>(null)

export const datasetModifiedAtsAtom = atom<Record<string, string>>({})

export const researchServerAtom = atom<Research | null>(null)

export const researchDraftAtom = atom<Research | null>(null)

export const versionsServerAtom = atom<ResearchVersion[]>([])

export const versionsDraftAtom = atom<ResearchVersion[]>([])

export const datasetsServerAtom = atom<Record<string, Dataset>>({})

export const datasetsDraftAtom = atom<Record<string, Dataset>>({})

export const dirtyAtom = atom((get) => {
  const researchServer = get(researchServerAtom)
  const researchDraft = get(researchDraftAtom)
  const versionsServer = get(versionsServerAtom)
  const versionsDraft = get(versionsDraftAtom)
  const datasetsServer = get(datasetsServerAtom)
  const datasetsDraft = get(datasetsDraftAtom)

  const researchDirty = researchServer !== null && researchDraft !== null && !equal(researchServer, researchDraft)
  const versionsDirty = !equal(versionsServer, versionsDraft)
  const datasetsDirty = !equal(datasetsServer, datasetsDraft)

  return researchDirty || versionsDirty || datasetsDirty
})

/** @deprecated Use dirtyAtom instead */
export const researchDirtyAtom = dirtyAtom

export const computeModifiedPaths = (server: Research, draft: Research): Set<string> => {
  const paths = new Set<string>()

  // Title
  if (server.title.ja !== draft.title.ja) paths.add("title.ja")
  if (server.title.en !== draft.title.en) paths.add("title.en")

  // Summary
  for (const field of ["aims", "methods", "targets"] as const) {
    if (server.summary[field].ja?.text !== draft.summary[field].ja?.text) paths.add(`summary.${field}.ja`)
    if (server.summary[field].en?.text !== draft.summary[field].en?.text) paths.add(`summary.${field}.en`)
  }
  if (!equal(server.summary.url, draft.summary.url)) paths.add("summary.url")

  // Array sections
  if (!equal(server.dataProvider, draft.dataProvider)) paths.add("dataProvider")
  if (!equal(server.researchProject, draft.researchProject)) paths.add("researchProject")
  if (!equal(server.grant, draft.grant)) paths.add("grant")
  if (!equal(server.relatedPublication, draft.relatedPublication)) paths.add("relatedPublication")
  if (!equal(server.controlledAccessUser, draft.controlledAccessUser)) paths.add("controlledAccessUser")

  return paths
}
