import { useRef } from "react"

/**
 * Return a function that assigns a stable integer key to each object reference.
 * Keys are preserved across re-renders and list mutations (reorder, delete).
 */
export const useStableKey = <T extends object>(): ((item: T) => number) => {
  const nextId = useRef(0)
  const map = useRef(new WeakMap<T, number>())

  return (item: T): number => {
    let id = map.current.get(item)
    if (id === undefined) {
      id = nextId.current++
      map.current.set(item, id)
    }

    return id
  }
}
