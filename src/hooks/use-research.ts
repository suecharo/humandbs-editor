import { useQuery } from "@tanstack/react-query"

import { ResearchSchema } from "../schemas/research"
import { fetchApi } from "../utils/fetch-api"

export const useResearch = (humId: string) =>
  useQuery({
    queryKey: ["research", humId],
    queryFn: () => fetchApi(
      `/api/researches/${encodeURIComponent(humId)}`,
      ResearchSchema,
    ),
  })
