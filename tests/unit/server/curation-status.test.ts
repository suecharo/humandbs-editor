import type { Request, Response } from "express"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createCurationStatusRouter } from "../../../server/routes/curation-status"

const mockReadFile = vi.fn()
const mockWriteFile = vi.fn()
const mockMkdir = vi.fn()

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    mkdir: (...args: unknown[]) => mockMkdir(...args),
  },
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  mkdir: (...args: unknown[]) => mockMkdir(...args),
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

const STRUCTURED_JSON_DIR = "/test/structured-json"
const EDITOR_STATE_DIR = "/test/data"

interface RouteLayer {
  route?: {
    path: string
    stack: { method: string; handle: (req: Request, res: Response, next: () => void) => Promise<void> }[]
  }
}

type Handler = (req: Request, res: Response, next: () => void) => Promise<void>

const getHandler = (routePath: string, method = "get"): Handler => {
  const router = createCurationStatusRouter(STRUCTURED_JSON_DIR, EDITOR_STATE_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  for (const layer of layers) {
    if (layer.route?.path !== routePath) continue
    const match = layer.route.stack.find((l) => l.method === method)
    if (match) return match.handle
  }

  throw new Error(`${method.toUpperCase()} ${routePath} handler not found on router`)
}

const makeEditorState = (researches: Record<string, unknown> = {}) =>
  JSON.stringify({ researches, datasets: {}, experiments: {} })

describe("GET /api/curation-status/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("auto-initializes dataset keys from research-version", async () => {
    const datasets = [
      { datasetId: "JGAD000001", version: "v1" },
      { datasetId: "JGAD000002", version: "v1" },
    ]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) return makeEditorState()
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string; sectionStatuses: Record<string, string> }
    expect(result.sectionStatuses["dataset:JGAD000001-v1"]).toBe("uncurated")
    expect(result.sectionStatuses["dataset:JGAD000002-v1"]).toBe("uncurated")
  })

  it("preserves stored dataset keys", async () => {
    const datasets = [{ datasetId: "JGAD000001", version: "v1" }]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) {
        return makeEditorState({
          hum0001: {
            status: "in-progress",
            sectionStatuses: { "dataset:JGAD000001-v1": "curated" },
            updatedAt: new Date().toISOString(),
            editingBy: null,
            editingByName: null,
            editingAt: null,
          },
        })
      }
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { sectionStatuses: Record<string, string> }
    expect(result.sectionStatuses["dataset:JGAD000001-v1"]).toBe("curated")
  })

  it("returns in-progress when all fixed sections are curated but datasets are uncurated", async () => {
    const datasets = [{ datasetId: "JGAD000001", version: "v1" }]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) {
        return makeEditorState({
          hum0001: {
            status: "curated",
            sectionStatuses: {
              title: "curated",
              summary: "curated",
              dataProvider: "curated",
              grant: "curated",
              publication: "curated",
              controlledAccessUser: "curated",
            },
            updatedAt: new Date().toISOString(),
            editingBy: null,
            editingByName: null,
            editingAt: null,
          },
        })
      }
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string; sectionStatuses: Record<string, string> }
    expect(result.status).toBe("in-progress")
    expect(result.sectionStatuses["dataset:JGAD000001-v1"]).toBe("uncurated")
  })

  it("returns curated when all sections including datasets are curated", async () => {
    const datasets = [{ datasetId: "JGAD000001", version: "v1" }]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) {
        return makeEditorState({
          hum0001: {
            status: "curated",
            sectionStatuses: {
              title: "curated",
              summary: "curated",
              dataProvider: "curated",
              grant: "curated",
              publication: "curated",
              controlledAccessUser: "curated",
              "dataset:JGAD000001-v1": "curated",
            },
            updatedAt: new Date().toISOString(),
            editingBy: null,
            editingByName: null,
            editingAt: null,
          },
        })
      }
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string }
    expect(result.status).toBe("curated")
  })

  it("works with only fixed sections when research-version is missing", async () => {
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) return makeEditorState()
      throw new Error("ENOENT")
    })

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string; sectionStatuses: Record<string, string> }
    expect(result.status).toBe("uncurated")
    expect(Object.keys(result.sectionStatuses)).toHaveLength(6)
  })
})

describe("PUT /api/curation-status/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
  })

  it("includes dataset keys when setting all sections to curated", async () => {
    const datasets = [{ datasetId: "JGAD000001", version: "v1" }]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) return makeEditorState()
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId", "put")
    const req = {
      params: { humId: "hum0001" },
      body: {
        sectionStatuses: {
          title: "curated",
          summary: "curated",
          dataProvider: "curated",
          grant: "curated",
          publication: "curated",
          controlledAccessUser: "curated",
          "dataset:JGAD000001-v1": "curated",
        },
      },
    } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string; sectionStatuses: Record<string, string> }
    expect(result.status).toBe("curated")
    expect(result.sectionStatuses["dataset:JGAD000001-v1"]).toBe("curated")
  })

  it("auto-initializes missing dataset keys as uncurated on PUT", async () => {
    const datasets = [
      { datasetId: "JGAD000001", version: "v1" },
      { datasetId: "JGAD000002", version: "v1" },
    ]

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) return makeEditorState()
      if (filePath.includes("research/")) return JSON.stringify(mockResearch("hum0001"))

      return JSON.stringify(mockResearchVersion("hum0001", datasets))
    })

    const handler = getHandler("/research/:humId", "put")
    const req = {
      params: { humId: "hum0001" },
      body: {
        sectionStatuses: { title: "curated" },
      },
    } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { status: string; sectionStatuses: Record<string, string> }
    expect(result.status).toBe("in-progress")
    expect(result.sectionStatuses["dataset:JGAD000001-v1"]).toBe("uncurated")
    expect(result.sectionStatuses["dataset:JGAD000002-v1"]).toBe("uncurated")
  })
})
