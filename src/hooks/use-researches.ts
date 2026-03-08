import { useQuery } from "@tanstack/react-query"

import type { ResearchListItem } from "../schemas/research"
import { ResearchListItemSchema } from "../schemas/research"

const fetchResearches = async (): Promise<ResearchListItem[]> => {
  const res = await fetch("/api/researches")
  if (!res.ok) {
    throw new Error(`Failed to fetch researches: ${res.status}`)
  }
  const data: unknown = await res.json()

  return ResearchListItemSchema.array().parse(data)
}

export const useResearches = () =>
  useQuery({
    queryKey: ["researches"],
    queryFn: fetchResearches,
  })
