import express from "express"

import { createCurationStatusRouter } from "./routes/curation-status"
import { createResearchesRouter } from "./routes/researches"

const STRUCTURED_JSON_DIR = process.env["STRUCTURED_JSON_DIR"]
if (!STRUCTURED_JSON_DIR) {
  // eslint-disable-next-line no-console
  console.error("STRUCTURED_JSON_DIR environment variable is required")
  process.exit(1)
}

const EDITOR_STATE_DIR = process.env["EDITOR_STATE_DIR"]
if (!EDITOR_STATE_DIR) {
  // eslint-disable-next-line no-console
  console.error("EDITOR_STATE_DIR environment variable is required")
  process.exit(1)
}

const app = express()
const PORT = 3001

app.use(express.json())
app.use("/api/researches", createResearchesRouter(STRUCTURED_JSON_DIR, EDITOR_STATE_DIR))
app.use("/api/curation-status", createCurationStatusRouter(EDITOR_STATE_DIR))

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${PORT}`)
})
