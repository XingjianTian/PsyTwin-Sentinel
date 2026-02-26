"use client"

import { Users, AlertTriangle, ShieldCheck, BrainCircuit } from "lucide-react"

const stats = [
  {
    label: "在校学生总数",
    value: "32,846",
    change: "+128",
    changeLabel: "较上周",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    label: "活跃预警数",
    value: "156",
    change: "+12",
    changeLabel: "今日新增",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  {
    label: "干预进行中",
    value: "89",
    change: "-5",
    changeLabel: "较昨日",
    icon: ShieldCheck,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  {
    label: "AI模型准确率",
    value: "94.7%",
    change: "+0.3%",
    changeLabel: "较上月",
    icon: BrainCircuit,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-mono text-xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  stat.change.startsWith("+")
                    ? "text-success"
                    : stat.change.startsWith("-")
                      ? "text-primary"
                      : "text-muted-foreground"
                }
              >
                {stat.change}
              </span>{" "}
              {stat.changeLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
