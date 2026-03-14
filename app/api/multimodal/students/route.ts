import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    // 获取正在进行 VR 会话的学生
    const activeSessions = await prisma.vRSession.findMany({
      where: {
        sessionAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 最近1小时内
        },
      },
      include: {
        student: {
          include: {
            faculty: true,
            psychProfile: true,
          },
        },
        scene: true,
      },
      orderBy: {
        sessionAt: "desc",
      },
      take: 10,
    })

    // 为每个学生获取最新的多模态数据
    const studentsWithMultimodalData = await Promise.all(
      activeSessions.map(async (session) => {
        const studentId = session.student.id

        // 获取最新的生理数据
        const vitalSign = await prisma.vitalSign.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        // 获取最新的语音分析数据
        const voiceAnalysis = await prisma.voiceAnalysis.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        // 获取最新的表情数据
        const expressionData = await prisma.expressionData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        // 获取最新的行为数据
        const behaviorData = await prisma.behaviorData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        // 获取最新的脑电数据
        const eegData = await prisma.eEGData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        // 计算会话时长（分钟）
        const duration = session.duration 
          ? parseInt(session.duration) 
          : Math.floor((Date.now() - session.sessionAt.getTime()) / 60000)

        // 确定风险等级
        const riskLevel = calculateRiskLevel(vitalSign, expressionData)

        return {
          id: studentId,
          name: session.student.name,
          studentId: session.student.studentNo,
          room: `咨询室 ${session.student.faculty?.name || "A01"}`,
          scenario: session.scene?.name || "心理评估",
          startTime: session.sessionAt.toLocaleTimeString("zh-CN", { 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          duration,
          emotion: session.emotionAfter || "平静",
          riskLevel,
          vitals: vitalSign ? {
            heartRate: vitalSign.heartRate,
            hrv: vitalSign.hrv || 45,
            gsr: vitalSign.gsr || 2.5,
            stress: vitalSign.stressIndex || 30,
          } : generateMockVitals(),
          voice: voiceAnalysis ? {
            sentiment: voiceAnalysis.sentiment.toLowerCase(),
            tremorIndex: voiceAnalysis.tremorIndex,
            情感标签: voiceAnalysis.emotionLabel,
          } : generateMockVoice(),
          expression: expressionData ? {
            primary: expressionData.primaryExpression,
            anxiety: expressionData.anxietyLevel,
            sadness: expressionData.sadnessLevel,
            anger: expressionData.angerLevel,
          } : generateMockExpression(),
          behavior: behaviorData ? {
            interactionFreq: behaviorData.interactionFreq,
            handTremor: behaviorData.handTremor,
            responseDelay: behaviorData.responseDelay,
            avoidanceCount: behaviorData.avoidanceCount,
          } : generateMockBehavior(),
          eeg: eegData ? {
            alpha: eegData.alpha,
            beta: eegData.beta,
            theta: eegData.theta,
          } : generateMockEEG(),
        }
      })
    )

    // 如果没有活跃会话，返回模拟数据
    if (studentsWithMultimodalData.length === 0) {
      return NextResponse.json({ 
        students: generateFallbackMockData(),
        isMock: true 
      })
    }

    return NextResponse.json({ 
      students: studentsWithMultimodalData,
      isMock: false 
    })
  } catch (error) {
    console.error("[API] Error fetching multimodal data:", error)
    return NextResponse.json({ 
      students: generateFallbackMockData(),
      isMock: true,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

function calculateRiskLevel(vitalSign: any, expressionData: any): string {
  let riskScore = 0
  
  if (vitalSign) {
    if (vitalSign.heartRate > 100) riskScore += 1
    if (vitalSign.hrv && vitalSign.hrv < 30) riskScore += 1
    if (vitalSign.stressIndex && vitalSign.stressIndex > 60) riskScore += 1
  }
  
  if (expressionData) {
    if (expressionData.anxietyLevel > 0.6) riskScore += 1
    if (expressionData.sadnessLevel > 0.6) riskScore += 1
  }
  
  if (riskScore >= 3) return "high"
  if (riskScore >= 1) return "medium"
  return "low"
}

function generateMockVitals() {
  return {
    heartRate: Math.floor(70 + Math.random() * 30),
    hrv: Math.floor(35 + Math.random() * 20),
    gsr: parseFloat((2 + Math.random() * 3).toFixed(1)),
    stress: Math.floor(20 + Math.random() * 50),
  }
}

function generateMockVoice() {
  const sentiments = ["positive", "neutral", "negative"]
  const labels = ["轻松", "专注", "焦虑", "平静"]
  const index = Math.floor(Math.random() * sentiments.length)
  return {
    sentiment: sentiments[index],
    tremorIndex: parseFloat((0.1 + Math.random() * 0.4).toFixed(2)),
    情感标签: labels[index],
  }
}

function generateMockExpression() {
  const expressions = ["微笑", "严肃", "皱眉", "平静"]
  return {
    primary: expressions[Math.floor(Math.random() * expressions.length)],
    anxiety: parseFloat((Math.random() * 0.5).toFixed(2)),
    sadness: parseFloat((Math.random() * 0.3).toFixed(2)),
    anger: parseFloat((Math.random() * 0.2).toFixed(2)),
  }
}

function generateMockBehavior() {
  return {
    interactionFreq: parseFloat((1 + Math.random() * 4).toFixed(1)),
    handTremor: parseFloat((Math.random() * 0.4).toFixed(2)),
    responseDelay: parseFloat((0.8 + Math.random() * 2.5).toFixed(1)),
    avoidanceCount: Math.floor(Math.random() * 10),
  }
}

function generateMockEEG() {
  return {
    alpha: parseFloat((5 + Math.random() * 10).toFixed(1)),
    beta: parseFloat((5 + Math.random() * 15).toFixed(1)),
    theta: parseFloat((4 + Math.random() * 10).toFixed(1)),
  }
}

function generateFallbackMockData() {
  return [
    {
      id: "stu-001",
      name: "张明远",
      studentId: "2024001",
      room: "心理咨询室 A02",
      scenario: "社交焦虑脱敏",
      startTime: "14:30",
      duration: 25,
      emotion: "平静",
      riskLevel: "low",
      vitals: generateMockVitals(),
      voice: generateMockVoice(),
      expression: generateMockExpression(),
      behavior: generateMockBehavior(),
      eeg: generateMockEEG(),
    },
    {
      id: "stu-002",
      name: "李思琪",
      studentId: "2024023",
      room: "减压舱 B01",
      scenario: "考试压力释放",
      startTime: "14:15",
      duration: 40,
      emotion: "紧张",
      riskLevel: "medium",
      vitals: generateMockVitals(),
      voice: generateMockVoice(),
      expression: generateMockExpression(),
      behavior: generateMockBehavior(),
      eeg: generateMockEEG(),
    },
  ]
}
