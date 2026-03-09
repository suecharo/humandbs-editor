import { useQuery } from "@tanstack/react-query"

import { ResearchVersionSchema } from "../schemas/research-version"
import { fetchApi } from "../utils/fetch-api"

export const useResearchVersions = (humId: string) =>
  useQuery({
    queryKey: ["research-versions", humId],
    queryFn: () => fetchApi(
      `/api/researches/${encodeURIComponent(humId)}/versions`,
      ResearchVersionSchema.array(),
    ),
  })
