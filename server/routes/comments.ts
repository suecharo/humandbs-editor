import { Router } from "express"
import crypto from "node:crypto"
import { z } from "zod/v4"

import { readEditorState, writeEditorState } from "../utils/editor-state"
import { parseHumId } from "../utils/validate-hum-id"

const TEXT_MAX_LENGTH = 10000

const AddCommentBodySchema = z.object({
  author: z.string().min(1),
  text: z.string().min(1).max(TEXT_MAX_LENGTH),
})

export const createCommentsRouter = (editorStateDir: string): Router => {
  const router = Router()

  router.get("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const editorState = await readEditorState(editorStateDir)
      const comments = editorState.researches[humId]?.comments ?? []

      res.json({ comments })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get comments for ${req.params.humId}:`, error)
      res.status(500).json({ error: "Failed to get comments" })
    }
  })

  router.post("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const bodyResult = AddCommentBodySchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body" })

        return
      }

      const comment = {
        id: crypto.randomUUID(),
        author: bodyResult.data.author,
        text: bodyResult.data.text,
        createdAt: new Date().toISOString(),
      }

      const editorState = await readEditorState(editorStateDir)
      const entry = editorState.researches[humId]
      if (entry) {
        entry.comments = [...(entry.comments ?? []), comment]
      } else {
        editorState.researches[humId] = {
          status: "uncurated",
          sectionStatuses: {},
          updatedAt: new Date().toISOString(),
          editingBy: null,
          editingByName: null,
          editingAt: null,
          comments: [comment],
        }
      }

      await writeEditorState(editorStateDir, editorState)

      res.json({ comment })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to add comment for ${req.params.humId}:`, error)
      res.status(500).json({ error: "Failed to add comment" })
    }
  })

  router.delete("/research/:humId/:commentId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const { commentId } = req.params

      const editorState = await readEditorState(editorStateDir)
      const entry = editorState.researches[humId]
      if (entry?.comments) {
        entry.comments = entry.comments.filter((c) => c.id !== commentId)
      }

      await writeEditorState(editorStateDir, editorState)

      res.json({ deleted: true })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to delete comment for ${req.params.humId}:`, error)
      res.status(500).json({ error: "Failed to delete comment" })
    }
  })

  return router
}
