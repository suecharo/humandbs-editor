import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Research } from "../schemas/research"
import { ResearchSchema } from "../schemas/research"
import { fetchApi } from "../utils/fetch-api"

export const useSaveResearch = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (research: Research) =>
      fetchApi(
        `/api/researches/${encodeURIComponent(research.humId)}`,
        ResearchSchema,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(research),
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["research", humId], data)
    },
  })
}
