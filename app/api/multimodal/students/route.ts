import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    // 获取所有学生（排除测试学生）
    const students = await prisma.student.findMany({
      where: {
        role: "student",
      },
      include: {
        faculty: true,
        psychProfile: true,
      },
      orderBy: { name: "asc" },
    })

    const studentsWithMultimodalData = await Promise.all(
      students.map(async (student) => {
        const studentId = student.id

        const vitalSign = await prisma.vitalSign.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        const vitalSignHistory = await prisma.vitalSign.findMany({
          where: { studentId },
          orderBy: { timestamp: "desc" },
          take: 30,
          select: {
            heartRate: true,
            bloodOxygen: true,
            hrv: true,
            timestamp: true,
          },
        })

        const voiceAnalysis = await prisma.voiceAnalysis.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        const expressionData = await prisma.expressionData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        const behaviorData = await prisma.behaviorData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        const eegData = await prisma.eEGData.findFirst({
          where: { studentId },
          orderBy: { timestamp: "desc" },
        })

        const latestVital = vitalSign
        const duration = latestVital
          ? Math.floor((Date.now() - new Date(latestVital.timestamp).getTime()) / 60000)
          : 0

        const riskLevel = calculateRiskLevel(vitalSign, expressionData)

        return {
          id: studentId,
          name: student.name,
          studentId: student.studentNo,
          room: `咨询室 ${student.faculty?.name || "A01"}`,
          scenario: latestVital ? "心理评估" : "暂无数据",
          startTime: latestVital
            ? new Date(latestVital.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit"
            })
            : "--:--",
          duration,
          emotion: "平静",
          riskLevel,
          vitals: vitalSign ? {
            heartRate: vitalSign.heartRate,
            hrv: vitalSign.hrv || 45,
            bloodOxygen: vitalSign.bloodOxygen ?? 98,
            gsr: vitalSign.gsr || 2.5,
            stress: vitalSign.stressIndex || 30,
          } : {
            heartRate: 0,
            hrv: 0,
            bloodOxygen: 0,
            gsr: 0,
            stress: 0,
          },
          hrHistory: vitalSignHistory.reverse().map((v) => ({
            time: new Date(v.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }),
            心率: v.heartRate,
            血氧: v.bloodOxygen ?? 98,
            hrv: v.hrv ?? 50,
          })),
          voice: voiceAnalysis ? {
            sentiment: voiceAnalysis.sentiment.toLowerCase(),
            tremorIndex: voiceAnalysis.tremorIndex,
            情感标签: voiceAnalysis.emotionLabel,
          } : {
            sentiment: "neutral",
            tremorIndex: 0,
            情感标签: "未知",
          },
          expression: expressionData ? {
            primary: expressionData.primaryExpression,
            anxiety: expressionData.anxietyLevel,
            sadness: expressionData.sadnessLevel,
            anger: expressionData.angerLevel,
          } : {
            primary: "未知",
            anxiety: 0,
            sadness: 0,
            anger: 0,
          },
          behavior: behaviorData ? {
            interactionFreq: behaviorData.interactionFreq,
            handTremor: behaviorData.handTremor,
            responseDelay: behaviorData.responseDelay,
            avoidanceCount: behaviorData.avoidanceCount,
          } : {
            interactionFreq: 0,
            handTremor: 0,
            responseDelay: 0,
            avoidanceCount: 0,
          },
          eeg: eegData ? {
            alpha: eegData.alpha,
            beta: eegData.beta,
            theta: eegData.theta,
          } : {
            alpha: 0,
            beta: 0,
            theta: 0,
          },
        }
      })
    )

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
    bloodOxygen: 96 + Math.floor(Math.random() * 4),
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

function generateMockHrHistory() {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${String(14 + Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
    心率: Math.floor(70 + Math.sin(i * 0.3) * 15 + Math.random() * 10),
    血氧: Math.floor(96 + Math.random() * 3),
    hrv: Math.floor(40 + Math.random() * 20),
  }))
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
      hrHistory: generateMockHrHistory(),
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
      hrHistory: generateMockHrHistory(),
      voice: generateMockVoice(),
      expression: generateMockExpression(),
      behavior: generateMockBehavior(),
      eeg: generateMockEEG(),
    },
  ]
}
