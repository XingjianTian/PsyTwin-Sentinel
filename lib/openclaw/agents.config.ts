export const AGENTS = {
  main: {
    name: "首席数据官",
    emoji: "🎯",
    color: "#ff006e",
    role: "总览全局",
  },
  Collector: {
    name: "采集员",
    emoji: "📡",
    color: "#374151",
    role: "数据采集",
  },
  Therapist: {
    name: "咨询师",
    emoji: "🧠",
    color: "#9d4edd",
    role: "干预策略",
  },
  Relayer: {
    name: "中继工程师",
    emoji: "🔌",
    color: "#ffbe0b",
    role: "边缘处理",
  },
  DBA: {
    name: "数据哨兵",
    emoji: "🛡️",
    color: "#1e40af",
    role: "数据管理",
  },
  Analyst: {
    name: "分析师",
    emoji: "📊",
    color: "#15803d",
    role: "特征提取",
  },
} as const

export type AgentId = keyof typeof AGENTS

export const AGENT_DESCRIPTIONS: Record<string, string> = {
  main: "首席数据官 - 协调全局，统筹所有子系统",
  Collector: "采集员 - 负责监控 VR 与手环的多模态原始流",
  Therapist: "咨询师 - 生成 VR 干预策略与孪生体交互",
  Relayer: "中继工程师 - 执行边缘降噪与协议转换",
  DBA: "数据哨兵 - 负责数据对齐与入库",
  Analyst: "分析师 - 调用模型提取焦虑与压力特征",
}
