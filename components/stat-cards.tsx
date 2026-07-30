"use client"

import { Users, AlertTriangle, ShieldCheck, BrainCircuit } from "lucide-react"

const stats = [
  {
    label: "在校学生总数",
    value: "11,009",
    change: "+128",
    changeLabel: "较上周",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    cardTone: "border-violet-200/80 bg-violet-50/55 hover:border-violet-300",
    labelTone: "text-violet-700/75",
  },
  {
    label: "活跃预警数",
    value: "156",
    change: "+12",
    changeLabel: "今日新增",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    cardTone: "border-rose-200/80 bg-rose-50/55 hover:border-rose-300",
    labelTone: "text-rose-700/75",
  },
  {
    label: "干预进行中",
    value: "89",
    change: "-5",
    changeLabel: "较昨日",
    icon: ShieldCheck,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    cardTone: "border-amber-200/80 bg-amber-50/60 hover:border-amber-300",
    labelTone: "text-amber-800/75",
  },
  {
    label: "AI模型准确率",
    value: "94.7%",
    change: "+0.3%",
    changeLabel: "较上月",
    icon: BrainCircuit,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    cardTone: "border-emerald-200/80 bg-emerald-50/60 hover:border-emerald-300",
    labelTone: "text-emerald-800/75",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 ${stat.cardTone}`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.iconColor} transition-transform duration-200 group-hover:scale-110`} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-medium ${stat.labelTone}`}>{stat.label}</p>
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
