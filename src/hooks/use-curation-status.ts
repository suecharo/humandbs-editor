import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod/v4"

import type { SectionCurationStatus } from "../schemas/editor-state"
import { CurationStatusSchema, SectionCurationStatusSchema } from "../schemas/editor-state"

const ResearchCurationStatusSchema = z.object({
  status: CurationStatusSchema,
  sectionStatuses: z.record(z.string(), SectionCurationStatusSchema),
})

export type ResearchCurationStatus = z.infer<typeof ResearchCurationStatusSchema>

const fetchCurationStatus = async (humId: string): Promise<ResearchCurationStatus> => {
  const res = await fetch(`/api/curation-status/research/${encodeURIComponent(humId)}`)
  if (!res.ok) throw new Error(`Failed to fetch curation status: ${res.status}`)
  const data: unknown = await res.json()

  return ResearchCurationStatusSchema.parse(data)
}

export const useCurationStatus = (humId: string) =>
  useQuery({
    queryKey: ["curation-status", "research", humId],
    queryFn: () => fetchCurationStatus(humId),
  })

export const useUpdateSectionStatus = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sectionStatuses: Record<string, SectionCurationStatus>) => {
      const res = await fetch(`/api/curation-status/research/${encodeURIComponent(humId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionStatuses }),
      })
      if (!res.ok) throw new Error(`Failed to update curation status: ${res.status}`)
      const data: unknown = await res.json()

      return ResearchCurationStatusSchema.parse(data)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["curation-status", "research", humId], data)
    },
  })
}
