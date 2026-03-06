"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Radar, Clock, FileText, ArrowLeft, User } from "lucide-react"
import { useEffect, useState } from "react"
// import { getStudentDetail, type StudentDetail } from "@/app/actions/students"

interface StudentDetail {
  id: string
  name: string
  studentNo: string
  className: string
  gender: string | null
  birthDate: string | null
  mbti: string | null
  riskLevel: string
  faculty: { id: string; name: string } | null
  psychProfile: {
    adversityQuotient: number
    emotionalStability: number
    socialTendency: number
    stressResistance: number
    selfAwareness: number
    empathy: number
    willpower: number
    adaptability: number
    overallScore: number
  } | null
  stats: {
    totalAlerts: number
    totalInterventions: number
    totalVRSessions: number
  }
}
import { riskLevelConfig } from "@/lib/student-config"

const tabs = [
  { id: "profile", label: "心理画像", icon: Radar, href: "/profile" },
  { id: "timeline", label: "生命周期", icon: Clock, href: "/timeline" },
  { id: "interventions", label: "干预记录", icon: FileText, href: "/interventions" },
]

export default function StudentDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch(`/api/students/${studentId}`)
        if (!response.ok) throw new Error("Failed to fetch student")
        const data = await response.json()
        setStudent(data)
      } catch (error) {
        console.error("Failed to fetch student:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [studentId])

  const activeTab = tabs.find(tab => pathname.includes(tab.href))?.id || "profile"

  if (loading) {
    return <StudentDetailSkeleton />
  }

  if (!student) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">未找到该学生信息</p>
      </div>
    )
  }

  const riskConfig = riskLevelConfig[student.riskLevel as keyof typeof riskLevelConfig] || riskLevelConfig.LOW

  return (
    <div className="flex flex-col gap-4">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>

      {/* Student Info Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          <Avatar className={`h-16 w-16 border-2 ${riskConfig.color}`}>
            <AvatarFallback className={`${riskConfig.bg} text-lg font-bold ${riskConfig.text}`}>
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {student.className} | 学号 {student.studentNo}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {student.faculty?.name || "未知学院"} 
              {student.gender ? ` | ${student.gender === "MALE" ? "男" : "女"}` : ""}
              {student.birthDate ? ` | ${new Date(student.birthDate).getFullYear()}年${new Date(student.birthDate).getMonth() + 1}月` : ""}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge className={`${riskConfig.bg} ${riskConfig.text} ${riskConfig.color}`}>
              {riskConfig.label}
            </Badge>
            {student.mbti && (
              <Badge variant="outline">{student.mbti}</Badge>
            )}
            <Badge variant="secondary">
              综合评分: {student.psychProfile?.overallScore || "--"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={`/students/${studentId}${tab.href}`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Page Content */}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardContent className="flex items-center gap-6 p-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
