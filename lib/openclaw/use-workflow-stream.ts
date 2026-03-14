"use client"

import { useEffect, useRef, useState } from "react"

type AnyPayload = Record<string, unknown>

let sharedSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let listeners = new Map<string, (type: string, data: AnyPayload) => void>()

function cleanupSource() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (sharedSource) {
    sharedSource.close()
    sharedSource = null
  }
}

function notify(type: string, data: AnyPayload) {
  listeners.forEach((listener) => {
    try {
      listener(type, data)
    } catch {
    }
  })
}

function getOrCreateSource() {
  if (sharedSource && sharedSource.readyState !== EventSource.CLOSED) {
    return sharedSource
  }

  cleanupSource()
  const source = new EventSource("/api/openclaw/workflow/stream")
  sharedSource = source

  source.addEventListener("snapshot", (event) => {
    try {
      notify("snapshot", JSON.parse(event.data))
    } catch {
    }
  })

  source.addEventListener("activity", (event) => {
    try {
      notify("activity", JSON.parse(event.data))
    } catch {
    }
  })

  source.addEventListener("request", (event) => {
    try {
      notify("request", JSON.parse(event.data))
    } catch {
    }
  })

  source.addEventListener("task", (event) => {
    try {
      notify("task", JSON.parse(event.data))
    } catch {
    }
  })

  source.addEventListener("connection", (event) => {
    try {
      notify("connection", JSON.parse(event.data))
    } catch {
    }
  })

  source.onerror = () => {
    cleanupSource()
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (listeners.size > 0) {
        getOrCreateSource()
      }
    }, 2000)
  }

  return source
}

function subscribe(id: string, listener: (type: string, data: AnyPayload) => void) {
  listeners.set(id, listener)
  if (listeners.size === 1) {
    getOrCreateSource()
  }
}

function unsubscribe(id: string) {
  listeners.delete(id)
  if (listeners.size === 0) {
    cleanupSource()
  }
}

export type OpenClawRequestItem = {
  id: string
  state: string
  content: string
  assignedTo?: string
  agentName?: string
  agentColor?: string
  createdAt?: number
  completedAt?: number | null
}

export type OpenClawTaskItem = {
  id: string
  requestId: string
  title?: string
  detail?: string
  status: string
  assignedAgent?: string
  agentName?: string
  createdAt?: number
  startedAt?: number | null
  completedAt?: number | null
}

export type OpenClawActivityItem = {
  id: string
  requestId?: string
  taskId?: string
  state?: string
  type?: string
  agentId?: string
  agentName?: string
  agentColor?: string
  message: string
  time?: string
  timestamp?: number
}

export type OpenClawConnection = {
  connected: boolean
  gatewayUrl?: string | null
  lastConnectedAt?: string | Date | null
  lastDisconnectedAt?: string | Date | null
  lastError?: string | null
}

export function useOpenClawWorkflowStream() {
  const [requests, setRequests] = useState<OpenClawRequestItem[]>([])
  const [tasks, setTasks] = useState<OpenClawTaskItem[]>([])
  const [activities, setActivities] = useState<OpenClawActivityItem[]>([])
  const [connection, setConnection] = useState<OpenClawConnection>({ connected: false })
  const idRef = useRef(`openclaw_${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const id = idRef.current

    subscribe(id, (type, data) => {
      if (type === "snapshot") {
        setRequests((data.requests as OpenClawRequestItem[]) || [])
        setTasks((data.tasks as OpenClawTaskItem[]) || [])
        setActivities((data.events as OpenClawActivityItem[]) || [])
        setConnection((data.connection as OpenClawConnection) || { connected: false })
        return
      }

      if (type === "activity") {
        const item = data as unknown as OpenClawActivityItem
        setActivities((prev) => {
          if (prev.some((v) => v.id === item.id)) return prev
          return [item, ...prev].slice(0, 120)
        })
        return
      }

      if (type === "request") {
        const item = data as unknown as OpenClawRequestItem
        setRequests((prev) => {
          const index = prev.findIndex((v) => v.id === item.id)
          if (index === -1) return [item, ...prev].slice(0, 60)
          const next = [...prev]
          next[index] = item
          return next
        })
        return
      }

      if (type === "task") {
        const item = data as unknown as OpenClawTaskItem
        setTasks((prev) => {
          const index = prev.findIndex((v) => v.id === item.id)
          if (index === -1) return [item, ...prev].slice(0, 60)
          const next = [...prev]
          next[index] = item
          return next
        })
        return
      }

      if (type === "connection") {
        setConnection(data as unknown as OpenClawConnection)
      }
    })

    return () => unsubscribe(id)
  }, [])

  return { requests, tasks, activities, connection }
}
