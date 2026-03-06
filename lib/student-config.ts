/**
 * 学生档案相关常量配置
 * 
 * 这些常量可以在客户端和服务器端共享使用
 */

// 风险等级配置
export const riskLevelConfig = {
  HIGH: { 
    color: "border-destructive", 
    bg: "bg-destructive/10", 
    text: "text-destructive", 
    label: "高危" 
  },
  MEDIUM: { 
    color: "border-warning", 
    bg: "bg-warning/10", 
    text: "text-warning", 
    label: "中危" 
  },
  LOW: { 
    color: "border-success", 
    bg: "bg-success/10", 
    text: "text-success", 
    label: "低危" 
  },
}

// 干预类型标签映射
export const interventionTypeLabels: Record<string, string> = {
  REGULAR_INTERVIEW: "定期访谈",
  CBT_THERAPY: "CBT疗法",
  GROUP_COUNSELING: "团体辅导",
  CRISIS_INTERVENTION: "危机干预",
  INITIAL_ASSESSMENT: "初次评估",
}
