import { useCallback, useState } from "react"

export type SortOrder = "asc" | "desc"

interface SortState<T extends string> {
  sortBy: T | null
  sortOrder: SortOrder
}

export const useSortState = <T extends string>(defaultSortBy: T | null = null, defaultSortOrder: SortOrder = "asc") => {
  const [sort, setSort] = useState<SortState<T>>({
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
  })

  const handleSort = useCallback((key: T) => {
    setSort((prev) => {
      if (prev.sortBy === key) {
        // asc -> desc -> none (clear)
        if (prev.sortOrder === "asc") {
          return { ...prev, sortOrder: "desc" }
        }

        return { sortBy: null, sortOrder: "asc" }
      }

      return { sortBy: key, sortOrder: "asc" }
    })
  }, [])

  return { sortBy: sort.sortBy, sortOrder: sort.sortOrder, handleSort }
}
