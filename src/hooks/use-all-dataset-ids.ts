import { useQuery } from "@tanstack/react-query"

import { AllDatasetIdsResponseSchema } from "../schemas/dataset"
import { fetchApi } from "../utils/fetch-api"

export const useAllDatasetIds = () =>
  useQuery({
    queryKey: ["all-dataset-ids"],
    queryFn: () => fetchApi("/api/datasets", AllDatasetIdsResponseSchema),
  })
