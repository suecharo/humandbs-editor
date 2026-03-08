import { Router } from "express"
import fs from "node:fs/promises"
import path from "node:path"

import { ResearchSchema } from "../../src/schemas/research"
import { ResearchVersionSchema } from "../../src/schemas/research-version"
import { readEditorState } from "../utils/editor-state"
import { readJson } from "../utils/read-json"

export const createResearchesRouter = (structuredJsonDir: string): Router => {
  const router = Router()

  router.get("/", async (_req, res) => {
    try {
      const researchDir = path.join(structuredJsonDir, "research")
      const files = await fs.readdir(researchDir)
      const jsonFiles = files.filter((f) => f.endsWith(".json"))

      const editorState = await readEditorState(structuredJsonDir)

      const items = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(researchDir, file)
          const research = await readJson(filePath, ResearchSchema)

          // Read latest research-version to get dataset count
          let datasetCount = 0
          try {
            const versionFile = `${research.latestVersion}.json`
            const versionPath = path.join(structuredJsonDir, "research-version", versionFile)
            const version = await readJson(versionPath, ResearchVersionSchema)
            datasetCount = version.datasets.length
          } catch {
            // If version file doesn't exist, dataset count remains 0
          }

          const curationStatus = editorState.researches[research.humId]?.status ?? "uncurated"

          return {
            humId: research.humId,
            title: research.title,
            datasetCount,
            curationStatus,
            datePublished: research.datePublished,
            dateModified: research.dateModified,
          }
        }),
      )

      // Natural sort by humId
      items.sort((a, b) => a.humId.localeCompare(b.humId, undefined, { numeric: true }))

      res.json(items)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to list researches:", error)
      res.status(500).json({ error: "Failed to list researches" })
    }
  })

  return router
}
