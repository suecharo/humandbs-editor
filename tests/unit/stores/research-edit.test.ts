import { createStore } from "jotai"
import { describe, it, expect } from "vitest"

import type { Research } from "@/schemas/research"

import { researchDirtyAtom, researchDraftAtom, researchServerAtom } from "../../../src/stores/research-edit"

const makeResearch = (overrides: Partial<Research> = {}): Research => ({
  humId: "hum0001",
  url: { ja: "https://example.com/ja", en: "https://example.com/en" },
  title: { ja: "Test Title JA", en: "Test Title EN" },
  summary: {
    aims: { ja: { text: "aims ja", rawHtml: "" }, en: { text: "aims en", rawHtml: "" } },
    methods: { ja: { text: "methods ja", rawHtml: "" }, en: { text: "methods en", rawHtml: "" } },
    targets: { ja: { text: "targets ja", rawHtml: "" }, en: { text: "targets en", rawHtml: "" } },
    url: { ja: [], en: [] },
  },
  dataProvider: [],
  researchProject: [],
  grant: [],
  relatedPublication: [],
  controlledAccessUser: [],
  versionIds: ["hum0001-v1"],
  latestVersion: "hum0001-v1",
  datePublished: "2024-01-01",
  dateModified: "2024-01-02",
  ...overrides,
})

describe("researchDirtyAtom", () => {
  it("returns false when both server and draft are null", () => {
    const store = createStore()

    expect(store.get(researchDirtyAtom)).toBe(false)
  })

  it("returns false when server is null", () => {
    const store = createStore()
    store.set(researchDraftAtom, makeResearch())

    expect(store.get(researchDirtyAtom)).toBe(false)
  })

  it("returns false when draft is null", () => {
    const store = createStore()
    store.set(researchServerAtom, makeResearch())

    expect(store.get(researchDirtyAtom)).toBe(false)
  })

  it("returns false when server and draft are equal", () => {
    const store = createStore()
    const research = makeResearch()
    store.set(researchServerAtom, research)
    store.set(researchDraftAtom, structuredClone(research))

    expect(store.get(researchDirtyAtom)).toBe(false)
  })

  it("returns true when draft title differs from server", () => {
    const store = createStore()
    const server = makeResearch()
    const draft = makeResearch({ title: { ja: "Changed", en: "Changed" } })
    store.set(researchServerAtom, server)
    store.set(researchDraftAtom, draft)

    expect(store.get(researchDirtyAtom)).toBe(true)
  })

  it("returns true when draft has extra array item", () => {
    const store = createStore()
    const server = makeResearch()
    const draft = makeResearch({
      grant: [{
        id: ["123"],
        title: { ja: "Grant JA", en: "Grant EN" },
        agency: { name: { ja: "Agency JA", en: "Agency EN" } },
      }],
    })
    store.set(researchServerAtom, server)
    store.set(researchDraftAtom, draft)

    expect(store.get(researchDirtyAtom)).toBe(true)
  })
})
