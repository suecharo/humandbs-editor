import { useQuery } from "@tanstack/react-query"

import { DatasetSchema } from "../schemas/dataset"
import { fetchApi } from "../utils/fetch-api"

export const useDataset = (datasetKey: string | null) =>
  useQuery({
    queryKey: ["dataset", datasetKey],
    queryFn: () => {
      if (datasetKey === null) throw new Error("datasetKey is null")

      return fetchApi(
        `/api/datasets/${encodeURIComponent(datasetKey)}`,
        DatasetSchema,
      )
    },
    enabled: datasetKey !== null,
  })
