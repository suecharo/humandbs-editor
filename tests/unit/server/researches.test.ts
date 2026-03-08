import type { Request, Response } from "express"
import path from "node:path"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createResearchesRouter } from "../../../server/routes/researches"

const mockReaddir = vi.fn()
const mockReadFile = vi.fn()

vi.mock("node:fs/promises", () => ({
  default: {
    readdir: (...args: unknown[]) => mockReaddir(...args),
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: vi.fn(),
  },
  readdir: (...args: unknown[]) => mockReaddir(...args),
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: vi.fn(),
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
    footers: { ja: [], en: [] },
  },
  dataProvider: [],
  researchProject: [],
  grant: [],
  relatedPublication: [],
  controlledAccessUser: [],
  versionIds: [`${humId}-v1`],
  latestVersion: `${humId}-v1`,
  datePublished: "2024-01-01",
  dateModified: "2024-01-02",
})

const mockResearchVersion = (humId: string, datasetCount: number) => ({
  humId,
  humVersionId: `${humId}-v1`,
  version: "v1",
  versionReleaseDate: "2024-01-01",
  datasets: Array.from({ length: datasetCount }, (_, i) => ({
    datasetId: `JGAD${String(i + 1).padStart(6, "0")}`,
    version: "v1",
  })),
  releaseNote: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
})

const STRUCTURED_JSON_DIR = "/test/structured-json"

interface RouteLayer {
  route?: {
    path: string
    stack: { method: string; handle: (req: Request, res: Response, next: () => void) => Promise<void> }[]
  }
}

type Handler = (req: Request, res: Response, next: () => void) => Promise<void>

const getHandler = (): Handler => {
  const router = createResearchesRouter(STRUCTURED_JSON_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  const handle = layers
    .find((l) => l.route?.path === "/")
    ?.route?.stack
    .find((l) => l.method === "get")
    ?.handle

  if (!handle) {
    throw new Error("GET / handler not found on router")
  }

  return handle
}

describe("GET /api/researches", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns sorted research list items", async () => {
    mockReaddir.mockResolvedValue(["hum0002.json", "hum0001.json", "hum0010.json"])

    mockReadFile.mockImplementation(async (filePath: string) => {
      const basename = path.basename(filePath, ".json")

      if (filePath.includes("research-version")) {
        const humId = basename.replace(/-v\d+$/, "")

        return JSON.stringify(mockResearchVersion(humId, 2))
      }
      if (filePath.includes("editor-state")) {
        return JSON.stringify({ researches: {}, datasets: {}, experiments: {} })
      }

      return JSON.stringify(mockResearch(basename))
    })

    const handler = getHandler()
    expect(handler).toBeDefined()

    const req = {} as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const items = json.mock.calls[0]![0] as { humId: string; datasetCount: number }[]
    expect(items).toHaveLength(3)
    expect(items[0]!.humId).toBe("hum0001")
    expect(items[1]!.humId).toBe("hum0002")
    expect(items[2]!.humId).toBe("hum0010")
    expect(items[0]!.datasetCount).toBe(2)
  })

  it("returns uncurated status when editor-state is missing", async () => {
    mockReaddir.mockResolvedValue(["hum0001.json"])

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) {
        throw new Error("ENOENT")
      }
      if (filePath.includes("research-version")) {
        return JSON.stringify(mockResearchVersion("hum0001", 1))
      }

      return JSON.stringify(mockResearch("hum0001"))
    })

    const handler = getHandler()
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { curationStatus: string }[]
    expect(items[0]!.curationStatus).toBe("uncurated")
  })

  it("returns 500 when readdir fails", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler()
    const req = {} as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "Failed to list researches" })
  })

  it("returns dataset count 0 when version file is missing", async () => {
    mockReaddir.mockResolvedValue(["hum0001.json"])

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("research-version")) {
        throw new Error("ENOENT")
      }
      if (filePath.includes("editor-state")) {
        return JSON.stringify({ researches: {}, datasets: {}, experiments: {} })
      }

      return JSON.stringify(mockResearch("hum0001"))
    })

    const handler = getHandler()
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { datasetCount: number }[]
    expect(items[0]!.datasetCount).toBe(0)
  })
})
