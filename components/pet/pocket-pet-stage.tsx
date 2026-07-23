"use client"

import Image from "next/image"
import { useEffect, useState, useSyncExternalStore } from "react"
import { MapPin } from "lucide-react"
import { POCKET_PET_ANIMATION_FRAMES } from "@/lib/pet-live-sync"

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
}: {
  sceneName: string
  sceneBackgroundSrc: string
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
        unoptimized
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
      <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        {sceneName}
      </div>
      <div className="absolute bottom-7 z-10 h-8 w-40 rounded-[50%] bg-slate-950/20 blur-sm" />
      <Image
        src={frameSrc}
        alt="小程序心宠"
        width={192}
        height={192}
        priority
        unoptimized
        className="pet-float relative z-10 h-48 w-48 object-contain drop-shadow-xl"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  )
}
