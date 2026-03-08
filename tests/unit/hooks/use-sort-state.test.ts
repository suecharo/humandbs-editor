import { act, renderHook } from "@testing-library/react"
import { describe, it, expect } from "vitest"

import { useSortState } from "../../../src/hooks/use-sort-state"

type Key = "name" | "date" | "count"

describe("useSortState", () => {
  it("starts with no active sort by default", () => {
    const { result } = renderHook(() => useSortState<Key>())
    expect(result.current.sortBy).toBeNull()
    expect(result.current.sortOrder).toBe("asc")
  })

  it("starts with given defaults", () => {
    const { result } = renderHook(() => useSortState<Key>("name", "desc"))
    expect(result.current.sortBy).toBe("name")
    expect(result.current.sortOrder).toBe("desc")
  })

  it("cycles asc -> desc -> clear on same key", () => {
    const { result } = renderHook(() => useSortState<Key>())

    act(() => result.current.handleSort("name"))
    expect(result.current.sortBy).toBe("name")
    expect(result.current.sortOrder).toBe("asc")

    act(() => result.current.handleSort("name"))
    expect(result.current.sortBy).toBe("name")
    expect(result.current.sortOrder).toBe("desc")

    act(() => result.current.handleSort("name"))
    expect(result.current.sortBy).toBeNull()
    expect(result.current.sortOrder).toBe("asc")
  })

  it("resets to asc when switching to a different key", () => {
    const { result } = renderHook(() => useSortState<Key>())

    act(() => result.current.handleSort("name"))
    act(() => result.current.handleSort("name"))
    expect(result.current.sortOrder).toBe("desc")

    act(() => result.current.handleSort("date"))
    expect(result.current.sortBy).toBe("date")
    expect(result.current.sortOrder).toBe("asc")
  })

  it("returns stable handleSort across renders", () => {
    const { result, rerender } = renderHook(() => useSortState<Key>())
    const first = result.current.handleSort
    rerender()
    expect(result.current.handleSort).toBe(first)
  })
})
