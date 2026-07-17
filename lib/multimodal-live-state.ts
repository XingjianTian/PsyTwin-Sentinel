export interface RealtimeStudentState {
  id: string
  name: string
  studentId: string
  room: string
  scenario: string
  startTime: string
  duration: number
  emotion: string
  riskLevel: string
  vitals: {
    heartRate: number
    hrv: number
    bloodOxygen: number
    gsr: number
    stress: number
  }
  voice: {
    sentiment: string
    tremorIndex: number
    emotionLabel: string
  }
  expression: {
    primary: string
    anxiety: number
    sadness: number
    anger: number
  }
  behavior: {
    interactionFreq: number
    handTremor: number
    responseDelay: number
    avoidanceCount: number
  }
}

export function createIdleRealtimeStudent(): RealtimeStudentState {
  return {
    id: "stu-test",
    name: "测试学生",
    studentId: "test-001",
    room: "测试咨询室 A01",
    scenario: "等待网关实时数据",
    startTime: "--:--",
    duration: 0,
    emotion: "待机",
    riskLevel: "low",
    vitals: {
      heartRate: 0,
      hrv: 0,
      bloodOxygen: 0,
      gsr: 0,
      stress: 0,
    },
    voice: {
      sentiment: "neutral",
      tremorIndex: 0,
      emotionLabel: "未知",
    },
    expression: {
      primary: "unknown",
      anxiety: 0,
      sadness: 0,
      anger: 0,
    },
    behavior: {
      interactionFreq: 0,
      handTremor: 0,
      responseDelay: 0,
      avoidanceCount: 0,
    },
  }
}
