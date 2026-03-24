import { Router } from "express"
import { z } from "zod/v4"

import { readEditorState, writeEditorState } from "../utils/editor-state"
import { parseHumId } from "../utils/validate-hum-id"

const LOCK_TIMEOUT_MS = 30 * 60 * 1000

const LockBodySchema = z.object({
  userName: z.string().min(1),
  force: z.boolean().optional(),
})

const isLockExpired = (editingAt: string | null): boolean => {
  if (editingAt === null) return true

  return Date.now() - new Date(editingAt).getTime() > LOCK_TIMEOUT_MS
}

export const createLockRouter = (editorStateDir: string): Router => {
  const router = Router()

  // POST /research/:humId - lock acquire / heartbeat / force take
  router.post("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const bodyResult = LockBodySchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body", details: bodyResult.error.issues })

        return
      }

      const { userName, force } = bodyResult.data
      const editorState = await readEditorState(editorStateDir)

      const state = editorState.researches[humId] ?? {
        status: "uncurated" as const,
        sectionStatuses: {},
        updatedAt: new Date().toISOString(),
        editingBy: null,
        editingByName: null,
        editingAt: null,
      }

      const now = new Date().toISOString()

      if (state.editingBy === null || isLockExpired(state.editingAt)) {
        // No lock or expired -> acquire
        state.editingBy = userName
        state.editingByName = userName
        state.editingAt = now
      } else if (state.editingBy === userName) {
        // Same user -> heartbeat
        state.editingAt = now
      } else if (force === true) {
        // Different user + force -> take over
        state.editingBy = userName
        state.editingByName = userName
        state.editingAt = now
      } else {
        // Different user, not expired, not force -> conflict
        res.status(409).json({
          error: `${state.editingByName} が編集中です`,
          editingBy: state.editingBy,
          editingByName: state.editingByName,
          editingAt: state.editingAt,
        })

        return
      }

      editorState.researches[humId] = state
      await writeEditorState(editorStateDir, editorState)

      res.json({
        editingBy: state.editingBy,
        editingByName: state.editingByName,
        editingAt: state.editingAt,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to acquire lock for ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to acquire lock for ${req.params.humId}` })
    }
  })

  // DELETE /research/:humId - lock release
  router.delete("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const bodyResult = LockBodySchema.pick({ userName: true }).safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body", details: bodyResult.error.issues })

        return
      }

      const { userName } = bodyResult.data
      const editorState = await readEditorState(editorStateDir)
      const state = editorState.researches[humId]

      if (state && state.editingBy === userName) {
        state.editingBy = null
        state.editingByName = null
        state.editingAt = null
        editorState.researches[humId] = state
        await writeEditorState(editorStateDir, editorState)
      }

      res.json({ released: true })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to release lock for ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to release lock for ${req.params.humId}` })
    }
  })

  return router
}
