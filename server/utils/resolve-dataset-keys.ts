import path from "node:path"

import { ResearchSchema } from "../../src/schemas/research"
import { ResearchVersionSchema } from "../../src/schemas/research-version"

import { readJson } from "./read-json"

export const resolveDatasetSectionKeys = async (
  structuredJsonDir: string,
  humId: string,
): Promise<string[]> => {
  try {
    const research = await readJson(
      path.join(structuredJsonDir, "research", `${humId}.json`),
      ResearchSchema,
    )
    const versionFile = `${humId}-${research.latestVersion}.json`
    const version = await readJson(
      path.join(structuredJsonDir, "research-version", versionFile),
      ResearchVersionSchema,
    )

    return version.datasets.map(
      (ds) => `dataset:${ds.datasetId}-${ds.version}`,
    )
  } catch {
    return []
  }
}
