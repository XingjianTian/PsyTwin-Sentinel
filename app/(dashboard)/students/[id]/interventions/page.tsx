"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
// import { getStudentInterventions, type InterventionRecord } from "@/app/actions/students"

interface InterventionRecord {
  id: string
  date: string
  type: string
  counselor: string
  duration: string
  result: string
  status: string
}
import { interventionTypeLabels } from "@/lib/student-config"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 状态配置
const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  completed: { label: "已完成", class: "bg-success/10 text-success border-success/30", icon: CheckCircle },
  in_progress: { label: "进行中", class: "bg-primary/10 text-primary border-primary/30", icon: AlertCircle },
  cancelled: { label: "已取消", class: "bg-muted text-muted-foreground border-border", icon: XCircle },
}

export default function StudentInterventionsPage() {
  const params = useParams()
  const studentId = params.id as string
  
  const [records, setRecords] = useState<InterventionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    async function fetchInterventions() {
      try {
        const response = await fetch(`/api/students/${studentId}/interventions?page=${page}&limit=${limit}`)
        if (!response.ok) throw new Error("Failed to fetch interventions")
        const result = await response.json()
        setRecords(result.data)
        setTotal(result.total)
      } catch (error) {
        console.error("Failed to fetch interventions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInterventions()
  }, [studentId, page])

  if (loading) {
    return <InterventionsSkeleton />
  }

  // 统计信息
  const stats = {
    total,
    completed: records.filter(r => r.status === "completed").length,
    inProgress: records.filter(r => r.status === "in_progress").length,
    cancelled: records.filter(r => r.status === "cancelled").length,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总干预次数
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">累计干预记录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">干预成功</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              进行中
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">当前干预</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              干预成功率
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">完成比例</p>
          </CardContent>
        </Card>
      </div>

      {/* Interventions Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold text-foreground">
              干预与咨询记录
            </CardTitle>
          </div>
          <Badge variant="outline">
            共 {total} 条记录
          </Badge>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">暂无干预记录</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">日期</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>咨询师</TableHead>
                      <TableHead className="w-[80px]">时长</TableHead>
                      <TableHead>结果</TableHead>
                      <TableHead className="w-[100px]">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const status = statusConfig[record.status] || statusConfig.completed
                      const StatusIcon = status.icon
                      
                      return (
                        <TableRow 
                          key={record.id}
                          className="transition-colors hover:bg-secondary/30"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(record.date).toLocaleDateString('zh-CN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {interventionTypeLabels[record.type] || record.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              {record.counselor}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {record.duration}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {record.result}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={status.class}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    第 {page} / {totalPages} 页，共 {total} 条
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            <strong>干预类型说明：</strong>
            定期访谈 - 常规心理咨询；CBT疗法 - 认知行为治疗；
            团体辅导 - 小组心理辅导；危机干预 - 紧急情况处理；
            初次评估 - 首次心理评估。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function InterventionsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
