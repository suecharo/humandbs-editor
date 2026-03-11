import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"

import type { Dataset } from "../schemas/dataset"
import { DatasetSchema } from "../schemas/dataset"
import { datasetModifiedAtsAtom } from "../stores/research-edit"
import { fetchApiWithHeaders } from "../utils/fetch-api"

export const useSaveDataset = () => {
  const queryClient = useQueryClient()
  const [modifiedAts, setModifiedAts] = useAtom(datasetModifiedAtsAtom)

  return useMutation({
    mutationFn: async (dataset: Dataset) => {
      const key = `${dataset.datasetId}-${dataset.version}`
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const modifiedAt = modifiedAts[key]
      if (modifiedAt) {
        headers["X-Base-Modified-At"] = modifiedAt
      }

      return fetchApiWithHeaders(
        `/api/datasets/${encodeURIComponent(key)}`,
        DatasetSchema,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(dataset),
        },
      )
    },
    onSuccess: ({ data, headers }) => {
      const key = `${data.datasetId}-${data.version}`
      queryClient.setQueryData(["dataset", key], data)
      const newModifiedAt = headers.get("X-Modified-At")
      if (newModifiedAt) {
        setModifiedAts((prev) => ({ ...prev, [key]: newModifiedAt }))
      }
    },
  })
}
