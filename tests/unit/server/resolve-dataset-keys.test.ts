import { describe, it, expect, vi, beforeEach } from "vitest"

import { resolveDatasetSectionKeys } from "../../../server/utils/resolve-dataset-keys"

const mockReadFile = vi.fn()

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
  },
  readFile: (...args: unknown[]) => mockReadFile(...args),
}))

const mockResearch = (humId: string) => ({
  humId,
  url: { ja: `https://example.com/ja/${humId}`, en: `https://example.com/en/${humId}` },
  title: { ja: `${humId} タイトル`, en: `${humId} Title` },
  summary: {
    aims: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    methods: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    targets: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    url: { ja: [], en: [] },
  },
  dataProvider: [],
  researchProject: [],
  grant: [],
  relatedPublication: [],
  controlledAccessUser: [],
  versionIds: [`${humId}-v1`],
  latestVersion: "v1",
  datePublished: "2024-01-01",
  dateModified: "2024-01-02",
})

const mockResearchVersion = (humId: string, datasets: { datasetId: string; version: string }[]) => ({
  humId,
  humVersionId: `${humId}-v1`,
  version: "v1",
  versionReleaseDate: "2024-01-01",
  datasets,
  releaseNote: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
})

describe("resolveDatasetSectionKeys", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns dataset section keys from research-version", async () => {
    const datasets = [
      { datasetId: "JGAD000001", version: "v1" },
      { datasetId: "JGAD000002", version: "v2" },
    ]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("research/")) {
        return JSON.stringify(mockResearch("hum0001"))
      }

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const keys = await resolveDatasetSectionKeys("/test/structured-json", "hum0001")
    expect(keys).toEqual([
      "dataset:JGAD000001-v1",
      "dataset:JGAD000002-v2",
    ])
  })

  it("returns empty array when research file is missing", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"))

    const keys = await resolveDatasetSectionKeys("/test/structured-json", "hum9999")
    expect(keys).toEqual([])
  })

  it("returns empty array when research-version file is missing", async () => {
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("research/")) {
        return JSON.stringify(mockResearch("hum0001"))
      }
      throw new Error("ENOENT")
    })

    const keys = await resolveDatasetSectionKeys("/test/structured-json", "hum0001")
    expect(keys).toEqual([])
  })

  it("returns empty array when research has no datasets", async () => {
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("research/")) {
        return JSON.stringify(mockResearch("hum0001"))
      }

      return JSON.stringify(mockResearchVersion("hum0001", []))
    })

    const keys = await resolveDatasetSectionKeys("/test/structured-json", "hum0001")
    expect(keys).toEqual([])
  })
})
