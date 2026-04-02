import type { Request, Response } from "express"
import path from "node:path"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createResearchesRouter } from "../../../server/routes/researches"

const mockReaddir = vi.fn()
const mockReadFile = vi.fn()
const mockWriteFile = vi.fn()
const mockAccess = vi.fn()
const mockStat = vi.fn()

vi.mock("node:fs/promises", () => ({
  default: {
    readdir: (...args: unknown[]) => mockReaddir(...args),
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    access: (...args: unknown[]) => mockAccess(...args),
    stat: (...args: unknown[]) => mockStat(...args),
  },
  readdir: (...args: unknown[]) => mockReaddir(...args),
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  access: (...args: unknown[]) => mockAccess(...args),
  stat: (...args: unknown[]) => mockStat(...args),
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

const mockDataset = (datasetId: string, version: string, criteria: string) => ({
  datasetId,
  version,
  criteria,
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
  const router = createResearchesRouter(STRUCTURED_JSON_DIR, EDITOR_STATE_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  for (const layer of layers) {
    if (layer.route?.path !== routePath) continue
    const match = layer.route.stack.find((l) => l.method === method)
    if (match) return match.handle
  }

  throw new Error(`${method.toUpperCase()} ${routePath} handler not found on router`)
}

describe("GET /api/researches", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns sorted research list items with accessRestrictions", async () => {
    mockReaddir.mockResolvedValue(["hum0002.json", "hum0001.json", "hum0010.json"])

    mockReadFile.mockImplementation(async (filePath: string) => {
      const basename = path.basename(filePath, ".json")

      if (filePath.includes("dataset/")) {
        return JSON.stringify(mockDataset(basename, "v1", "Controlled-access (Type I)"))
      }
      if (filePath.includes("research-version")) {
        const humId = basename.replace(/-v\d+$/, "")

        return JSON.stringify(mockResearchVersion(humId, 2))
      }
      if (filePath.includes("editor-state")) {
        return JSON.stringify({ researches: {}, datasets: {}, experiments: {} })
      }

      return JSON.stringify(mockResearch(basename))
    })

    const handler = getHandler("/")
    expect(handler).toBeDefined()

    const req = {} as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const items = json.mock.calls[0]![0] as { humId: string; datasetCount: number; datasetIds: string[]; versionCount: number; accessRestrictions: string[] }[]
    expect(items).toHaveLength(3)
    expect(items[0]!.humId).toBe("hum0001")
    expect(items[1]!.humId).toBe("hum0002")
    expect(items[2]!.humId).toBe("hum0010")
    expect(items[0]!.datasetCount).toBe(2)
    expect(items[0]!.datasetIds).toEqual(["JGAD000001", "JGAD000002"])
    expect(items[0]!.versionCount).toBe(1)
    expect(items[0]!.accessRestrictions).toEqual(["Controlled-access (Type I)"])
  })

  it("includes editingBy, editingByName, editingAt in response", async () => {
    const editorState = {
      researches: {
        hum0001: {
          status: "uncurated",
          updatedAt: new Date().toISOString(),
          editingBy: "alice",
          editingByName: "alice",
          editingAt: "2024-06-01T00:00:00Z",
        },
      },
      datasets: {},
      experiments: {},
    }

    mockReaddir.mockResolvedValue(["hum0001.json"])
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("editor-state")) return JSON.stringify(editorState)
      if (filePath.includes("research-version")) return JSON.stringify(mockResearchVersion("hum0001", 1))

      return JSON.stringify(mockResearch("hum0001"))
    })

    const handler = getHandler("/")
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { editingBy: string | null; editingByName: string | null; editingAt: string | null }[]
    expect(items[0]!.editingBy).toBe("alice")
    expect(items[0]!.editingByName).toBe("alice")
    expect(items[0]!.editingAt).toBe("2024-06-01T00:00:00Z")
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

    const handler = getHandler("/")
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { curationStatus: string }[]
    expect(items[0]!.curationStatus).toBe("uncurated")
  })

  it("returns 500 when readdir fails", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/")
    const req = {} as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "Failed to list researches" })
  })

  it("returns dataset count 0 and empty accessRestrictions when version file is missing", async () => {
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

    const handler = getHandler("/")
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { datasetCount: number; datasetIds: string[]; versionCount: number; accessRestrictions: string[] }[]
    expect(items[0]!.datasetCount).toBe(0)
    expect(items[0]!.datasetIds).toEqual([])
    expect(items[0]!.versionCount).toBe(1)
    expect(items[0]!.accessRestrictions).toEqual([])
  })

  it("returns in-progress when all research sections are curated but datasets are uncurated", async () => {
    const editorState = {
      researches: {
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
      },
      datasets: {},
      experiments: {},
    }

    mockReaddir.mockResolvedValue(["hum0001.json"])
    mockReadFile.mockImplementation(async (filePath: string) => {
      const basename = path.basename(filePath, ".json")

      if (filePath.includes("dataset/")) {
        return JSON.stringify(mockDataset(basename, "v1", "Controlled-access (Type I)"))
      }
      if (filePath.includes("research-version")) {
        return JSON.stringify(mockResearchVersion("hum0001", 2))
      }
      if (filePath.includes("editor-state")) {
        return JSON.stringify(editorState)
      }

      return JSON.stringify(mockResearch(basename))
    })

    const handler = getHandler("/")
    const req = {} as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const items = json.mock.calls[0]![0] as { curationStatus: string }[]
    expect(items[0]!.curationStatus).toBe("in-progress")
  })
})

describe("GET /api/researches/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns a single research by humId", async () => {
    const research = mockResearch("hum0001")
    mockReadFile.mockResolvedValue(JSON.stringify(research))
    mockStat.mockResolvedValue({ mtime: new Date("2024-06-01T00:00:00Z") })

    const handler = getHandler("/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { humId: string }
    expect(result.humId).toBe("hum0001")
  })

  it("includes X-Modified-At header in response", async () => {
    const research = mockResearch("hum0001")
    mockReadFile.mockResolvedValue(JSON.stringify(research))
    const mtime = new Date("2024-06-01T12:00:00Z")
    mockStat.mockResolvedValue({ mtime })

    const handler = getHandler("/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(setHeader).toHaveBeenCalledWith("X-Modified-At", mtime.toISOString())
  })

  it("returns 500 when file does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:humId")
    const req = { params: { humId: "hum9999" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
  })

  it("returns 400 for invalid humId format", async () => {
    const handler = getHandler("/:humId")
    const req = { params: { humId: "../etc/passwd" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: "Invalid humId format" })
  })
})

describe("GET /api/researches/:humId/versions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns version array for a research", async () => {
    const research = mockResearch("hum0001")
    const version = mockResearchVersion("hum0001", 2)

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("research-version")) {
        return JSON.stringify(version)
      }

      return JSON.stringify(research)
    })

    const handler = getHandler("/:humId/versions")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const versions = json.mock.calls[0]![0] as { humVersionId: string; datasets: unknown[] }[]
    expect(versions).toHaveLength(1)
    expect(versions[0]!.humVersionId).toBe("hum0001-v1")
    expect(versions[0]!.datasets).toHaveLength(2)
  })

  it("returns 500 when research file does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:humId/versions")
    const req = { params: { humId: "hum9999" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
  })
})

describe("PUT /api/researches/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("saves research and returns the saved data", async () => {
    const research = mockResearch("hum0001")
    const mtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime })
    mockWriteFile.mockResolvedValue(undefined)

    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "hum0001" }, body: research, headers: {} } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { humId: string }
    expect(result.humId).toBe("hum0001")
    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(STRUCTURED_JSON_DIR, "research", "hum0001.json"),
      JSON.stringify(research, null, 2),
      "utf-8",
    )
  })

  it("returns 400 for invalid humId format", async () => {
    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "../etc/passwd" }, body: {}, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: "Invalid humId format" })
  })

  it("returns 400 when body humId does not match URL parameter", async () => {
    const research = mockResearch("hum0002")
    mockStat.mockResolvedValue({ mtime: new Date() })

    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "hum0001" }, body: research, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: "humId in body does not match URL parameter" })
  })

  it("returns 400 for invalid request body", async () => {
    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "hum0001" }, body: { humId: "hum0001" }, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
    const call = json.mock.calls[0]![0] as { error: string }
    expect(call.error).toBe("Invalid request body")
  })

  it("returns 404 when research file does not exist", async () => {
    const research = mockResearch("hum9999")
    mockStat.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "hum9999" }, body: research, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({ error: "Research hum9999 not found" })
  })

  it("returns 500 when writeFile fails", async () => {
    const research = mockResearch("hum0001")
    mockStat.mockResolvedValue({ mtime: new Date() })
    mockWriteFile.mockRejectedValue(new Error("EACCES"))

    const handler = getHandler("/:humId", "put")
    const req = { params: { humId: "hum0001" }, body: research, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const setHeader = vi.fn()
    const res = { json, status, setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
  })

  it("succeeds when X-Base-Modified-At matches file mtime", async () => {
    const research = mockResearch("hum0001")
    const mtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime })
    mockWriteFile.mockResolvedValue(undefined)

    const handler = getHandler("/:humId", "put")
    const req = {
      params: { humId: "hum0001" },
      body: research,
      headers: { "x-base-modified-at": mtime.toISOString() },
    } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    expect(mockWriteFile).toHaveBeenCalled()
  })

  it("returns 409 when X-Base-Modified-At is older than file mtime", async () => {
    const research = mockResearch("hum0001")
    const fileMtime = new Date("2024-06-02T00:00:00Z")
    const baseMtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime: fileMtime })

    const handler = getHandler("/:humId", "put")
    const req = {
      params: { humId: "hum0001" },
      body: research,
      headers: { "x-base-modified-at": baseMtime.toISOString() },
    } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(409)
    const result = json.mock.calls[0]![0] as { error: string }
    expect(result.error).toBe("File has been modified by another user")
  })

  it("allows PUT without X-Base-Modified-At header for backward compatibility", async () => {
    const research = mockResearch("hum0001")
    const mtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime })
    mockWriteFile.mockResolvedValue(undefined)

    const handler = getHandler("/:humId", "put")
    const req = {
      params: { humId: "hum0001" },
      body: research,
      headers: {},
    } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    expect(mockWriteFile).toHaveBeenCalled()
  })
})
