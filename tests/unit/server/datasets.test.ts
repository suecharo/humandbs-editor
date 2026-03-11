import type { Request, Response } from "express"
import path from "node:path"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createDatasetsRouter } from "../../../server/routes/datasets"

const mockReadFile = vi.fn()
const mockWriteFile = vi.fn()
const mockAccess = vi.fn()
const mockUnlink = vi.fn()
const mockMkdir = vi.fn()
const mockReaddir = vi.fn()
const mockStat = vi.fn()

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    access: (...args: unknown[]) => mockAccess(...args),
    unlink: (...args: unknown[]) => mockUnlink(...args),
    mkdir: (...args: unknown[]) => mockMkdir(...args),
    readdir: (...args: unknown[]) => mockReaddir(...args),
    stat: (...args: unknown[]) => mockStat(...args),
  },
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  access: (...args: unknown[]) => mockAccess(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  readdir: (...args: unknown[]) => mockReaddir(...args),
  stat: (...args: unknown[]) => mockStat(...args),
}))

const mockDataset = (datasetId: string, version: string) => ({
  datasetId,
  version,
  versionReleaseDate: "2024-01-01",
  humId: "hum0001",
  humVersionId: "hum0001-v1",
  releaseDate: "2024-01-01",
  criteria: "Controlled-access (Type I)",
  typeOfData: { ja: "test data", en: "test data" },
  experiments: [],
})

const mockResearch = (humId: string) => ({
  humId,
  url: { ja: `https://example.com/ja/${humId}`, en: `https://example.com/en/${humId}` },
  title: { ja: "test", en: "test" },
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
  latestVersion: `${humId}-v1`,
  datePublished: "2024-01-01",
  dateModified: "2024-01-02",
})

const mockResearchVersion = (humId: string) => ({
  humId,
  humVersionId: `${humId}-v1`,
  version: "v1",
  versionReleaseDate: "2024-01-01",
  datasets: [{ datasetId: "JGAD000001", version: "v1" }],
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
  const router = createDatasetsRouter(STRUCTURED_JSON_DIR, EDITOR_STATE_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  for (const layer of layers) {
    if (layer.route?.path !== routePath) continue
    const match = layer.route.stack.find((l) => l.method === method)
    if (match) return match.handle
  }

  throw new Error(`${method.toUpperCase()} ${routePath} handler not found on router`)
}

describe("GET /api/datasets", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns unique dataset IDs from files", async () => {
    mockReaddir.mockResolvedValue([
      "JGAD000001-v1.json",
      "JGAD000001-v2.json",
      "JGAD000002-v1.json",
      "E-GEAD-397-v1.json",
    ])

    const handler = getHandler("/")
    const req = {} as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { datasetIds: string[] }
    expect(result.datasetIds).toHaveLength(3)
    expect(result.datasetIds).toContain("JGAD000001")
    expect(result.datasetIds).toContain("JGAD000002")
    expect(result.datasetIds).toContain("E-GEAD-397")
  })

  it("returns empty array when directory does not exist", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/")
    const req = {} as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ datasetIds: [] })
  })

  it("returns empty array for empty directory", async () => {
    mockReaddir.mockResolvedValue([])

    const handler = getHandler("/")
    const req = {} as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ datasetIds: [] })
  })

  it("deduplicates same datasetId with multiple versions", async () => {
    mockReaddir.mockResolvedValue([
      "JGAD000001-v1.json",
      "JGAD000001-v2.json",
      "JGAD000001-v3.json",
    ])

    const handler = getHandler("/")
    const req = {} as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { datasetIds: string[] }
    expect(result.datasetIds).toHaveLength(1)
    expect(result.datasetIds).toContain("JGAD000001")
  })
})

describe("GET /api/datasets/:datasetKey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns dataset by composite key", async () => {
    const dataset = mockDataset("JGAD000001", "v1")
    mockReadFile.mockResolvedValue(JSON.stringify(dataset))
    mockStat.mockResolvedValue({ mtime: new Date("2024-06-01T00:00:00Z") })

    const handler = getHandler("/:datasetKey")
    const req = { params: { datasetKey: "JGAD000001-v1" } } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { datasetId: string }
    expect(result.datasetId).toBe("JGAD000001")
    expect(setHeader).toHaveBeenCalledWith("X-Modified-At", "2024-06-01T00:00:00.000Z")
  })

  it("returns 400 for invalid dataset key", async () => {
    const handler = getHandler("/:datasetKey")
    const req = { params: { datasetKey: "invalid" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 500 when file does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:datasetKey")
    const req = { params: { datasetKey: "JGAD999999-v1" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
  })

  it("handles composite key with hyphens in datasetId", async () => {
    const dataset = mockDataset("E-GEAD-397", "v1")
    mockReadFile.mockResolvedValue(JSON.stringify(dataset))
    mockStat.mockResolvedValue({ mtime: new Date("2024-06-01T00:00:00Z") })

    const handler = getHandler("/:datasetKey")
    const req = { params: { datasetKey: "E-GEAD-397-v1" } } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    expect(mockReadFile).toHaveBeenCalledWith(
      path.join(STRUCTURED_JSON_DIR, "dataset", "E-GEAD-397-v1.json"),
      "utf-8",
    )
  })
})

describe("PUT /api/datasets/:datasetKey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("updates dataset and returns saved data", async () => {
    const dataset = mockDataset("JGAD000001", "v1")
    const mtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime })
    mockWriteFile.mockResolvedValue(undefined)

    const handler = getHandler("/:datasetKey", "put")
    const req = { params: { datasetKey: "JGAD000001-v1" }, body: dataset, headers: {} } as unknown as Request
    const json = vi.fn()
    const setHeader = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis(), setHeader } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    expect(mockWriteFile).toHaveBeenCalled()
  })

  it("returns 400 when datasetId does not match URL", async () => {
    const dataset = mockDataset("JGAD000002", "v1")
    mockStat.mockResolvedValue({ mtime: new Date() })

    const handler = getHandler("/:datasetKey", "put")
    const req = { params: { datasetKey: "JGAD000001-v1" }, body: dataset, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 404 when dataset does not exist", async () => {
    const dataset = mockDataset("JGAD999999", "v1")
    mockStat.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:datasetKey", "put")
    const req = { params: { datasetKey: "JGAD999999-v1" }, body: dataset, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(404)
  })

  it("returns 400 for invalid request body", async () => {
    const handler = getHandler("/:datasetKey", "put")
    const req = { params: { datasetKey: "JGAD000001-v1" }, body: { datasetId: "JGAD000001" }, headers: {} } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 409 when X-Base-Modified-At is older than file mtime", async () => {
    const dataset = mockDataset("JGAD000001", "v1")
    const fileMtime = new Date("2024-06-02T00:00:00Z")
    const baseMtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime: fileMtime })

    const handler = getHandler("/:datasetKey", "put")
    const req = {
      params: { datasetKey: "JGAD000001-v1" },
      body: dataset,
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

  it("allows PUT without X-Base-Modified-At for backward compatibility", async () => {
    const dataset = mockDataset("JGAD000001", "v1")
    const mtime = new Date("2024-06-01T00:00:00Z")
    mockStat.mockResolvedValue({ mtime })
    mockWriteFile.mockResolvedValue(undefined)

    const handler = getHandler("/:datasetKey", "put")
    const req = {
      params: { datasetKey: "JGAD000001-v1" },
      body: dataset,
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

describe("POST /api/datasets", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("creates dataset and returns 201", async () => {
    const version = mockResearchVersion("hum0001")
    // First access call: dataset file does not exist (expected)
    mockAccess.mockRejectedValue(new Error("ENOENT"))
    mockWriteFile.mockResolvedValue(undefined)
    // readJson for research-version file
    mockReadFile.mockResolvedValue(JSON.stringify(version))

    const handler = getHandler("/", "post")
    const body = {
      datasetId: "JGAD000099",
      version: "v1",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: "test", en: null },
    }
    const req = { body } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const send = vi.fn()
    const res = { json, status, send } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledTimes(1)
    expect(mockWriteFile).toHaveBeenCalledTimes(2) // dataset file + version file
  })

  it("returns 409 when dataset already exists", async () => {
    // File exists
    mockAccess.mockResolvedValue(undefined)

    const handler = getHandler("/", "post")
    const body = {
      datasetId: "JGAD000001",
      version: "v1",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: null, en: null },
    }
    const req = { body } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(409)
  })

  it("returns 400 for invalid body", async () => {
    const handler = getHandler("/", "post")
    const req = { body: { datasetId: "" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 409 when datasetId already exists in another file", async () => {
    // File with this exact key does not exist
    mockAccess.mockRejectedValue(new Error("ENOENT"))
    // But directory contains a file with the same datasetId
    mockReaddir.mockResolvedValue(["JGAD000099-v1.json"])

    const handler = getHandler("/", "post")
    const body = {
      datasetId: "JGAD000099",
      version: "v2",
      humId: "hum0001",
      humVersionId: "hum0001-v1",
      criteria: "Controlled-access (Type I)",
      typeOfData: { ja: null, en: null },
    }
    const req = { body } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(409)
    expect(json).toHaveBeenCalledWith({ error: "Dataset ID 'JGAD000099' is already in use" })
  })
})

describe("DELETE /api/datasets/:datasetKey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("deletes dataset and returns 204", async () => {
    const dataset = mockDataset("JGAD000001", "v1")
    const research = mockResearch("hum0001")
    const version = mockResearchVersion("hum0001")

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.includes("dataset/")) return JSON.stringify(dataset)
      if (filePath.includes("research/")) return JSON.stringify(research)
      if (filePath.includes("research-version/")) return JSON.stringify(version)
      if (filePath.includes("editor-state")) return JSON.stringify({ researches: {}, datasets: {}, experiments: {} })

      throw new Error("Unknown file")
    })
    mockUnlink.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/:datasetKey", "delete")
    const req = { params: { datasetKey: "JGAD000001-v1" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const send = vi.fn()
    const res = { json, status, send } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(204)
    expect(send).toHaveBeenCalled()
    expect(mockUnlink).toHaveBeenCalled()
  })

  it("returns 404 when dataset does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"))

    const handler = getHandler("/:datasetKey", "delete")
    const req = { params: { datasetKey: "JGAD999999-v1" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const send = vi.fn()
    const res = { json, status, send } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(404)
  })

  it("returns 400 for invalid dataset key", async () => {
    const handler = getHandler("/:datasetKey", "delete")
    const req = { params: { datasetKey: "invalid" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const send = vi.fn()
    const res = { json, status, send } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })
})
