"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Scan,
  Shield,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PortStatus = "safe" | "warning" | "danger"

type PortInfo = {
  port: number
  service: string
  address: string
  status: PortStatus
}

const mockPorts: PortInfo[] = [
  { port: 22, service: "SSH", address: "*:22", status: "safe" },
  { port: 80, service: "HTTP", address: "*:80", status: "safe" },
  { port: 443, service: "HTTPS", address: "*:443", status: "safe" },
  { port: 3000, service: "Node", address: "*:3000", status: "safe" },
  { port: 3306, service: "MySQL", address: "*:3306", status: "warning" },
  { port: 5432, service: "PostgreSQL", address: "*:5432", status: "safe" },
  { port: 6379, service: "Redis", address: "*:6379", status: "safe" },
  { port: 8080, service: "Alt HTTP", address: "*:8080", status: "safe" },
  { port: 27017, service: "MongoDB", address: "*:27017", status: "danger" },
]

function getHealthColor(score: number) {
  if (score >= 80) return "text-emerald-700"
  if (score >= 60) return "text-amber-700"
  if (score >= 40) return "text-orange-700"
  return "text-red-700"
}

function getHealthStroke(score: number) {
  if (score >= 80) return "#15803d"
  if (score >= 60) return "#b45309"
  if (score >= 40) return "#c2410c"
  return "#b91c1c"
}

function getStatusBadge(status: PortStatus) {
  if (status === "safe") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle className="h-3.5 w-3.5" /> safe
      </span>
    )
  }

  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> warning
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-600/40 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700">
      <XCircle className="h-3.5 w-3.5" /> danger
    </span>
  )
}

export default function SecurityDashboard() {
  const [healthScore, setHealthScore] = useState(0)
  const [scanCount, setScanCount] = useState(0)
  const [threatsDetected, setThreatsDetected] = useState(0)
  const [blockedCount, setBlockedCount] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [ports, setPorts] = useState<PortInfo[]>(mockPorts)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHealthScore(87)
      setScanCount(24)
      setThreatsDetected(1)
      setBlockedCount(3)
    }, 350)

    return () => clearTimeout(timer)
  }, [])

  const ring = useMemo(() => {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (healthScore / 100) * circumference

    return { radius, circumference, offset }
  }, [healthScore])

  const runScan = () => {
    if (isScanning) return

    setIsScanning(true)
    const timer = setTimeout(() => {
      setScanCount((prev) => prev + 1)
      setPorts((prev) => prev.map((item) => ({ ...item })))

      setThreatsDetected((prev) => (Math.random() > 0.75 ? prev + 1 : prev))
      setBlockedCount((prev) => (Math.random() > 0.7 ? prev + 1 : prev))
      setIsScanning(false)
    }, 2200)

    return () => clearTimeout(timer)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-slate-600/30 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Activity className="h-4 w-4 text-sky-600" />
                端口扫描
              </CardTitle>
              <button
                type="button"
                onClick={runScan}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Scan className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "扫描中..." : "运行扫描"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-3 py-2">端口</th>
                  <th className="px-3 py-2">服务</th>
                  <th className="px-3 py-2">地址</th>
                  <th className="px-3 py-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((port) => (
                  <tr key={port.port} className="border-b border-border/30 text-foreground/90 transition hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono font-semibold text-sky-700">{port.port}</td>
                    <td className="px-3 py-2">{port.service}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground text-xs">{port.address}</td>
                    <td className="px-3 py-2">{getStatusBadge(port.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="border-slate-600/30 bg-card/80">
            <CardContent className="flex items-center gap-4 pt-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
                  <circle cx="50" cy="50" r={ring.radius} fill="none" stroke="rgba(148,163,184,.2)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r={ring.radius}
                    fill="none"
                    stroke={getHealthStroke(healthScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={ring.offset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">系统健康度</p>
                <p className="font-semibold text-foreground">System Health</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Card className="border-sky-600/30 bg-card/80">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-sky-700">{scanCount}</p>
                <p className="text-[10px] text-muted-foreground">今日扫描</p>
              </CardContent>
            </Card>
            <Card className="border-amber-600/30 bg-card/80">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{threatsDetected}</p>
                <p className="text-[10px] text-muted-foreground">威胁检测</p>
              </CardContent>
            </Card>
            <Card className="border-red-600/30 bg-card/80">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-red-700">{blockedCount}</p>
                <p className="text-[10px] text-muted-foreground">已阻止</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
