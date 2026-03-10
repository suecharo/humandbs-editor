import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Dataset } from "../schemas/dataset"
import { DatasetSchema } from "../schemas/dataset"
import { fetchApi } from "../utils/fetch-api"

export const useSaveDataset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dataset: Dataset) => {
      const key = `${dataset.datasetId}-${dataset.version}`

      return fetchApi(
        `/api/datasets/${encodeURIComponent(key)}`,
        DatasetSchema,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataset),
        },
      )
    },
    onSuccess: (data) => {
      const key = `${data.datasetId}-${data.version}`
      queryClient.setQueryData(["dataset", key], data)
    },
  })
}
