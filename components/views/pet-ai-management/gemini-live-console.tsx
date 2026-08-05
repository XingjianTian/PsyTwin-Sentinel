"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GoogleGenAI, Modality } from "@google/genai"
import { LoaderCircle, Mic, MicOff, Play, Square, Volume2, Wifi, WifiOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GeminiLiveMessage } from "@/lib/pet-ai/gemini-live"
import { REACHY_EMOTIONS } from "@/lib/pet-ai/reachy-choreographies"
import { classifyMessageRisk, getRiskPresentation, highestRiskLevel, normalizeRiskLevel, type RiskLevel } from "@/lib/pet-ai/risk-presentation"
import { cn } from "@/lib/utils"

type SessionState = "idle" | "connecting" | "active" | "error"
type Message = Pick<GeminiLiveMessage, "id" | "role" | "content" | "riskLevel">

type LiveSession = Awaited<ReturnType<GoogleGenAI["live"]["connect"]>>
type AudioContextWithSink = AudioContext & { setSinkId?: (sinkId: string) => Promise<void> }
type AudioDevice = MediaDeviceInfo & { kind: "audioinput" | "audiooutput" }
type PetPersonality = {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}
const robotAudioLabelPattern = /(reachy|robot|心宠|clawbody|mini)/i
const petEmotionNames = REACHY_EMOTIONS.map((item) => item.name)
const petEmotionLabels = new Map(REACHY_EMOTIONS.map((item) => [item.name, item.label]))

function selectFixedPetEmotion(personality: PetPersonality) {
  if (personality.neuroticism >= 70) return "calming1"
  if (personality.agreeableness >= 70) return "understanding1"
  if (personality.extraversion >= 70) return "welcoming1"
  if (personality.openness >= 70) return "curious1"
  return "attentive1"
}
/* Deprecated: Live actions are now deterministic and run at turnComplete.
const petActionTools = [{
  functionDeclarations: [{
    name: "play_pet_emotion",
    description: "根据学生当前情绪和心宠个性，播放一个安全的实体心宠表情动作。只有在情绪表达明显或需要非语言安慰时调用；普通短句不必调用。",
    parametersJsonSchema: {
      type: "object",
      properties: {
        emotion: { type: "string", enum: petEmotionNames, description: "实体心宠官方表情动作名称" },
      },
      required: ["emotion"],
      additionalProperties: false,
    },
  }],
}]
*/

function base64FromBytes(bytes: Uint8Array) {
  let binary = ""
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  return btoa(binary)
}

function resample(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return input
  const output = new Float32Array(Math.ceil(input.length * toRate / fromRate))
  const ratio = fromRate / toRate
  for (let index = 0; index < output.length; index += 1) {
    const position = index * ratio
    const left = Math.floor(position)
    const right = Math.min(left + 1, input.length - 1)
    const weight = position - left
    output[index] = input[left] * (1 - weight) + input[right] * weight
  }
  return output
}

function pcm16FromFloat(input: Float32Array) {
  const output = new Int16Array(input.length)
  for (let index = 0; index < input.length; index += 1) {
    const value = Math.max(-1, Math.min(1, input[index]))
    output[index] = value < 0 ? value * 0x8000 : value * 0x7fff
  }
  return new Uint8Array(output.buffer)
}

function floatFromBase64(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Int16Array(bytes.buffer)
}

function requestMicrophone(deviceId?: string, timeoutMs = 15_000) {
  return new Promise<MediaStream>((resolve, reject) => {
    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error("麦克风权限请求超时，请点击浏览器地址栏中的麦克风图标并允许访问"))
    }, timeoutMs)

    navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }).then((stream) => {
      if (settled) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      settled = true
      window.clearTimeout(timer)
      resolve(stream)
    }).catch((error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      reject(error)
    })
  })
}

async function selectRobotAudioDevices() {
  const permissionStream = await requestMicrophone()
  permissionStream.getTracks().forEach((track) => track.stop())
  const devices = (await navigator.mediaDevices.enumerateDevices()) as AudioDevice[]
  const microphone = devices.find((device) => device.kind === "audioinput" && robotAudioLabelPattern.test(device.label))
  const speaker = devices.find((device) => device.kind === "audiooutput" && robotAudioLabelPattern.test(device.label))
  if (!microphone || !speaker) {
    throw new Error("未找到实体心宠的麦克风和扬声器，请先在“心宠调试”确认设备媒体状态，并确保 USB 音频设备已连接")
  }
  return { microphone, speaker }
}

async function createRobotPlaybackContext(speaker: AudioDevice) {
  const context = new AudioContext({ sampleRate: 24_000 }) as AudioContextWithSink
  if (!context.setSinkId) {
    await context.close()
    throw new Error("当前浏览器不支持选择实体心宠扬声器，请使用最新版 Chrome 或 Edge")
  }
  try {
    await context.setSinkId(speaker.deviceId)
  } catch {
    await context.close()
    throw new Error(`无法切换到实体心宠扬声器：${speaker.label}`)
  }
  return context
}

function createLiveSessionKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function requestRobotProcessing(enabled: boolean) {
  const response = await fetch("/api/pet-ai/reachy/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "processing", enabled }),
  })
  if (response.ok) return
  if (!enabled) return

  // 兼容尚未重启 Host Bridge 的旧版本，至少执行一次原有的左右摆耳动作。
  const fallbackResponse = await fetch("/api/pet-ai/reachy/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "device_action", deviceAction: "antenna_test" }),
  })
  if (!fallbackResponse.ok) {
    const payload = await fallbackResponse.json().catch(() => ({}))
    throw new Error(payload.message || "无法启动实体心宠摆耳动作")
  }
}

function buildPersonalityActionInstruction(personality: PetPersonality, fixedEmotion: string) {
  const tendencies = [
    `开放性 ${personality.openness}/100：${personality.openness >= 65 ? "可使用好奇、惊叹、思考等更有变化的表达" : "优先使用简单、稳定的表达"}`,
    `尽责性 ${personality.conscientiousness}/100：${personality.conscientiousness >= 65 ? "动作克制、专注、节奏稳定" : "允许更轻松自然的动作"}`,
    `外向性 ${personality.extraversion}/100：${personality.extraversion >= 65 ? "更适合欢迎、热情、开心等外向表达" : "以安静回应和轻微动作优先"}`,
    `亲和性 ${personality.agreeableness}/100：${personality.agreeableness >= 65 ? "优先理解、安抚、感谢和喜爱等陪伴表达" : "保持尊重边界，不强行热情"}`,
    `敏感性 ${personality.neuroticism}/100：${personality.neuroticism >= 65 ? "面对负面情绪时动作更轻、更慢、更安抚" : "可以保持平稳自然的反馈"}`,
  ]
  return [
    `本次会话固定实体动作：${fixedEmotion}。每次 Gemini Live 开始播放回答时，客户端都会执行一次该动作，让动作与语音同步；不要等待模型主动调用工具，也不要临时改成其他动作。`,
    "实体动作个性规则：",
    ...tendencies,
    "动作只表达陪伴和情绪，不代表诊断、命令或保证；发现自伤、伤人或紧急危险信号时，不播放夸张或欢快动作，优先使用 calming1、understanding1、helpful1、attentive1 或 serenity1。",
  ].join("\n")
}

type GeminiLiveConsoleProps = {
  studentId: string
  studentName: string
  petName: string
  canStart: boolean
  personality: PetPersonality
  riskLevel?: RiskLevel
  onRiskLevelChange?: (level: RiskLevel) => void
  onConversationSaved?: (messages: GeminiLiveMessage[]) => void
}

export function GeminiLiveConsole({ studentId, studentName, petName, canStart, personality, riskLevel, onRiskLevelChange, onConversationSaved }: GeminiLiveConsoleProps) {
  const [state, setState] = useState<SessionState>("idle")
  const [stage, setStage] = useState("")
  const [error, setError] = useState("")
  const [audioRoute, setAudioRoute] = useState("")
  const [actionStatus, setActionStatus] = useState("")
  const [motionStatus, setMotionStatus] = useState("")
  const [persistenceError, setPersistenceError] = useState("")
  const [fixedEmotion, setFixedEmotion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputDraft, setInputDraft] = useState("")
  const [outputDraft, setOutputDraft] = useState("")
  const [liveRiskLevel, setLiveRiskLevel] = useState<RiskLevel>(() => normalizeRiskLevel(riskLevel))
  const sessionRef = useRef<LiveSession | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureContextRef = useRef<AudioContext | null>(null)
  const playbackContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const nextPlaybackTimeRef = useRef(0)
  const inputDraftRef = useRef("")
  const outputDraftRef = useRef("")
  const connectionErrorRef = useRef(false)
  const setupReadyRef = useRef(false)
  const sessionOpenedRef = useRef(false)
  const sessionClosedRef = useRef(false)
  const processingMotionRef = useRef(false)
  const liveRiskLevelRef = useRef<RiskLevel>(normalizeRiskLevel(riskLevel))
  const handshakeTimerRef = useRef<number | null>(null)
  const turnActionExecutedRef = useRef(false)
  const inputTurnOpenRef = useRef(false)
  const liveSessionKeyRef = useRef("")
  const turnSequenceRef = useRef(0)
  const pendingPersistenceRef = useRef<GeminiLiveMessage[]>([])
  const persistenceInFlightRef = useRef(false)

  const setProcessingMotion = useCallback(async (enabled: boolean) => {
    if (processingMotionRef.current === enabled) return
    processingMotionRef.current = enabled
    setMotionStatus(enabled ? "正在启动耳朵摆动…" : "正在停止耳朵摆动…")
    try {
      await requestRobotProcessing(enabled)
      setMotionStatus(enabled ? "耳朵摆动已启动" : "耳朵摆动已停止")
    } catch (caught) {
      if (processingMotionRef.current === enabled) processingMotionRef.current = false
      setMotionStatus(enabled ? "耳朵摆动未启动（不影响语音）" : "耳朵摆动停止请求失败")
      console.warn("[Gemini Live] 实体心宠摆耳动作不可用", caught)
    }
  }, [])

  const reportInputRisk = useCallback((text: string) => {
    const detectedRisk = classifyMessageRisk(text)
    const nextRisk = highestRiskLevel(liveRiskLevelRef.current, detectedRisk)
    if (nextRisk === liveRiskLevelRef.current) return
    liveRiskLevelRef.current = nextRisk
    setLiveRiskLevel(nextRisk)
    onRiskLevelChange?.(nextRisk)
  }, [onRiskLevelChange])

  useEffect(() => {
    const nextRisk = highestRiskLevel(liveRiskLevelRef.current, normalizeRiskLevel(riskLevel))
    if (nextRisk === liveRiskLevelRef.current) return
    liveRiskLevelRef.current = nextRisk
    setLiveRiskLevel(nextRisk)
  }, [riskLevel])

  const flushPersistedMessages = useCallback(async () => {
    if (pendingPersistenceRef.current.length === 0 || persistenceInFlightRef.current) return
    persistenceInFlightRef.current = true
    const batch = [...pendingPersistenceRef.current]
    try {
      const response = await fetch("/api/pet-ai/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, messages: batch }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || "Gemini Live 对话保存失败")

      const batchIds = new Set(batch.map((message) => message.id))
      pendingPersistenceRef.current = pendingPersistenceRef.current.filter((message) => !batchIds.has(message.id))
      const savedRisk = normalizeRiskLevel(payload.data?.riskLevel)
      if (savedRisk !== "LOW") {
        liveRiskLevelRef.current = highestRiskLevel(liveRiskLevelRef.current, savedRisk)
        setLiveRiskLevel(liveRiskLevelRef.current)
        onRiskLevelChange?.(liveRiskLevelRef.current)
      }
      onConversationSaved?.(batch)
      if ((payload.data?.workOrderSync?.created || 0) > 0) window.dispatchEvent(new Event("risk-work-orders:changed"))
      setPersistenceError("")
    } catch (caught) {
      setPersistenceError((caught as Error).message || "对话保存失败，停止后请重试")
    } finally {
      persistenceInFlightRef.current = false
    }
  }, [onConversationSaved, onRiskLevelChange, studentId])

  const finalizeCurrentTurn = useCallback(() => {
    const studentMessage = inputDraftRef.current.trim()
    const petMessage = outputDraftRef.current.trim()
    inputDraftRef.current = ""
    outputDraftRef.current = ""
    setInputDraft("")
    setOutputDraft("")
    inputTurnOpenRef.current = false
    if (!studentMessage && !petMessage) return

    const sequence = turnSequenceRef.current + 1
    turnSequenceRef.current = sequence
    const sessionKey = liveSessionKeyRef.current || "before-session"
    const startedAt = new Date()
    const turnRisk = classifyMessageRisk(studentMessage)
    const savedMessages: GeminiLiveMessage[] = [
      ...(studentMessage ? [{
        id: `gemini-live-${sessionKey}-${sequence}-student`,
        role: "student" as const,
        content: studentMessage,
        riskLevel: turnRisk,
        createdAt: startedAt.toISOString(),
        seq: sequence * 2,
      }] : []),
      ...(petMessage ? [{
        id: `gemini-live-${sessionKey}-${sequence}-pet`,
        role: "pet" as const,
        content: petMessage,
        riskLevel: turnRisk,
        createdAt: new Date(startedAt.getTime() + 1).toISOString(),
        seq: sequence * 2 + 1,
      }] : []),
    ]
    setMessages((current) => [...current, ...savedMessages.map(({ id, role, content, riskLevel }) => ({ id, role, content, riskLevel }))].slice(-20))
    pendingPersistenceRef.current = [...pendingPersistenceRef.current, ...savedMessages]
    void flushPersistedMessages()
  }, [flushPersistedMessages])

  const closeSession = useCallback((nextState: SessionState = "idle") => {
    connectionErrorRef.current = nextState === "error"
    sessionClosedRef.current = true
    setupReadyRef.current = false
    void setProcessingMotion(false)
    if (handshakeTimerRef.current !== null) {
      window.clearTimeout(handshakeTimerRef.current)
      handshakeTimerRef.current = null
    }
    sessionRef.current?.close()
    sessionRef.current = null
    processorRef.current?.disconnect()
    processorRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    void captureContextRef.current?.close()
    captureContextRef.current = null
    void playbackContextRef.current?.close()
    playbackContextRef.current = null
    nextPlaybackTimeRef.current = 0
    setState(nextState)
  }, [setProcessingMotion])

  const playAudio = useCallback((base64: string) => {
    const context = playbackContextRef.current
    if (!context) return
    playbackContextRef.current = context
    const pcm = floatFromBase64(base64)
    const buffer = context.createBuffer(1, pcm.length, 24000)
    const channel = buffer.getChannelData(0)
    for (let index = 0; index < pcm.length; index += 1) channel[index] = pcm[index] / 0x8000
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    const startAt = Math.max(context.currentTime, nextPlaybackTimeRef.current)
    source.start(startAt)
    nextPlaybackTimeRef.current = startAt + buffer.duration
  }, [])

  const executePetEmotion = useCallback(async (emotion: string) => {
    const label = petEmotionLabels.get(emotion) || emotion
    if (!petEmotionNames.includes(emotion)) throw new Error("模型请求了未允许的实体动作")
    setActionStatus(`正在执行：${label}`)
    const response = await fetch("/api/pet-ai/reachy/device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "choreography", kind: "emotion", move: emotion, playSound: false }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.message || "实体心宠动作执行失败")
    setActionStatus(`已执行：${label}`)
    return { emotion, label }
  }, [])

  /* Deprecated: the model no longer decides whether an answer gets an action.
  const handleToolCalls = useCallback(async (functionCalls: FunctionCall[]) => {
    const responses = await Promise.all(functionCalls.map(async (call) => {
      const emotion = typeof call.args?.emotion === "string" ? call.args.emotion : ""
      try {
        const result = await executePetEmotion(emotion)
        return { id: call.id, name: call.name, response: { output: result } }
      } catch (caught) {
        const message = (caught as Error).message || "实体动作执行失败"
        setActionStatus(`动作失败：${message}`)
        return { id: call.id, name: call.name, response: { error: message } }
      }
    }))
    sessionRef.current?.sendToolResponse({ functionResponses: responses })
  }, [executePetEmotion])
  */

  const startSession = useCallback(async () => {
    if (!canStart || state === "connecting" || state === "active") return
    setState("connecting")
    setError("")
    setActionStatus("")
    setMotionStatus("")
    setPersistenceError("")
    const sessionFixedEmotion = selectFixedPetEmotion(personality)
    setFixedEmotion(sessionFixedEmotion)
    turnActionExecutedRef.current = false
    inputTurnOpenRef.current = false
    sessionOpenedRef.current = false
    sessionClosedRef.current = false
    processingMotionRef.current = false
    liveSessionKeyRef.current = createLiveSessionKey()
    turnSequenceRef.current = 0
    void flushPersistedMessages()
    setStage("正在关闭已有的 ClawBody 语音会话…")
    try {
      connectionErrorRef.current = false
      setupReadyRef.current = false
      try {
        const legacySessionResponse = await fetch("/api/pet-ai/reachy/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stop", studentId }),
        })
        if (!legacySessionResponse.ok) console.warn("[Gemini Live] 旧 ClawBody 语音会话未能确认停止")
      } catch {
        console.warn("[Gemini Live] 旧 ClawBody 语音服务不可用，继续使用 Gemini Live")
      }
      void setProcessingMotion(true)
      setStage("正在检查实体心宠麦克风和扬声器…")
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("当前浏览器不支持麦克风访问")
      const { microphone, speaker } = await selectRobotAudioDevices()
      const stream = await requestMicrophone(microphone.deviceId)
      streamRef.current = stream
      playbackContextRef.current = await createRobotPlaybackContext(speaker)
      setAudioRoute(`${microphone.label} → ${speaker.label}`)
      setStage(`已切换到实体心宠音频：${microphone.label} → ${speaker.label}`)

      setStage("正在获取 Gemini 临时令牌…")
      const controller = new AbortController()
      const requestTimer = window.setTimeout(() => controller.abort(), 20_000)
      let tokenResponse: Response
      try {
        tokenResponse = await fetch("/api/pet-ai/gemini/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(requestTimer)
      }
      const tokenPayload = await tokenResponse.json().catch(() => ({}))
      if (!tokenResponse.ok) throw new Error(tokenPayload.message || "Gemini Live 配置不可用")
      const { token, model, systemInstruction, voice } = tokenPayload.data
      setStage("正在建立 Gemini Live 连接…")

      handshakeTimerRef.current = window.setTimeout(() => {
        if (setupReadyRef.current || connectionErrorRef.current || sessionClosedRef.current) return
        setStage("连接超时")
        setError("Gemini Live 连接超时，请检查网络或刷新页面后重试")
        closeSession("error")
      }, 20_000)
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } })
      const sessionPromise = ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || "Kore" } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `${systemInstruction}\n${buildPersonalityActionInstruction(personality, sessionFixedEmotion)}\n请使用简体中文，回答简短、温和，适合直接语音播放。`,
        },
        callbacks: {
          onopen: () => {
            sessionOpenedRef.current = true
            setStage("Gemini Live 已连接，正在初始化…")
          },
          onmessage: (response) => {
            if (response.setupComplete) {
              setupReadyRef.current = true
              if (handshakeTimerRef.current !== null) {
                window.clearTimeout(handshakeTimerRef.current)
                handshakeTimerRef.current = null
              }
            }
            const content = response.serverContent
            const inputText = content?.inputTranscription?.text || ""
            const outputText = content?.outputTranscription?.text || ""
            if (inputText) {
              if (!inputTurnOpenRef.current) {
                inputTurnOpenRef.current = true
                turnActionExecutedRef.current = false
              }
              inputDraftRef.current += inputText
              setInputDraft(inputDraftRef.current)
              reportInputRisk(inputDraftRef.current)
            }
            if (outputText) {
              outputDraftRef.current += outputText
              setOutputDraft(outputDraftRef.current)
            }
            const hasModelAudio = Boolean(content?.modelTurn?.parts?.some((part) => Boolean(part.inlineData?.data)))
            if ((hasModelAudio || Boolean(outputText)) && !turnActionExecutedRef.current) {
              turnActionExecutedRef.current = true
              void setProcessingMotion(false)
              void executePetEmotion(sessionFixedEmotion).catch((caught) => {
                setActionStatus(`动作失败：${(caught as Error).message || "实体心宠动作执行失败"}`)
              })
            }
            content?.modelTurn?.parts?.forEach((part) => part.inlineData?.data && playAudio(part.inlineData.data))
            if (content?.interrupted) nextPlaybackTimeRef.current = 0
            if (content?.turnComplete) {
              inputTurnOpenRef.current = false
              finalizeCurrentTurn()
            }
          },
          onerror: (event) => {
            if (connectionErrorRef.current || sessionClosedRef.current) return
            finalizeCurrentTurn()
            setStage("连接未建立")
            setError(event.error?.message || "Gemini Live 连接失败，请检查网络、API Key 和模型权限")
            closeSession("error")
          },
          onclose: (event) => {
            if (connectionErrorRef.current || sessionClosedRef.current) return
            finalizeCurrentTurn()
            if (event.code === 1000 || event.code === 1005) {
              setStage("Gemini Live 会话已正常结束，可以重新开始")
              setError("")
              closeSession()
              return
            }
            setStage(sessionOpenedRef.current || setupReadyRef.current ? "连接已断开" : "连接未建立")
            setError(`Gemini Live 连接已关闭（${event.code}${event.reason ? `：${event.reason}` : ""}）`)
            closeSession("error")
          },
        },
      })

      const session = await sessionPromise
      if (connectionErrorRef.current || sessionClosedRef.current) {
        session.close()
        return
      }
      sessionRef.current = session
      if (handshakeTimerRef.current !== null) {
        window.clearTimeout(handshakeTimerRef.current)
        handshakeTimerRef.current = null
      }
      setupReadyRef.current = true
      setStage("可以开始说话")
      setState("active")

      {
        const captureContext = new AudioContext()
        captureContextRef.current = captureContext
        void captureContext.resume()
        const source = captureContext.createMediaStreamSource(stream)
        const processor = captureContext.createScriptProcessor(4096, 1, 1)
        const mute = captureContext.createGain()
        mute.gain.value = 0
        processor.onaudioprocess = (event) => {
          if (!sessionRef.current || !setupReadyRef.current) return
          const pcm = pcm16FromFloat(resample(event.inputBuffer.getChannelData(0), captureContext.sampleRate, 16000))
          sessionRef.current.sendRealtimeInput({ audio: { data: base64FromBytes(pcm), mimeType: "audio/pcm;rate=16000" } })
        }
        source.connect(processor)
        processor.connect(mute)
        mute.connect(captureContext.destination)
        processorRef.current = processor
      }
    } catch (caught) {
      finalizeCurrentTurn()
      const message = (caught as Error).name === "AbortError"
        ? "获取 Gemini 临时令牌超时，请检查本地服务和网络"
        : (caught as Error).message
      setStage("连接未建立")
      setError(message)
      closeSession("error")
    }
  }, [canStart, closeSession, executePetEmotion, finalizeCurrentTurn, flushPersistedMessages, personality, playAudio, reportInputRisk, setProcessingMotion, state, studentId])

  useEffect(() => () => {
    finalizeCurrentTurn()
    void flushPersistedMessages()
    closeSession()
  }, [closeSession, finalizeCurrentTurn, flushPersistedMessages])

  const statusLabel = state === "active" ? "已连接" : state === "connecting" ? "连接中" : state === "error" ? "连接失败" : "未连接"
  const statusIcon = state === "active" ? <Wifi className="size-3" /> : state === "connecting" ? <LoaderCircle className="size-3 animate-spin" /> : state === "error" ? <WifiOff className="size-3" /> : <MicOff className="size-3" />
  const liveRisk = getRiskPresentation(liveRiskLevel)

  return (
    <section className="rounded-lg bg-muted/70 p-3" aria-label="Gemini Live 实时语音对话">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("size-2.5 shrink-0 rounded-full", state === "active" ? "bg-success" : state === "connecting" ? "bg-primary animate-pulse motion-reduce:animate-none" : "bg-muted-foreground/50")} />
          <span className="truncate text-sm font-medium">实时语音对话</span>
          <Badge variant="outline" className="shrink-0 text-[10px]">Gemini Live</Badge>
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", liveRisk.badgeClassName)}>实时风险 · {liveRisk.label}</Badge>
        </div>
        <Badge variant="outline" className={cn("shrink-0 gap-1.5", state === "active" ? "border-success/40 text-success" : state === "error" ? "border-destructive/40 text-destructive" : "text-muted-foreground")}>
          {statusIcon}{statusLabel}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">当前绑定：{studentName} · {petName}</p>
      {audioRoute && <p className="mt-1 truncate text-[11px] text-muted-foreground" title={audioRoute}>音频路由：{audioRoute}</p>}
      {stage && <p className="mt-1 text-xs text-primary" aria-live="polite">{stage}</p>}
      {motionStatus && <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">启动动作：{motionStatus}</p>}
      {fixedEmotion && <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">本次会话固定动作：{petEmotionLabels.get(fixedEmotion) || fixedEmotion}（回答开始播放时执行）</p>}
      {actionStatus && <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">实体动作：{actionStatus}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {state === "active" ? <Button size="sm" variant="outline" onClick={() => { finalizeCurrentTurn(); setStage(""); closeSession() }}><Square />停止</Button> : <Button size="sm" onClick={startSession} disabled={!canStart || state === "connecting"}><Play />{state === "connecting" ? "连接中…" : "开始对话"}</Button>}
        {!canStart && <span className="text-xs text-muted-foreground">仅测试学生可启动实时语音联调</span>}
      </div>
      {error && <p className="mt-2 text-xs text-destructive" role="alert">{error}</p>}
      {persistenceError && <p className="mt-2 text-xs text-destructive" role="alert">{persistenceError}</p>}
      <div className="mt-3 space-y-2 rounded-lg border border-dashed bg-background/70 p-3" aria-live="polite">
        {messages.length === 0 && !inputDraft && !outputDraft ? <p className="text-center text-xs text-muted-foreground">点击“开始对话”后允许麦克风，和{petName}说一句话。</p> : <>
          {messages.map((message) => { const messageRisk = getRiskPresentation(message.riskLevel); return <div key={message.id} className={cn("flex", message.role === "student" ? "justify-end" : "justify-start")}><div className={cn("max-w-[88%] rounded-xl px-3 py-2 text-xs leading-5", message.role === "student" ? messageRisk.studentMessageClassName : messageRisk.petMessageClassName)}><span className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-current/70">{message.role === "student" ? studentName : petName}{message.riskLevel !== "LOW" && <Badge variant="outline" className={cn("h-4 px-1 text-[9px]", messageRisk.badgeClassName)}>{messageRisk.label}</Badge>}</span>{message.content}</div></div> })}
          {inputDraft && <div className="flex justify-end"><div className="max-w-[88%] rounded-xl rounded-br-sm bg-primary/10 px-3 py-2 text-xs leading-5"><span className="mb-1 block text-[10px] font-medium text-muted-foreground">{studentName} · 实时转写</span>{inputDraft}</div></div>}
          {outputDraft && <div className="flex justify-start"><div className="max-w-[88%] rounded-xl rounded-bl-sm bg-muted px-3 py-2 text-xs leading-5"><span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><Volume2 className="size-3" />{petName} · 语音输出</span>{outputDraft}</div></div>}
        </>}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Mic className="size-3" />输入和回答音频均使用实体心宠的麦克风、扬声器；停止后立即关闭音频流。</p>
    </section>
  )
}
