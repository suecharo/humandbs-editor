import * as cheerio from "cheerio"
import { Router } from "express"
import fs from "node:fs/promises"
import path from "node:path"
import { z } from "zod/v4"

import { CriteriaCanonicalSchema } from "../../src/schemas/common"
import { ResearchSchema } from "../../src/schemas/research"
import { ResearchVersionSchema } from "../../src/schemas/research-version"
import { readEditorState } from "../utils/editor-state"
import { readJson } from "../utils/read-json"
import { parseHumId } from "../utils/validate-hum-id"

const LangSchema = z.enum(["ja", "en"]).default("ja")

export const createResearchesRouter = (structuredJsonDir: string, editorStateDir: string): Router => {
  const router = Router()

  router.get("/", async (_req, res) => {
    try {
      const researchDir = path.join(structuredJsonDir, "research")
      const files = await fs.readdir(researchDir)
      const jsonFiles = files.filter((f) => f.endsWith(".json"))

      const editorState = await readEditorState(editorStateDir)

      const items = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(researchDir, file)
          const research = await readJson(filePath, ResearchSchema)

          // Read latest research-version to get dataset count, IDs, and criteria
          let datasetCount = 0
          const datasetIds: string[] = []
          const criteriaSet = new Set<string>()
          try {
            const versionFile = `${research.latestVersion}.json`
            const versionPath = path.join(structuredJsonDir, "research-version", versionFile)
            const version = await readJson(versionPath, ResearchVersionSchema)
            datasetCount = version.datasets.length
            for (const ds of version.datasets) {
              datasetIds.push(ds.datasetId)
            }

            // Read each dataset to collect unique criteria values
            const DatasetCriteriaSchema = z.object({ criteria: CriteriaCanonicalSchema })
            await Promise.all(
              version.datasets.map(async (ds) => {
                try {
                  const dsFile = `${ds.datasetId}-${ds.version}.json`
                  const dsPath = path.join(structuredJsonDir, "dataset", dsFile)
                  const raw: unknown = JSON.parse(await fs.readFile(dsPath, "utf-8"))
                  const parsed = DatasetCriteriaSchema.safeParse(raw)
                  if (parsed.success) {
                    criteriaSet.add(parsed.data.criteria)
                  }
                } catch {
                  // Skip unreadable dataset files
                }
              }),
            )
          } catch {
            // If version file doesn't exist, dataset count remains 0
          }

          const curationStatus = editorState.researches[research.humId]?.status ?? "uncurated"

          return {
            humId: research.humId,
            title: research.title,
            datasetCount,
            datasetIds,
            versionCount: research.versionIds.length,
            accessRestrictions: [...criteriaSet].sort(),
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

  router.get("/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const filePath = path.join(structuredJsonDir, "research", `${humId}.json`)
      const research = await readJson(filePath, ResearchSchema)
      res.json(research)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get research ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to get research ${req.params.humId}` })
    }
  })

  router.put("/:humId", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const bodyResult = ResearchSchema.safeParse(req.body)
      if (!bodyResult.success) {
        res.status(400).json({ error: "Invalid request body", details: bodyResult.error.issues })

        return
      }

      if (bodyResult.data.humId !== humId) {
        res.status(400).json({ error: "humId in body does not match URL parameter" })

        return
      }

      const filePath = path.join(structuredJsonDir, "research", `${humId}.json`)

      // Verify the file already exists (only update, not create)
      try {
        await fs.access(filePath)
      } catch {
        res.status(404).json({ error: `Research ${humId} not found` })

        return
      }

      await fs.writeFile(filePath, JSON.stringify(bodyResult.data, null, 2), "utf-8")
      res.json(bodyResult.data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to update research ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to update research ${req.params.humId}` })
    }
  })

  router.get("/:humId/versions", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const researchPath = path.join(structuredJsonDir, "research", `${humId}.json`)
      const research = await readJson(researchPath, ResearchSchema)
      const versions = await Promise.all(
        research.versionIds.map((id) =>
          readJson(
            path.join(structuredJsonDir, "research-version", `${id}.json`),
            ResearchVersionSchema,
          ),
        ),
      )
      res.json(versions)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to get versions for ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to get versions for ${req.params.humId}` })
    }
  })

  router.get("/:humId/original", async (req, res) => {
    try {
      const humId = parseHumId(req.params.humId, res)
      if (humId === null) return

      const langResult = LangSchema.safeParse(req.query.lang)
      if (!langResult.success) {
        res.status(400).json({ error: "Invalid lang parameter. Must be 'ja' or 'en'" })

        return
      }
      const lang = langResult.data
      const researchPath = path.join(structuredJsonDir, "research", `${humId}.json`)
      const research = await readJson(researchPath, ResearchSchema)
      const originalUrl = research.url[lang]
      if (!originalUrl) {
        res.status(404).json({ error: "Original URL not found" })

        return
      }

      const url = new URL(originalUrl)
      if (url.hostname !== "humandbs.dbcls.jp") {
        res.status(403).json({ error: "Proxy is restricted to humandbs.dbcls.jp" })

        return
      }

      const MAX_REDIRECTS = 5
      let currentUrl = originalUrl
      let response = await fetch(currentUrl, { redirect: "manual" })
      let redirects = 0
      while (response.status >= 300 && response.status < 400 && redirects < MAX_REDIRECTS) {
        const location = response.headers.get("location")
        if (!location) break
        const redirectUrl = new URL(location, currentUrl)
        if (redirectUrl.hostname !== "humandbs.dbcls.jp") {
          res.status(403).json({ error: "Redirect target is outside allowed domain" })

          return
        }
        currentUrl = redirectUrl.toString()
        response = await fetch(currentUrl, { redirect: "manual" })
        redirects++
      }
      if (!response.ok) {
        res.status(502).json({ error: `Failed to fetch original page: ${response.status}` })

        return
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Remove header, menu, footer, go-to-top link
      $("#jsn-header").remove()
      $("#jsn-menu").remove()
      $("#jsn-footer").remove()
      $("#jsn-gotoplink").remove()
      $("#jsn-pos-user-top").remove()

      // Fix relative URLs to absolute
      const baseUrl = "https://humandbs.dbcls.jp"
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href")
        if (href && href.startsWith("/")) {
          $(el).attr("href", `${baseUrl}${href}`)
        }
      })
      $("img[src]").each((_, el) => {
        const src = $(el).attr("src")
        if (src && src.startsWith("/")) {
          $(el).attr("src", `${baseUrl}${src}`)
        }
      })

      // Remove inline width from tables
      $("table[style]").each((_, el) => {
        const style = $(el).attr("style") ?? ""
        $(el).attr("style", style.replace(/width:\s*\d+px;?/g, ""))
      })

      // Inject CSS to adapt to container width
      $("head").append(`<style>
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; }
        #jsn-page, #jsn-page-inner { width: 100% !important; min-width: 0 !important; margin: 0 !important; padding: 0 8px !important; }
        table { max-width: 100% !important; width: 100% !important; table-layout: auto; word-break: break-word; }
        img { max-width: 100%; height: auto; }
      </style>`)

      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.send($.html())
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to proxy original page for ${req.params.humId}:`, error)
      res.status(500).json({ error: `Failed to proxy original page for ${req.params.humId}` })
    }
  })

  return router
}
