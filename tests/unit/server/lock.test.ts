import type { Request, Response } from "express"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createLockRouter } from "../../../server/routes/lock"

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

const EDITOR_STATE_DIR = "/test/data"

const emptyEditorState = () => ({
  researches: {},
  datasets: {},
  experiments: {},
})

const editorStateWithLock = (humId: string, userName: string, editingAt: string) => ({
  researches: {
    [humId]: {
      status: "uncurated",
      updatedAt: new Date().toISOString(),
      editingBy: userName,
      editingByName: userName,
      editingAt,
      sectionStatuses: {},
    },
  },
  datasets: {},
  experiments: {},
})

interface RouteLayer {
  route?: {
    path: string
    stack: { method: string; handle: (req: Request, res: Response, next: () => void) => Promise<void> }[]
  }
}

type Handler = (req: Request, res: Response, next: () => void) => Promise<void>

const getHandler = (routePath: string, method = "post"): Handler => {
  const router = createLockRouter(EDITOR_STATE_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  for (const layer of layers) {
    if (layer.route?.path !== routePath) continue
    const match = layer.route.stack.find((l) => l.method === method)
    if (match) return match.handle
  }

  throw new Error(`${method.toUpperCase()} ${routePath} handler not found on router`)
}

describe("POST /api/lock/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("acquires lock when no existing lock", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(emptyEditorState()))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { editingBy: string; editingByName: string; editingAt: string }
    expect(result.editingBy).toBe("alice")
    expect(result.editingByName).toBe("alice")
    expect(result.editingAt).toBeTruthy()
  })

  it("acquires lock when existing lock is expired", async () => {
    const expired = new Date(Date.now() - 31 * 60 * 1000).toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "bob", expired)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { editingBy: string }
    expect(result.editingBy).toBe("alice")
  })

  it("returns 409 when another user holds active lock", async () => {
    const recent = new Date().toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "bob", recent)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(409)
    const result = json.mock.calls[0]![0] as { editingBy: string; editingByName: string }
    expect(result.editingBy).toBe("bob")
    expect(result.editingByName).toBe("bob")
  })

  it("force takes lock from another user", async () => {
    const recent = new Date().toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "bob", recent)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice", force: true } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { editingBy: string }
    expect(result.editingBy).toBe("alice")
  })

  it("updates editingAt as heartbeat for same user", async () => {
    const oldTime = new Date(Date.now() - 60 * 1000).toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "alice", oldTime)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { editingBy: string; editingAt: string }
    expect(result.editingBy).toBe("alice")
    expect(new Date(result.editingAt).getTime()).toBeGreaterThan(new Date(oldTime).getTime())
  })

  it("returns 400 for invalid humId format", async () => {
    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "../etc/passwd" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 400 for empty userName", async () => {
    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" }, body: { userName: "" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })
})

describe("DELETE /api/lock/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("releases lock held by the same user", async () => {
    const recent = new Date().toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "alice", recent)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId", "delete")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ released: true })

    // Verify editingBy was set to null in written state
    const writtenState = JSON.parse(mockWriteFile.mock.calls[0]![1] as string) as {
      researches: Record<string, { editingBy: string | null }>
    }
    expect(writtenState.researches["hum0001"]!.editingBy).toBeNull()
  })

  it("does not modify lock held by another user (idempotent)", async () => {
    const recent = new Date().toISOString()
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithLock("hum0001", "bob", recent)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId", "delete")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ released: true })
    // writeEditorState should NOT have been called since lock belongs to bob
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 200 when no lock exists (idempotent)", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(emptyEditorState()))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId", "delete")
    const req = { params: { humId: "hum0001" }, body: { userName: "alice" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ released: true })
  })
})
