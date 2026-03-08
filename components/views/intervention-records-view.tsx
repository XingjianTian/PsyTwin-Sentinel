"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { InterventionDetailDialog } from "@/components/intervention-detail-dialog"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ChevronDown,
  Calendar,
  Filter,
  Check,
  Clock,
  User,
} from "lucide-react"

import { getInterventionRecords, setInterventionStatus, type InterventionRecordItem } from "@/app/actions/intervention-records"

/* ── Filter options ── */
const interventionTypes = ["全部", "定期面谈", "CBT治疗", "团体辅导", "危机干预", "初次评估"]

const statusColor: Record<string, string> = {
  "已完成": "border-green-500/30 bg-green-500/10 text-green-600",
  "进展中": "border-purple-500/30 bg-purple-500/10 text-purple-600",
}

const typeColor: Record<string, string> = {
  "定期面谈": "border-blue-300/30 bg-blue-500/10 text-blue-600",
  "CBT治疗": "border-purple-300/30 bg-purple-500/10 text-purple-600",
  "团体辅导": "border-green-300/30 bg-green-500/10 text-green-600",
  "危机干预": "border-red-300/30 bg-red-500/10 text-red-600",
  "初次评估": "border-orange-300/30 bg-orange-500/10 text-orange-600",
}

const ITEMS_PER_PAGE = 10

export function InterventionRecordsView() {
  const [records, setRecords] = useState<InterventionRecordItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedType, setSelectedType] = useState("全部")
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [dateRange, setDateRange] = useState("2026-01-01 至 2026-02-26")
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  async function loadRecords() {
    try {
      const data = await getInterventionRecords()
      setRecords(data)
      setError(null)
    } catch {
      setError("记录加载失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRecords()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedType, searchText])

  const filtered = records.filter((r) => {
    if (selectedType !== "全部" && r.type !== selectedType) return false
    if (searchText && !r.name.includes(searchText) && !r.id.includes(searchText) && !r.cls.includes(searchText)) return false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedRecords = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  async function updateStatus(recordId: string) {
    setActingId(recordId)
    setActionMessage(null)
    try {
      // 传英文状态值给后端
      await setInterventionStatus(recordId, "completed")
      setActionMessage(`记录 ${recordId.slice(-6)} 已标记为完成`)
      await loadRecords()
    } catch {
      setError("状态更新失败，请稍后重试")
    } finally {
      setActingId(null)
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ── */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索记录编号、姓名、班级..."
              className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{dateRange}</span>
          </div>

          {/* Type dropdown */}
          <div className="relative">
            <button
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>干预类型：{selectedType}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {typeDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {interventionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setTypeDropdownOpen(false) }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedType === type
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {type}
                    {selectedType === type && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result count */}
          <span className="ml-auto text-xs text-muted-foreground">
            共 <span className="font-semibold text-foreground">{filtered.length}</span> 条记录
            {filtered.length > 0 && (
              <span className="ml-1">(第 {currentPage}/{totalPages} 页)</span>
            )}
          </span>
        </CardContent>
      </Card>

      {actionMessage ? (
        <p className="text-right text-xs text-success">{actionMessage}</p>
      ) : null}
      {error ? (
        <p className="text-right text-xs text-destructive">{error}</p>
      ) : null}

      {/* ── Main table ── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            干预记录列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">记录编号</th>
                    <th className="px-3 py-3 text-left font-medium">学生姓名</th>
                    <th className="px-3 py-3 text-left font-medium">班级</th>
                    <th className="px-3 py-3 text-left font-medium">干预类型</th>
                    <th className="px-3 py-3 text-left font-medium">咨询师</th>
                    <th className="px-3 py-3 text-left font-medium">时长</th>
                    <th className="px-3 py-3 text-left font-medium">干预结果</th>
                    <th className="px-3 py-3 text-left font-medium">日期</th>
                    <th className="px-3 py-3 text-left font-medium">状态</th>
                    <th className="px-3 py-3 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        正在加载干预记录...
                      </td>
                    </tr>
                  ) : null}
                  {paginatedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="group border-b border-border/30 transition-colors hover:bg-secondary/20"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-primary/80">{record.id.slice(-8)}</td>
                      <td className="px-3 py-3 font-medium text-foreground">{record.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{record.cls}</td>
                      <td className="px-3 py-3">
                        <Badge className={`text-xs ${typeColor[record.type] || "border-gray-300/30 bg-gray-500/10 text-gray-600"}`}>
                          {record.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {record.counselor}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.duration}
                        </div>
                      </td>
                      <td className="max-w-[150px] truncate px-3 py-3 text-foreground" title={record.result}>
                        {record.result}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{record.date}</td>
                      <td className="px-3 py-3">
                        <Badge className={`text-xs ${statusColor[record.status] || "border-gray-300/30 bg-gray-500/10 text-gray-600"}`}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecordId(record.id)
                              setDetailDialogOpen(true)
                            }}
                            disabled={actingId === record.id}
                            className="rounded border border-border bg-secondary/30 px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            详情
                          </button>
                          {/* 只有进展中的记录才显示"标记完成"按钮 */}
                          {record.status === "进展中" && (
                            <button
                              onClick={() => updateStatus(record.id)}
                              disabled={actingId === record.id}
                              className="rounded border border-success/30 bg-success/10 px-2 py-1 text-xs text-success transition-colors hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              标记完成
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        暂无符合筛选条件的干预记录
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <InterventionDetailDialog
        recordId={selectedRecordId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  )
}
