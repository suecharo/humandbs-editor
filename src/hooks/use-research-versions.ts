import { useQuery } from "@tanstack/react-query"

import type { ResearchVersion } from "../schemas/research-version"
import { ResearchVersionSchema } from "../schemas/research-version"

const fetchResearchVersions = async (humId: string): Promise<ResearchVersion[]> => {
  const res = await fetch(`/api/researches/${encodeURIComponent(humId)}/versions`)
  if (!res.ok) {
    throw new Error(`Failed to fetch versions for ${humId}: ${res.status}`)
  }
  const data: unknown = await res.json()

  return ResearchVersionSchema.array().parse(data)
}

export const useResearchVersions = (humId: string) =>
  useQuery({
    queryKey: ["research-versions", humId],
    queryFn: () => fetchResearchVersions(humId),
  })
