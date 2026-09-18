"use client"

import { useEffect, useState } from "react"
import {
  buildPocketPetWebSocketBaseUrl,
  buildPocketPetWebSocketUrl,
  mergePocketPetLiveLogs,
  parsePocketPetStatusMessage,
  type PocketPetLiveUpdate,
} from "@/lib/pet-live-sync"

const HEARTBEAT_INTERVAL_MS = 25_000
const MAX_RECONNECT_DELAY_MS = 10_000

export type PetLiveSyncConnectionStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline"

interface UsePetLiveSyncOptions {
  enabled: boolean
  userId: string
}

interface PetLiveSyncResult {
  update: PocketPetLiveUpdate | null
  connectionStatus: PetLiveSyncConnectionStatus
  lastUpdatedAt: number | null
}

export function usePetLiveSync({
  enabled,
  userId,
}: UsePetLiveSyncOptions): PetLiveSyncResult {
  const [update, setUpdate] = useState<PocketPetLiveUpdate | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<PetLiveSyncConnectionStatus>(enabled ? "connecting" : "offline")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("WebSocket" in window)) {
      return
    }

    let disposed = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null
    let reconnectAttempt = 0
    let currentStateVersion = -1

    const clearHeartbeat = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    const scheduleReconnect = () => {
      if (disposed || reconnectTimer) return
      setConnectionStatus("reconnecting")
      const delay = Math.min(1_000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS)
      reconnectAttempt += 1
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect()
      }, delay)
    }

    const connect = () => {
      if (disposed) return
      setConnectionStatus(reconnectAttempt === 0 ? "connecting" : "reconnecting")

      try {
        const baseUrl = process.env.NEXT_PUBLIC_PET_SYNC_WS_URL
          || buildPocketPetWebSocketBaseUrl(process.env.NEXT_PUBLIC_PET_SYNC_HOST)
        socket = new WebSocket(buildPocketPetWebSocketUrl(baseUrl, userId))
      } catch {
        setConnectionStatus("offline")
        scheduleReconnect()
        return
      }

      socket.addEventListener("open", () => {
        if (disposed) return
        reconnectAttempt = 0
        setConnectionStatus("live")
        clearHeartbeat()
        heartbeatTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "heartbeat", payload: { timestamp: Date.now() } }))
          }
        }, HEARTBEAT_INTERVAL_MS)
      })

      socket.addEventListener("message", (event) => {
        if (disposed) return
        const nextUpdate = parsePocketPetStatusMessage(event.data, currentStateVersion)
        if (!nextUpdate) return

        if (nextUpdate.stateVersion !== undefined) {
          currentStateVersion = nextUpdate.stateVersion
        }
        const receivedAt = nextUpdate.updatedAt || Date.now()
        setLastUpdatedAt(receivedAt)
        setUpdate((current) => ({
          ...current,
          ...nextUpdate,
          ...(nextUpdate.logs
            ? { logs: mergePocketPetLiveLogs(current?.logs, nextUpdate.logs) }
            : {}),
        }))
      })

      socket.addEventListener("close", () => {
        clearHeartbeat()
        if (!disposed) scheduleReconnect()
      })

      socket.addEventListener("error", () => {
        if (!disposed) setConnectionStatus("offline")
      })
    }

    connect()

    return () => {
      disposed = true
      clearHeartbeat()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = null
      socket?.close()
      socket = null
    }
  }, [enabled, userId])

  return { update, connectionStatus, lastUpdatedAt }
}
