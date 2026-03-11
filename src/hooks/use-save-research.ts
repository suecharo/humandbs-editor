import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"

import type { Research } from "../schemas/research"
import { ResearchSchema } from "../schemas/research"
import { fileModifiedAtAtom } from "../stores/research-edit"
import { fetchApiWithHeaders } from "../utils/fetch-api"

export const useSaveResearch = (humId: string) => {
  const queryClient = useQueryClient()
  const [modifiedAt, setModifiedAt] = useAtom(fileModifiedAtAtom)

  return useMutation({
    mutationFn: async (research: Research) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (modifiedAt) {
        headers["X-Base-Modified-At"] = modifiedAt
      }

      return fetchApiWithHeaders(
        `/api/researches/${encodeURIComponent(research.humId)}`,
        ResearchSchema,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(research),
        },
      )
    },
    onSuccess: ({ data, headers }) => {
      queryClient.setQueryData(["research", humId], data)
      const newModifiedAt = headers.get("X-Modified-At")
      if (newModifiedAt) {
        setModifiedAt(newModifiedAt)
      }
    },
  })
}
