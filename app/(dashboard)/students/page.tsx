"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
// import { getStudents } from "@/app/actions/students"
// import type { GetStudentsResult } from "@/app/actions/students"

// 学生类型定义
interface Student {
  id: string
  name: string
  studentNo: string
  className: string
  faculty: { name: string } | null
  riskLevel: string
  mbti: string | null
  gender: string | null
  psychProfile: { overallScore: number } | null
}

interface GetStudentsResult {
  students: Student[]
  total: number
  page: number
  totalPages: number
}

// 风险等级配置
const riskLevelConfig: Record<string, { color: string; bg: string; text: string; label: string }> = {
  HIGH: {
    color: "border-destructive",
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "高危",
  },
  MEDIUM: {
    color: "border-warning",
    bg: "bg-warning/10",
    text: "text-warning",
    label: "中危",
  },
  LOW: {
    color: "border-success",
    bg: "bg-success/10",
    text: "text-success",
    label: "低危",
  },
}
const classOptions = ["全部班级", "网络2401", "虚拟2503", "软件2402", "数媒2401", "信安2401", "大数据2502"]
const riskOptions = [
  { value: "", label: "全部风险" },
  { value: "HIGH", label: "高危" },
  { value: "MEDIUM", label: "中危" },
  { value: "LOW", label: "低危" },
]

export default function StudentsPage() {
  const [students, setStudents] = useState<GetStudentsResult["students"]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedClass, setSelectedClass] = useState("全部班级")
  const [selectedRisk, setSelectedRisk] = useState("")
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [showRiskDropdown, setShowRiskDropdown] = useState(false)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", "12")
      if (searchText) params.append("search", searchText)
      if (selectedClass !== "全部班级") params.append("className", selectedClass)
      if (selectedRisk) params.append("riskLevel", selectedRisk)
      
      const response = await fetch(`/api/students?${params}`)
      if (!response.ok) throw new Error("Failed to fetch students")
      const result: GetStudentsResult = await response.json()
      setStudents(result.students)
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
      })
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, searchText, selectedClass, selectedRisk])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const getRiskConfig = (riskLevel: string) => {
    return riskLevelConfig[riskLevel] || riskLevelConfig.LOW
  }

  return (
    <div className="flex flex-col gap-4">


      {/* Filter Bar */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索姓名或学号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowClassDropdown(!showClassDropdown)
                setShowRiskDropdown(false)
              }}
              className="w-[140px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {selectedClass}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showClassDropdown && (
              <div className="absolute top-full z-10 mt-1 w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {classOptions.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls)
                      setShowClassDropdown(false)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedClass === cls
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Risk Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowRiskDropdown(!showRiskDropdown)
                setShowClassDropdown(false)
              }}
              className="w-[120px] justify-between"
            >
              <span>{riskOptions.find((r) => r.value === selectedRisk)?.label || "全部风险"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showRiskDropdown && (
              <div className="absolute top-full z-10 mt-1 w-[120px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {riskOptions.map((risk) => (
                  <button
                    key={risk.value}
                    onClick={() => {
                      setSelectedRisk(risk.value)
                      setShowRiskDropdown(false)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedRisk === risk.value
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {risk.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button onClick={fetchStudents} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "搜索"}
          </Button>
        </CardContent>
      </Card>

      {/* Student Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex h-64 flex-col items-center justify-center gap-2">
            <p className="text-muted-foreground">暂无符合条件的学生</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {students.map((student) => {
            const riskConfig = getRiskConfig(student.riskLevel)
            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card className="group cursor-pointer border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">{student.studentNo}</p>
                        <p className="text-xs text-muted-foreground">{student.className}</p>
                        {student.faculty && (
                          <p className="text-xs text-muted-foreground truncate">{student.faculty.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge className={`${riskConfig.bg} ${riskConfig.text} ${riskConfig.color} text-xs`}>
                        {riskConfig.label}
                      </Badge>
                      {student.mbti && (
                        <Badge variant="outline" className="text-xs">
                          {student.mbti}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">心理综合评分</span>
                      <span className="text-sm font-bold text-primary">
                        {student.psychProfile?.overallScore || "--"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
