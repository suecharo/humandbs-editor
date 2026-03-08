import fs from "node:fs/promises"
import path from "node:path"

import type { EditorState } from "../../src/schemas/editor-state"
import { EditorStateSchema } from "../../src/schemas/editor-state"

const EDITOR_STATE_FILE = "editor-state.json"

const DEFAULT_EDITOR_STATE: EditorState = {
  researches: {},
  datasets: {},
  experiments: {},
}

export const getEditorStatePath = (structuredJsonDir: string): string =>
  path.join(structuredJsonDir, EDITOR_STATE_FILE)

export const readEditorState = async (structuredJsonDir: string): Promise<EditorState> => {
  const filePath = getEditorStatePath(structuredJsonDir)
  try {
    const content = await fs.readFile(filePath, "utf-8")
    const data: unknown = JSON.parse(content)

    return EditorStateSchema.parse(data)
  } catch {
    return DEFAULT_EDITOR_STATE
  }
}

export const writeEditorState = async (structuredJsonDir: string, state: EditorState): Promise<void> => {
  const filePath = getEditorStatePath(structuredJsonDir)
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8")
}
