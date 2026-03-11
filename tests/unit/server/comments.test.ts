import type { Request, Response } from "express"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { createCommentsRouter } from "../../../server/routes/comments"

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

const editorStateWithComments = (humId: string, comments: unknown[]) => ({
  researches: {
    [humId]: {
      status: "uncurated",
      updatedAt: new Date().toISOString(),
      editingBy: null,
      editingByName: null,
      editingAt: null,
      comments,
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

const getHandler = (routePath: string, method = "get"): Handler => {
  const router = createCommentsRouter(EDITOR_STATE_DIR)
  const layers = (router as unknown as { stack: RouteLayer[] }).stack

  for (const layer of layers) {
    if (layer.route?.path !== routePath) continue
    const match = layer.route.stack.find((l) => l.method === method)
    if (match) return match.handle
  }

  throw new Error(`${method.toUpperCase()} ${routePath} handler not found on router`)
}

describe("GET /api/comments/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("returns empty array when no comments exist", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(emptyEditorState()))

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ comments: [] })
  })

  it("returns comments in order", async () => {
    const comments = [
      { id: "aaa", author: "alice", text: "first", createdAt: "2025-01-01T00:00:00.000Z" },
      { id: "bbb", author: "bob", text: "second", createdAt: "2025-01-02T00:00:00.000Z" },
    ]
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithComments("hum0001", comments)))

    const handler = getHandler("/research/:humId")
    const req = { params: { humId: "hum0001" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const result = json.mock.calls[0]![0] as { comments: unknown[] }
    expect(result.comments).toHaveLength(2)
    expect(result.comments[0]).toEqual(comments[0])
    expect(result.comments[1]).toEqual(comments[1])
  })
})

describe("POST /api/comments/research/:humId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("adds a comment and returns it", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(emptyEditorState()))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId", "post")
    const req = { params: { humId: "hum0001" }, body: { author: "alice", text: "hello" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledTimes(1)
    const result = json.mock.calls[0]![0] as { comment: { id: string; author: string; text: string; createdAt: string } }
    expect(result.comment.author).toBe("alice")
    expect(result.comment.text).toBe("hello")
    expect(result.comment.id).toBeTruthy()
    expect(result.comment.createdAt).toBeTruthy()
  })

  it("returns 400 when author is empty", async () => {
    const handler = getHandler("/research/:humId", "post")
    const req = { params: { humId: "hum0001" }, body: { author: "", text: "hello" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 400 when text is empty", async () => {
    const handler = getHandler("/research/:humId", "post")
    const req = { params: { humId: "hum0001" }, body: { author: "alice", text: "" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("returns 400 for invalid humId format", async () => {
    const handler = getHandler("/research/:humId", "post")
    const req = { params: { humId: "../etc/passwd" }, body: { author: "alice", text: "hello" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(status).toHaveBeenCalledWith(400)
  })

  it("appends to existing comments", async () => {
    const existing = [{ id: "aaa", author: "bob", text: "existing", createdAt: "2025-01-01T00:00:00.000Z" }]
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithComments("hum0001", existing)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId", "post")
    const req = { params: { humId: "hum0001" }, body: { author: "alice", text: "new comment" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    const writtenState = JSON.parse(mockWriteFile.mock.calls[0]![1] as string) as {
      researches: Record<string, { comments: unknown[] }>
    }
    expect(writtenState.researches["hum0001"]!.comments).toHaveLength(2)
  })
})

describe("DELETE /api/comments/research/:humId/:commentId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("deletes a comment", async () => {
    const comments = [
      { id: "aaa", author: "alice", text: "first", createdAt: "2025-01-01T00:00:00.000Z" },
      { id: "bbb", author: "bob", text: "second", createdAt: "2025-01-02T00:00:00.000Z" },
    ]
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithComments("hum0001", comments)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId/:commentId", "delete")
    const req = { params: { humId: "hum0001", commentId: "aaa" } } as unknown as Request
    const json = vi.fn()
    const res = { json, status: vi.fn().mockReturnThis() } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ deleted: true })

    const writtenState = JSON.parse(mockWriteFile.mock.calls[0]![1] as string) as {
      researches: Record<string, { comments: { id: string }[] }>
    }
    expect(writtenState.researches["hum0001"]!.comments).toHaveLength(1)
    expect(writtenState.researches["hum0001"]!.comments[0]!.id).toBe("bbb")
  })

  it("returns 200 for non-existent commentId (idempotent)", async () => {
    const comments = [{ id: "aaa", author: "alice", text: "first", createdAt: "2025-01-01T00:00:00.000Z" }]
    mockReadFile.mockResolvedValue(JSON.stringify(editorStateWithComments("hum0001", comments)))
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)

    const handler = getHandler("/research/:humId/:commentId", "delete")
    const req = { params: { humId: "hum0001", commentId: "nonexistent" } } as unknown as Request
    const json = vi.fn()
    const status = vi.fn().mockReturnThis()
    const res = { json, status } as unknown as Response

    await handler(req, res, vi.fn())

    expect(json).toHaveBeenCalledWith({ deleted: true })
    expect(status).not.toHaveBeenCalledWith(404)
  })
})
