import { NextRequest } from "next/server"
import Redis from "ioredis"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const REDIS_CHANNEL = "multimodal:realtime"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId")

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      let redisSubscriber: Redis | null = null
      let heartbeatInterval: ReturnType<typeof setInterval> | null = null
      let closed = false
      
      const sendEvent = (event: string, data: object) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      const sendHeartbeat = () => {
        const heartbeat = {
          timestamp: new Date().toISOString(),
          type: "heartbeat",
        }
        sendEvent("heartbeat", heartbeat)
      }

      const closeStream = () => {
        if (closed) return
        closed = true
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        heartbeatInterval = null
        redisSubscriber?.disconnect()
        controller.close()
      }

      const startHeartbeat = () => {
        if (heartbeatInterval || closed) return
        sendHeartbeat()
        heartbeatInterval = setInterval(sendHeartbeat, 30000)
      }

      request.signal.addEventListener("abort", closeStream)

      try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
        redisSubscriber = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        })

        await redisSubscriber.connect()

        await redisSubscriber.subscribe(REDIS_CHANNEL)

        sendEvent("connected", { 
          status: "ok", 
          channel: REDIS_CHANNEL,
          studentIdFilter: studentId,
          timestamp: new Date().toISOString(),
        })

        redisSubscriber.on("message", (channel, message) => {
          if (channel !== REDIS_CHANNEL) return

          try {
            const data = JSON.parse(message)

            if (studentId && data.studentId !== studentId) {
              return
            }

            const eventType = data.type === 'voice_transcription' ? 'voice_transcription' 
              : data.type === 'voice_level' ? 'voice_level'
              : 'multimodal_data'

            console.log(`[SSE] Sending event: ${eventType}`, {
              studentId: data.studentId,
              hasText: !!data.text,
              hasAudioLevel: data.audioLevel !== undefined,
              hasVitalSign: !!data.vitalSign,
            })

            sendEvent(eventType, data)
          } catch (error) {
            console.error("[SSE] Failed to parse message:", error)
          }
        })

        startHeartbeat()

      } catch {
        if (closed) return
        console.warn("[SSE] Redis unavailable; keeping the realtime stream alive in degraded mode.")
        redisSubscriber?.disconnect()
        redisSubscriber = null
        sendEvent("connected", {
          status: "degraded",
          channel: REDIS_CHANNEL,
          studentIdFilter: studentId,
          realtimeAvailable: false,
          timestamp: new Date().toISOString(),
        })
        startHeartbeat()
      }
    },
    cancel() {
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
