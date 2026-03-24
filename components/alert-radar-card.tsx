"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Radio, Wifi } from "lucide-react"

const CLASSES = ["网络2401", "虚拟2503", "软件2402", "数媒2401", "信安2401", "大数据2502"]
function randomClass() {
  return CLASSES[Math.floor(Math.random() * CLASSES.length)]
}

interface AlertItem {
  id: number
  name: string
  className: string
  type: string
  level: "critical" | "warning"
  time: string
}

const initialAlerts: AlertItem[] = [
  { id: 1, name: "张明远", className: "网络2401", type: "心率激增", level: "critical", time: "14:32:08" },
  { id: 2, name: "李思琪", className: "虚拟2503", type: "语音颤抖", level: "warning", time: "14:31:45" },
  { id: 3, name: "王博文", className: "大数据2502", type: "睡眠异常", level: "warning", time: "14:30:22" },
  { id: 4, name: "陈雨晴", className: "软件2402", type: "情绪波动", level: "critical", time: "14:29:10" },
  { id: 5, name: "赵天宇", className: "信安2401", type: "社交退缩", level: "warning", time: "14:28:03" },
  { id: 6, name: "刘思远", className: "数媒2401", type: "心率激增", level: "critical", time: "14:27:50" },
  { id: 7, name: "孙雅琪", className: "网络2401", type: "步态异常", level: "warning", time: "14:26:15" },
  { id: 8, name: "周航宇", className: "虚拟2503", type: "语音颤抖", level: "critical", time: "14:25:33" },
  { id: 9, name: "黄思萌", className: "软件2402", type: "进食异常", level: "warning", time: "14:24:48" },
  { id: 10, name: "吴志远", className: "大数据2502", type: "社交退缩", level: "critical", time: "14:23:12" },
]

const newAlertPool: Omit<AlertItem, "id" | "time" | "className">[] = [
  { name: "林志豪", type: "心率激增", level: "critical" },
  { name: "郑雨萱", type: "情绪波动", level: "warning" },
  { name: "韩明辉", type: "语音颤抖", level: "critical" },
  { name: "马天翔", type: "睡眠异常", level: "warning" },
  { name: "杨梦琪", type: "步态异常", level: "critical" },
  { name: "徐国栋", type: "社交退缩", level: "warning" },
  { name: "罗诗涵", type: "进食异常", level: "critical" },
  { name: "谢子轩", type: "心率激增", level: "warning" },
]

function getTimeStr() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
}

export function AlertRadarCard() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts)
  const [connected, setConnected] = useState(true)
  const nextId = useRef(11)

  useEffect(() => {
    const interval = setInterval(() => {
      const pool = newAlertPool[Math.floor(Math.random() * newAlertPool.length)]
      setAlerts((prev) => {
        const existingNames = new Set(prev.map(a => a.name))
        if (existingNames.has(pool.name)) return prev
        const newAlert: AlertItem = {
          id: nextId.current++,
          name: pool.name,
          className: randomClass(),
          type: pool.type,
          level: pool.level,
          time: getTimeStr(),
        }
        return [newAlert, ...prev.slice(0, 19)]
      })
    }, 3000)

    const wsInterval = setInterval(() => {
      setConnected(false)
      setTimeout(() => setConnected(true), 200)
    }, 8000)

    return () => {
      clearInterval(interval)
      clearInterval(wsInterval)
    }
  }, [])

  return (
    <Card className="border-border bg-card shadow-sm h-[550px] flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 shrink-0">
        <Radio className="h-5 w-5 text-destructive" />
        <CardTitle className="text-base font-semibold text-foreground">
          实时预警雷达
        </CardTitle>
        <span className="text-xs text-muted-foreground">(WebSocket)</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Wifi
            className={`h-3.5 w-3.5 transition-colors ${connected ? "text-success" : "text-muted-foreground"}`}
          />
          <span
            className={`text-xs ${connected ? "text-success" : "text-muted-foreground"}`}
          >
            {connected ? "已连接" : "重连中"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4 min-h-0 overflow-hidden">
        <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-3 px-2 text-xs font-medium text-muted-foreground">
          <span>学生信息</span>
          <span>预警类型</span>
          <span className="text-right">时间</span>
        </div>

        <ScrollArea className="flex-1 pr-2 min-h-0">
          <ul className="flex flex-col gap-2">
            {alerts.slice(0, 6).map((alert, i) => (
              <li
                key={alert.id}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md px-3 py-3 transition-all ${
                  i === 0
                    ? "bg-destructive/10 ring-1 ring-destructive/20"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-base font-semibold text-foreground">
                    {alert.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{alert.className}</span>
                </div>
                <Badge
                  variant={alert.level === "critical" ? "destructive" : "secondary"}
                  className={
                    alert.level === "critical"
                      ? "border-destructive/30 bg-destructive/20 text-destructive text-sm"
                      : "border-warning/30 bg-warning/20 text-warning text-sm"
                  }
                >
                  {alert.type}
                </Badge>
                <span className="font-mono text-sm text-muted-foreground">
                  {alert.time}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground shrink-0">
          <span>
            今日预警：
            <span className="font-mono font-semibold text-destructive">
              {alerts.length + 47}
            </span>{" "}
            条
          </span>
          <span>
            紧急：
            <span className="font-mono font-semibold text-destructive">
              {alerts.filter((a) => a.level === "critical").length + 21}
            </span>
          </span>
          <span>
            一般：
            <span className="font-mono font-semibold text-warning">
              {alerts.filter((a) => a.level === "warning").length + 26}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
