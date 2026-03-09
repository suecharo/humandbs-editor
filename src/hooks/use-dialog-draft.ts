import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"

export const useDialogDraft = <T>(
  open: boolean,
  createDraft: () => T,
  onOpen?: () => void,
): [T, Dispatch<SetStateAction<T>>, boolean, Dispatch<SetStateAction<boolean>>] => {
  const [draft, setDraft] = useState<T>(createDraft)
  const [submitted, setSubmitted] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setDraft(createDraft())
      setSubmitted(false)
      onOpen?.()
    }
  }

  return [draft, setDraft, submitted, setSubmitted]
}
