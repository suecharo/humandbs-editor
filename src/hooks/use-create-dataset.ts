import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { CreateDatasetBody } from "../schemas/dataset"
import { DatasetSchema } from "../schemas/dataset"
import { fetchApi } from "../utils/fetch-api"

export const useCreateDataset = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateDatasetBody) =>
      fetchApi(
        "/api/datasets",
        DatasetSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-versions", humId] })
    },
  })
}
