import { Router } from "express"
import { z } from "zod/v4"

import { SectionCurationStatusSchema } from "../../src/schemas/editor-state"
import type { SectionCurationStatus } from "../../src/schemas/editor-state"
import { deriveCurationStatus, RESEARCH_SECTION_IDS } from "../../src/utils/curation"
import { readEditorState, writeEditorState } from "../utils/editor-state"
import { parseHumId } from "../utils/validate-hum-id"

const UpdateBodySchema = z.object({
  sectionStatuses: z.record(z.string(), SectionCurationStatusSchema),
})

export const createCurationStatusRouter = (editorStateDir: string): Router => {
  const router = Router()

  router.get("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const editorState = await readEditorState(editorStateDir)
      const stored = editorState.researches[humId]?.sectionStatuses ?? {}

      const sectionStatuses: Record<string, SectionCurationStatus> = {}
      for (const id of RESEARCH_SECTION_IDS) {
        sectionStatuses[id] = (stored[id] as SectionCurationStatus) ?? "uncurated"
      }

      const status = deriveCurationStatus(sectionStatuses)

      res.json({ status, sectionStatuses })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get curation status for ${req.params.humId}:`, error)
      res.status(500).json({ error: "Failed to get curation status" })
    }
  })

  router.put("/research/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const bodyResult = UpdateBodySchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body" })

        return
      }

      const editorState = await readEditorState(editorStateDir)
      const currentEntry = editorState.researches[humId]
      const currentSectionStatuses = currentEntry?.sectionStatuses ?? {}

      const merged: Record<string, SectionCurationStatus> = {}
      for (const id of RESEARCH_SECTION_IDS) {
        merged[id] = bodyResult.data.sectionStatuses[id]
          ?? (currentSectionStatuses[id] as SectionCurationStatus)
          ?? "uncurated"
      }

      const status = deriveCurationStatus(merged)

      editorState.researches[humId] = {
        status,
        sectionStatuses: merged,
        updatedAt: new Date().toISOString(),
        editingBy: currentEntry?.editingBy ?? null,
        editingByName: currentEntry?.editingByName ?? null,
        editingAt: currentEntry?.editingAt ?? null,
      }

      await writeEditorState(editorStateDir, editorState)

      res.json({ status, sectionStatuses: merged })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to update curation status for ${req.params.humId}:`, error)
      res.status(500).json({ error: "Failed to update curation status" })
    }
  })

  return router
}
