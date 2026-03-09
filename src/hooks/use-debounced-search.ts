import { useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "./use-debounced-value"

interface DebouncedSearchConfig<T> {
  queryKeyPrefix: string
  fetchFn: (query: string) => Promise<T[]>
  minQueryLength?: number
  debounceMs?: number
  staleTimeMs?: number
}

const DEFAULT_MIN_QUERY_LENGTH = 2
const DEFAULT_DEBOUNCE_MS = 300
const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000

export const useDebouncedSearch = <T>(
  query: string,
  config: DebouncedSearchConfig<T>,
): { data: T[]; isLoading: boolean } => {
  const minLen = config.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH
  const debounceMs = config.debounceMs ?? DEFAULT_DEBOUNCE_MS
  const staleTimeMs = config.staleTimeMs ?? DEFAULT_STALE_TIME_MS

  const debouncedQuery = useDebouncedValue(query, debounceMs)

  const { data, isLoading } = useQuery({
    queryKey: [config.queryKeyPrefix, debouncedQuery],
    queryFn: () => config.fetchFn(debouncedQuery),
    enabled: debouncedQuery.length >= minLen,
    staleTime: staleTimeMs,
    retry: false,
  })

  return {
    data: data ?? [],
    isLoading: debouncedQuery.length >= minLen && isLoading,
  }
}
