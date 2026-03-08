import equal from "fast-deep-equal"
import { atom } from "jotai"

import type { Research } from "@/schemas/research"

export const researchServerAtom = atom<Research | null>(null)

export const researchDraftAtom = atom<Research | null>(null)

export const researchDirtyAtom = atom((get) => {
  const server = get(researchServerAtom)
  const draft = get(researchDraftAtom)
  if (server === null || draft === null) return false

  return !equal(server, draft)
})
