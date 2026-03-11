import { Router } from "express"
import fs from "node:fs/promises"
import path from "node:path"

import { CreateDatasetBodySchema, DatasetSchema } from "../../src/schemas/dataset"
import { ResearchSchema } from "../../src/schemas/research"
import { ResearchVersionSchema } from "../../src/schemas/research-version"
import { readEditorState, writeEditorState } from "../utils/editor-state"
import { readJson } from "../utils/read-json"
import { parseDatasetKey } from "../utils/validate-dataset-id"

const DATASET_FILENAME_RE = /^(.+)-(v\d+)\.json$/

export const createDatasetsRouter = (structuredJsonDir: string, editorStateDir: string): Router => {
  const router = Router()

  // GET /
  router.get("/", async (_req, res) => {
    try {
      const datasetDir = path.join(structuredJsonDir, "dataset")
      let files: string[]
      try {
        files = await fs.readdir(datasetDir)
      } catch {
        res.json({ datasetIds: [] })

        return
      }

      const ids = new Set<string>()
      for (const file of files) {
        const match = DATASET_FILENAME_RE.exec(file)
        if (match?.[1]) {
          ids.add(match[1])
        }
      }

      res.json({ datasetIds: [...ids] })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to list dataset IDs:", error)
      res.status(500).json({ error: "Failed to list dataset IDs" })
    }
  })

  // GET /:datasetKey
  router.get("/:datasetKey", async (req, res) => {
    try {
      const parsed = parseDatasetKey(req.params.datasetKey, res)
      if (parsed === null) return

      const filePath = path.join(structuredJsonDir, "dataset", `${parsed.fileKey}.json`)
      const dataset = await readJson(filePath, DatasetSchema)
      const stat = await fs.stat(filePath)
      res.setHeader("X-Modified-At", stat.mtime.toISOString())
      res.json(dataset)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get dataset ${req.params.datasetKey}:`, error)
      res.status(500).json({ error: `Failed to get dataset ${req.params.datasetKey}` })
    }
  })

  // POST /
  router.post("/", async (req, res) => {
    try {
      const bodyResult = CreateDatasetBodySchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body", details: bodyResult.error.issues })

        return
      }

      const { datasetId, version, humId, humVersionId, criteria, typeOfData } = bodyResult.data
      const fileKey = `${datasetId}-${version}`
      const filePath = path.join(structuredJsonDir, "dataset", `${fileKey}.json`)

      // Check if file already exists
      try {
        await fs.access(filePath)
        res.status(409).json({ error: `Dataset ${fileKey} already exists` })

        return
      } catch {
        // File doesn't exist, which is expected
      }

      // Check if datasetId is already in use by another file
      try {
        const datasetDir = path.join(structuredJsonDir, "dataset")
        const files = await fs.readdir(datasetDir)
        const duplicate = files.some((f) => {
          const match = DATASET_FILENAME_RE.exec(f)

          return match?.[1] === datasetId
        })
        if (duplicate) {
          res.status(409).json({ error: `Dataset ID '${datasetId}' is already in use` })

          return
        }
      } catch {
        // Directory may not exist yet, skip check
      }

      const now = new Date().toISOString().split("T")[0] ?? new Date().toISOString()
      const dataset = {
        datasetId,
        version,
        versionReleaseDate: now,
        humId,
        humVersionId,
        releaseDate: now,
        criteria,
        typeOfData,
        experiments: [],
      }

      // Validate the constructed dataset
      const datasetResult = DatasetSchema.safeParse(dataset)
      if (!datasetResult.success) {
        res.status(400).json({ error: "Failed to construct valid dataset", details: datasetResult.error.issues })

        return
      }

      // Write dataset file
      await fs.writeFile(filePath, JSON.stringify(datasetResult.data, null, 2), "utf-8")

      // Add DatasetRef to the ResearchVersion
      const versionFilePath = path.join(structuredJsonDir, "research-version", `${humVersionId}.json`)
      try {
        const researchVersion = await readJson(versionFilePath, ResearchVersionSchema)
        researchVersion.datasets.push({ datasetId, version })
        await fs.writeFile(versionFilePath, JSON.stringify(researchVersion, null, 2), "utf-8")
      } catch (versionError) {
        // Compensate: remove the dataset file we just created
        try {
          await fs.unlink(filePath)
        } catch {
          // Best effort cleanup
        }
        // eslint-disable-next-line no-console
        console.error(`Failed to update research version ${humVersionId}:`, versionError)
        res.status(500).json({ error: `Failed to update research version ${humVersionId}` })

        return
      }

      res.status(201).json(datasetResult.data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create dataset:", error)
      res.status(500).json({ error: "Failed to create dataset" })
    }
  })

  // PUT /:datasetKey
  router.put("/:datasetKey", async (req, res) => {
    try {
      const parsed = parseDatasetKey(req.params.datasetKey, res)
      if (parsed === null) return

      const bodyResult = DatasetSchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body", details: bodyResult.error.issues })

        return
      }

      // Verify key matches body
      if (bodyResult.data.datasetId !== parsed.datasetId || bodyResult.data.version !== parsed.version) {
        res.status(400).json({ error: "datasetId/version in body does not match URL parameter" })

        return
      }

      const filePath = path.join(structuredJsonDir, "dataset", `${parsed.fileKey}.json`)

      // Verify file exists
      let stat
      try {
        stat = await fs.stat(filePath)
      } catch {
        res.status(404).json({ error: `Dataset ${parsed.fileKey} not found` })

        return
      }

      // Optimistic lock: compare mtime
      const baseModifiedAt = req.headers["x-base-modified-at"]
      if (typeof baseModifiedAt === "string") {
        const baseMtime = new Date(baseModifiedAt).getTime()
        const fileMtime = stat.mtime.getTime()
        if (fileMtime > baseMtime) {
          res.status(409).json({
            error: "File has been modified by another user",
            modifiedAt: stat.mtime.toISOString(),
          })

          return
        }
      }

      await fs.writeFile(filePath, JSON.stringify(bodyResult.data, null, 2), "utf-8")
      const newStat = await fs.stat(filePath)
      res.setHeader("X-Modified-At", newStat.mtime.toISOString())
      res.json(bodyResult.data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to update dataset ${req.params.datasetKey}:`, error)
      res.status(500).json({ error: `Failed to update dataset ${req.params.datasetKey}` })
    }
  })

  // DELETE /:datasetKey
  router.delete("/:datasetKey", async (req, res) => {
    try {
      const parsed = parseDatasetKey(req.params.datasetKey, res)
      if (parsed === null) return

      const filePath = path.join(structuredJsonDir, "dataset", `${parsed.fileKey}.json`)

      // Read dataset to get humId for finding the ResearchVersion
      let dataset
      try {
        dataset = await readJson(filePath, DatasetSchema)
      } catch {
        res.status(404).json({ error: `Dataset ${parsed.fileKey} not found` })

        return
      }

      // Delete the dataset file
      await fs.unlink(filePath)

      // Remove DatasetRef from ResearchVersion
      try {
        const researchPath = path.join(structuredJsonDir, "research", `${dataset.humId}.json`)
        const research = await readJson(researchPath, ResearchSchema)

        // Find the version that contains this dataset
        for (const versionId of research.versionIds) {
          const versionFilePath = path.join(structuredJsonDir, "research-version", `${versionId}.json`)
          try {
            const researchVersion = await readJson(versionFilePath, ResearchVersionSchema)
            const originalLength = researchVersion.datasets.length
            researchVersion.datasets = researchVersion.datasets.filter(
              (d) => !(d.datasetId === parsed.datasetId && d.version === parsed.version),
            )
            if (researchVersion.datasets.length !== originalLength) {
              await fs.writeFile(versionFilePath, JSON.stringify(researchVersion, null, 2), "utf-8")
            }
          } catch {
            // Skip versions that can't be read
          }
        }
      } catch (versionError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to update research versions for ${dataset.humId}:`, versionError)
        // Continue - dataset is already deleted
      }

      // Remove from editor-state
      try {
        const editorState = await readEditorState(editorStateDir)
        if (editorState.datasets[parsed.fileKey]) {
          const { [parsed.fileKey]: _, ...remainingDatasets } = editorState.datasets
          await writeEditorState(editorStateDir, { ...editorState, datasets: remainingDatasets })
        }
      } catch {
        // Non-critical - continue
      }

      res.status(204).send()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to delete dataset ${req.params.datasetKey}:`, error)
      res.status(500).json({ error: `Failed to delete dataset ${req.params.datasetKey}` })
    }
  })

  return router
}
