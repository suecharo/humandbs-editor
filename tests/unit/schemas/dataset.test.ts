import fs from "node:fs/promises"
import path from "node:path"
import { describe, it, expect } from "vitest"

import {
  CreateDatasetBodySchema,
  DatasetSchema,
  ExperimentSchema,
  SearchableExperimentFieldsSchema,
} from "../../../src/schemas/dataset"
import { createDefaultExperiment, createDefaultSearchableFields } from "../../../src/schemas/defaults"

describe("DatasetSchema", () => {
  it("parses a real dataset JSON file", async () => {
    const filePath = path.join(__dirname, "../../../structured-json/dataset/JGAD000004-v1.json")
    const content = await fs.readFile(filePath, "utf-8")
    const data: unknown = JSON.parse(content)
    const result = DatasetSchema.safeParse(data)

    expect(result.success).toBe(true)
    const dataset = (result as { success: true; data: { datasetId: string; version: string; criteria: string; experiments: unknown[] } }).data
    expect(dataset.datasetId).toBe("JGAD000004")
    expect(dataset.version).toBe("v1")
    expect(dataset.criteria).toBe("Controlled-access (Type I)")
    expect(dataset.experiments.length).toBeGreaterThan(0)
  })

  it("rejects invalid criteria value", () => {
    const data = {
      datasetId: "JGAD000001",
      version: "v1",
      versionReleaseDate: "2024-01-01",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      releaseDate: "2024-01-01",
      criteria: "invalid-criteria",
      typeOfData: { ja: null, en: null },
      experiments: [],
    }
    const result = DatasetSchema.safeParse(data)

    expect(result.success).toBe(false)
  })

  it("accepts dataset with empty experiments", () => {
    const data = {
      datasetId: "JGAD000001",
      version: "v1",
      versionReleaseDate: "2024-01-01",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      releaseDate: "2024-01-01",
      criteria: "Unrestricted-access",
      typeOfData: { ja: "test", en: null },
      experiments: [],
    }
    const result = DatasetSchema.safeParse(data)

    expect(result.success).toBe(true)
  })
})

describe("CreateDatasetBodySchema", () => {
  it("validates valid create body", () => {
    const body = {
      datasetId: "JGAD000001",
      version: "v1",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: "test", en: null },
    }
    const result = CreateDatasetBodySchema.safeParse(body)

    expect(result.success).toBe(true)
  })

  it("rejects empty datasetId", () => {
    const body = {
      datasetId: "",
      version: "v1",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: null, en: null },
    }
    const result = CreateDatasetBodySchema.safeParse(body)

    expect(result.success).toBe(false)
  })

  it("rejects empty version", () => {
    const body = {
      datasetId: "JGAD000001",
      version: "",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: null, en: null },
    }
    const result = CreateDatasetBodySchema.safeParse(body)

    expect(result.success).toBe(false)
  })
})

describe("ExperimentSchema", () => {
  it("validates default experiment", () => {
    const experiment = createDefaultExperiment()
    const result = ExperimentSchema.safeParse(experiment)

    expect(result.success).toBe(true)
  })

  it("accepts experiment without searchable fields", () => {
    const experiment = {
      header: { ja: { text: "test", rawHtml: "" }, en: null },
      data: {},
      footers: { ja: [], en: [] },
    }
    const result = ExperimentSchema.safeParse(experiment)

    expect(result.success).toBe(true)
  })
})

describe("SearchableExperimentFieldsSchema", () => {
  it("validates default searchable fields", () => {
    const fields = createDefaultSearchableFields()
    const result = SearchableExperimentFieldsSchema.safeParse(fields)

    expect(result.success).toBe(true)
  })
})
