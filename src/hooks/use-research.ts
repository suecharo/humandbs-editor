import { useQuery } from "@tanstack/react-query"

import type { Research } from "../schemas/research"
import { ResearchSchema } from "../schemas/research"

const fetchResearch = async (humId: string): Promise<Research> => {
  const res = await fetch(`/api/researches/${encodeURIComponent(humId)}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch research ${humId}: ${res.status}`)
  }
  const data: unknown = await res.json()

  return ResearchSchema.parse(data)
}

export const useResearch = (humId: string) =>
  useQuery({
    queryKey: ["research", humId],
    queryFn: () => fetchResearch(humId),
  })
