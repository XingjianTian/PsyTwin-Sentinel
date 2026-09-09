"use client"

import Image from "next/image"
import { useEffect, useState, useSyncExternalStore } from "react"
import { MapPin } from "lucide-react"
import { POCKET_PET_ANIMATION_FRAMES } from "@/lib/pet-live-sync"
import type { PocketPetDemoConversation } from "@/lib/pet-live-sync"

const FRAME_INTERVAL_MS = 1_000
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getServerReducedMotionSnapshot() {
  return false
}

export function PocketPetStage({
  sceneName,
  sceneBackgroundSrc,
  demoConversation,
}: {
  sceneName: string
  sceneBackgroundSrc: string
  demoConversation?: PocketPetDemoConversation | null
}) {
  const [frameIndex, setFrameIndex] = useState(0)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  )

  useEffect(() => {
    if (prefersReducedMotion) return

    const timer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % POCKET_PET_ANIMATION_FRAMES.length)
    }, FRAME_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [prefersReducedMotion])

  const frameSrc = prefersReducedMotion
    ? POCKET_PET_ANIMATION_FRAMES[0]
    : POCKET_PET_ANIMATION_FRAMES[frameIndex]

  return (
    <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden rounded-lg border border-border bg-sky-100 p-6">
      <Image
        src={sceneBackgroundSrc}
        alt={`${sceneName}场景`}
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
      <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        {sceneName}
      </div>
      {demoConversation ? (
        <div className="absolute bottom-8 left-[12%] z-10 flex w-36 flex-col items-center">
          {demoConversation.speaker === "companion" && demoConversation.text ? (
            <div className="mb-2 max-w-56 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-md">
              {demoConversation.text}
            </div>
          ) : null}
          <Image
            src="/pet/variants/pet-06.png"
            alt={`${demoConversation.companion.name}心宠`}
            width={144}
            height={144}
            unoptimized
            className="h-36 w-36 object-contain drop-shadow-lg"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="rounded-full bg-slate-900/75 px-3 py-1 text-xs font-medium text-white">
            {demoConversation.companion.name}
          </span>
        </div>
      ) : null}
      <div className={`absolute bottom-7 z-10 h-7 w-32 rounded-[50%] bg-slate-950/20 blur-sm ${demoConversation ? "right-[18%]" : ""}`} />
      {demoConversation?.speaker === "main" && demoConversation.text ? (
        <div className="absolute bottom-52 right-[12%] z-20 max-w-64 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-md">
          {demoConversation.text}
        </div>
      ) : null}
      <Image
        src={frameSrc}
        alt="小程序心宠"
        width={144}
        height={144}
        priority
        unoptimized
        className={`pet-float relative z-10 h-36 w-36 object-contain drop-shadow-xl ${demoConversation ? "ml-auto mr-[12%]" : ""}`}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  )
}
