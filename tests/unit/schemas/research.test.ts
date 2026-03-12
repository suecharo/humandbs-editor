import fc from "fast-check"
import { describe, it, expect } from "vitest"

import { ResearchListItemSchema, ResearchSchema } from "../../../src/schemas/research"

const bilingualText = () =>
  fc.record({
    ja: fc.option(fc.string(), { nil: null }),
    en: fc.option(fc.string(), { nil: null }),
  })

const textValue = () =>
  fc.record({
    text: fc.string(),
    rawHtml: fc.string(),
  })

const bilingualTextValue = () =>
  fc.record({
    ja: fc.option(textValue(), { nil: null }),
    en: fc.option(textValue(), { nil: null }),
  })

const urlValue = () =>
  fc.record({
    text: fc.string(),
    url: fc.string(),
  })

describe("ResearchListItemSchema", () => {
  it("parses a valid research list item", () => {
    const item = {
      humId: "hum0001",
      title: { ja: "test-ja", en: "test-en" },
      datasetCount: 3,
      datasetIds: ["JGAD000001", "JGAD000002", "JGAD000003"],
      versionCount: 2,
      accessRestrictions: ["Controlled-access (Type I)"],
      curationStatus: "uncurated",
      editingBy: null,
      editingByName: null,
      editingAt: null,
      datePublished: "2024-01-01",
      dateModified: "2024-01-02",
    }
    const result = ResearchListItemSchema.parse(item)
    expect(result.humId).toBe("hum0001")
    expect(result.datasetCount).toBe(3)
    expect(result.versionCount).toBe(2)
    expect(result.accessRestrictions).toEqual(["Controlled-access (Type I)"])
  })

  it("rejects missing required fields", () => {
    expect(() => ResearchListItemSchema.parse({})).toThrow()
    expect(() => ResearchListItemSchema.parse({ humId: "hum0001" })).toThrow()
  })

  it("rejects invalid datasetCount type", () => {
    const item = {
      humId: "hum0001",
      title: { ja: null, en: null },
      datasetCount: "not-a-number",
      datasetIds: [],
      versionCount: 1,
      accessRestrictions: [],
      curationStatus: "uncurated",
      datePublished: "2024-01-01",
      dateModified: "2024-01-02",
    }
    expect(() => ResearchListItemSchema.parse(item)).toThrow()
  })

  it("accepts nullable title fields", () => {
    const item = {
      humId: "hum0001",
      title: { ja: null, en: null },
      datasetCount: 0,
      datasetIds: [],
      versionCount: 1,
      accessRestrictions: [],
      curationStatus: "curated",
      editingBy: null,
      editingByName: null,
      editingAt: null,
      datePublished: "2024-01-01",
      dateModified: "2024-01-02",
    }
    const result = ResearchListItemSchema.parse(item)
    expect(result.title.ja).toBeNull()
    expect(result.title.en).toBeNull()
  })

  it("round-trips arbitrary valid data (PBT)", () => {
    fc.assert(
      fc.property(
        fc.record({
          humId: fc.string({ minLength: 1 }),
          title: bilingualText(),
          datasetCount: fc.nat(),
          datasetIds: fc.array(fc.string()),
          versionCount: fc.nat({ max: 100 }),
          accessRestrictions: fc.array(fc.string()),
          curationStatus: fc.string({ minLength: 1 }),
          editingBy: fc.option(fc.string(), { nil: null }),
          editingByName: fc.option(fc.string(), { nil: null }),
          editingAt: fc.option(fc.string(), { nil: null }),
          datePublished: fc.string({ minLength: 1 }),
          dateModified: fc.string({ minLength: 1 }),
        }),
        (item) => {
          const parsed = ResearchListItemSchema.parse(item)
          expect(parsed.humId).toBe(item.humId)
          expect(parsed.datasetCount).toBe(item.datasetCount)
        },
      ),
    )
  })
})

describe("ResearchSchema", () => {
  it("parses sample hum0001 data", () => {
    const data = {
      humId: "hum0001",
      url: { ja: "https://example.com/ja", en: "https://example.com/en" },
      title: { ja: "test-ja", en: "test-en" },
      summary: {
        aims: { ja: { text: "aims-ja", rawHtml: "" }, en: { text: "aims-en", rawHtml: "" } },
        methods: { ja: { text: "methods-ja", rawHtml: "" }, en: null },
        targets: { ja: null, en: { text: "targets-en", rawHtml: "" } },
        url: { ja: [], en: [] },
      },
      dataProvider: [],
      researchProject: [],
      grant: [],
      relatedPublication: [],
      controlledAccessUser: [],
      versionIds: ["hum0001-v1"],
      latestVersion: "v1",
      datePublished: "2024-01-01",
      dateModified: "2024-01-02",
    }
    const result = ResearchSchema.parse(data)
    expect(result.humId).toBe("hum0001")
    expect(result.versionIds).toHaveLength(1)
  })

  it("rejects empty object", () => {
    expect(() => ResearchSchema.parse({})).toThrow()
  })

  it("round-trips arbitrary valid research data (PBT)", () => {
    const personArb = fc.record({
      name: bilingualTextValue(),
      email: fc.option(fc.string(), { nil: null }),
      orcid: fc.option(fc.string(), { nil: null }),
      organization: fc.option(
        fc.record({
          name: bilingualTextValue(),
          address: fc.option(
            fc.record({ country: fc.option(fc.string(), { nil: null }) }),
            { nil: null },
          ),
        }),
        { nil: null },
      ),
    })

    const researchProjectArb = fc.record({
      name: bilingualTextValue(),
      url: fc.option(
        fc.record({
          ja: fc.option(urlValue(), { nil: null }),
          en: fc.option(urlValue(), { nil: null }),
        }),
        { nil: null },
      ),
    })

    const grantArb = fc.record({
      id: fc.array(fc.string(), { maxLength: 3 }),
      title: bilingualText(),
      agency: fc.record({ name: bilingualText() }),
    })

    const publicationArb = fc.record({
      title: bilingualText(),
      doi: fc.option(fc.string(), { nil: null }),
    })

    const researchArb = fc.record({
      humId: fc.string({ minLength: 1 }),
      url: bilingualText(),
      title: bilingualText(),
      summary: fc.record({
        aims: bilingualTextValue(),
        methods: bilingualTextValue(),
        targets: bilingualTextValue(),
        url: fc.record({
          ja: fc.array(urlValue()),
          en: fc.array(urlValue()),
        }),
      }),
      dataProvider: fc.array(personArb, { maxLength: 3 }),
      researchProject: fc.array(researchProjectArb, { maxLength: 2 }),
      grant: fc.array(grantArb, { maxLength: 2 }),
      relatedPublication: fc.array(publicationArb, { maxLength: 2 }),
      controlledAccessUser: fc.array(personArb, { maxLength: 2 }),
      versionIds: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
      latestVersion: fc.string({ minLength: 1 }),
      datePublished: fc.string({ minLength: 1 }),
      dateModified: fc.string({ minLength: 1 }),
    })

    fc.assert(
      fc.property(researchArb, (data) => {
        const parsed = ResearchSchema.parse(data)
        expect(parsed.humId).toBe(data.humId)
      }),
      { numRuns: 20 },
    )
  })
})
