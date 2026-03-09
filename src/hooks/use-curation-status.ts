import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod/v4"

import type { SectionCurationStatus } from "../schemas/editor-state"
import { CurationStatusSchema, SectionCurationStatusSchema } from "../schemas/editor-state"
import { fetchApi } from "../utils/fetch-api"

const ResearchCurationStatusSchema = z.object({
  status: CurationStatusSchema,
  sectionStatuses: z.record(z.string(), SectionCurationStatusSchema),
})

export type ResearchCurationStatus = z.infer<typeof ResearchCurationStatusSchema>

export const useCurationStatus = (humId: string) =>
  useQuery({
    queryKey: ["curation-status", "research", humId],
    queryFn: () => fetchApi(
      `/api/curation-status/research/${encodeURIComponent(humId)}`,
      ResearchCurationStatusSchema,
    ),
  })

export const useUpdateSectionStatus = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sectionStatuses: Record<string, SectionCurationStatus>) =>
      fetchApi(
        `/api/curation-status/research/${encodeURIComponent(humId)}`,
        ResearchCurationStatusSchema,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionStatuses }),
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["curation-status", "research", humId], data)
    },
  })
}
