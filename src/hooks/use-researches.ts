import { useQuery } from "@tanstack/react-query"

import { ResearchListItemSchema } from "../schemas/research"
import { fetchApi } from "../utils/fetch-api"

export const useResearches = () =>
  useQuery({
    queryKey: ["researches"],
    queryFn: () => fetchApi(
      "/api/researches",
      ResearchListItemSchema.array(),
    ),
  })
