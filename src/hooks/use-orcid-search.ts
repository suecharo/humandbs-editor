import { useDebouncedSearch } from "./use-debounced-search"

export interface OrcidSearchResult {
  orcidId: string
  givenNames: string
  familyNames: string
  institutionNames: string[]
}

interface OrcidExpandedResult {
  "orcid-id": string
  "given-names": string | null
  "family-names": string | null
  "institution-name": string[]
}

interface OrcidExpandedSearchResponse {
  "num-found": number
  "expanded-result": OrcidExpandedResult[] | null
}

const ORCID_API_BASE = "https://pub.orcid.org/v3.0"

const fetchOrcidSearch = async (query: string): Promise<OrcidSearchResult[]> => {
  const url = `${ORCID_API_BASE}/expanded-search/?q=${encodeURIComponent(query)}&rows=10`
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`ORCID API error: ${res.status}`)
  }

  const body = (await res.json()) as OrcidExpandedSearchResponse
  const results = body["expanded-result"] ?? []

  return results.map((r) => ({
    orcidId: r["orcid-id"],
    givenNames: r["given-names"] ?? "",
    familyNames: r["family-names"] ?? "",
    institutionNames: r["institution-name"] ?? [],
  }))
}

export const useOrcidSearch = (query: string) =>
  useDebouncedSearch(query, {
    queryKeyPrefix: "orcid-search",
    fetchFn: fetchOrcidSearch,
  })
