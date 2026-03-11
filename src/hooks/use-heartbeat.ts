import { useEffect } from "react"

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000

export const useHeartbeat = (humId: string, userName: string, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const id = setInterval(() => {
      fetch(`/api/lock/research/${encodeURIComponent(humId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      }).catch(() => {
        // Heartbeat failure is non-critical
      })
    }, HEARTBEAT_INTERVAL_MS)

    return () => clearInterval(id)
  }, [humId, userName, enabled])
}
