import { useCallback, useState } from "react"

interface StableKeysState {
  nextId: number
  keys: number[]
}

/**
 * Assign stable numeric keys to list items that support add/delete.
 *
 * - When length grows, new keys are appended (setState-during-render pattern).
 * - Call `removeKey(index)` synchronously before/with the state update
 *   that removes the item so the keys stay in sync on the next render.
 */
export const useStableKeys = (length: number) => {
  const [state, setState] = useState<StableKeysState>(() => {
    const keys: number[] = []
    for (let i = 0; i < length; i++) {
      keys.push(i)
    }

    return { nextId: length, keys }
  })

  // Grow: assign fresh keys for newly added items (setState during render)
  if (state.keys.length < length) {
    const newKeys = [...state.keys]
    let { nextId } = state
    while (newKeys.length < length) {
      newKeys.push(nextId++)
    }
    setState({ nextId, keys: newKeys })
  }

  const removeKey = useCallback((index: number) => {
    setState((prev) => {
      const newKeys = [...prev.keys]
      newKeys.splice(index, 1)

      return { ...prev, keys: newKeys }
    })
  }, [])

  return { keys: state.keys.slice(0, length), removeKey }
}
