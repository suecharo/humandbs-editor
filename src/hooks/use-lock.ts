import { useMutation } from "@tanstack/react-query"

interface LockInfo {
  editingBy: string
  editingByName: string
  editingAt: string
}

interface LockConflict extends LockInfo {
  error: string
}

export class LockConflictError extends Error {
  readonly lockInfo: LockConflict

  constructor(lockInfo: LockConflict) {
    super(lockInfo.error)
    this.name = "LockConflictError"
    this.lockInfo = lockInfo
  }
}

export const useAcquireLock = () =>
  useMutation({
    mutationFn: async ({ humId, userName, force }: { humId: string; userName: string; force?: boolean }): Promise<LockInfo> => {
      const res = await fetch(`/api/lock/research/${encodeURIComponent(humId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, force }),
      })

      const body: unknown = await res.json()

      if (res.status === 409) {
        throw new LockConflictError(body as LockConflict)
      }

      if (!res.ok) {
        throw new Error(`Failed to acquire lock: ${res.status}`)
      }

      return body as LockInfo
    },
  })

