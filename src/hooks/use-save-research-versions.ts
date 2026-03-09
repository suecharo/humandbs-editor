import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { ResearchVersion } from "../schemas/research-version"
import { ResearchVersionSchema } from "../schemas/research-version"
import { fetchApi } from "../utils/fetch-api"

export const useSaveResearchVersions = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (versions: ResearchVersion[]) =>
      fetchApi(
        `/api/researches/${encodeURIComponent(humId)}/versions`,
        ResearchVersionSchema.array(),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(versions),
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["research-versions", humId], data)
    },
  })
}
