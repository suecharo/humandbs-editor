import equal from "fast-deep-equal"
import { atom } from "jotai"

import type { Research } from "@/schemas/research"
import type { ResearchVersion } from "@/schemas/research-version"

export const researchServerAtom = atom<Research | null>(null)

export const researchDraftAtom = atom<Research | null>(null)

export const versionsServerAtom = atom<ResearchVersion[]>([])

export const versionsDraftAtom = atom<ResearchVersion[]>([])

export const dirtyAtom = atom((get) => {
  const researchServer = get(researchServerAtom)
  const researchDraft = get(researchDraftAtom)
  const versionsServer = get(versionsServerAtom)
  const versionsDraft = get(versionsDraftAtom)

  const researchDirty = researchServer !== null && researchDraft !== null && !equal(researchServer, researchDraft)
  const versionsDirty = !equal(versionsServer, versionsDraft)

  return researchDirty || versionsDirty
})

/** @deprecated Use dirtyAtom instead */
export const researchDirtyAtom = dirtyAtom
