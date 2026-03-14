"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Database, Table2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DbColumn = {
  name: string
  pk?: boolean
}

type DbTable = {
  name: string
  rowCount: number
  columns: DbColumn[]
}

type DbStats = {
  sizeFormatted?: string
  walMode?: boolean
}

type DataPayload = {
  columns: string[]
  columnTypes?: string[]
  rows: Array<Record<string, unknown>>
  total: number
  hasMore?: boolean
  truncated?: boolean
}

const PAGE_SIZE = 50

function formatTimestamp(val: unknown) {
  if (typeof val !== "number") return String(val)
  if (val <= 1_000_000_000_000) return String(val)

  return new Date(val).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function renderCellValue(val: unknown, colName: string) {
  if (val === null || val === undefined) {
    return <span className="italic text-muted-foreground/70">NULL</span>
  }

  if (typeof val === "number") {
    const maybeTs =
      colName.includes("_at") ||
      colName.includes("timestamp") ||
      colName.includes("created") ||
      colName.includes("updated") ||
      colName.includes("completed")

    if (maybeTs) return formatTimestamp(val)
  }

  const content = typeof val === "string" ? val : JSON.stringify(val)
  if (!content) return ""
  if (content.length > 120) return `${content.slice(0, 120)}…`
  return content
}

function DataTable({ data, loading }: { data: DataPayload | null; loading: boolean }) {
  if (loading) {
    return <div className="py-12 text-center text-sm text-cyan-400">加载中...</div>
  }

  if (!data || data.rows.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">暂无数据</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50">
            {data.columns.map((col, idx) => (
              <th key={`col-${idx}`} className="whitespace-nowrap px-3 py-2 text-left font-mono text-muted-foreground">
                {col}
                {data.columnTypes && <span className="ml-1 text-[10px] text-muted-foreground/70">{data.columnTypes[idx]}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/30 transition hover:bg-muted/20">
              {data.columns.map((col) => (
                <td key={`${rowIndex}-${col}`} className="max-w-[320px] truncate whitespace-nowrap px-3 py-2 font-mono text-foreground/90">
                  {renderCellValue(row[col], col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DatabaseDashboard() {
  const [tables, setTables] = useState<DbTable[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<DataPayload | null>(null)
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  const openclawTables = useMemo(() => tables.filter((t) => t.name.startsWith("openclaw_")), [tables])

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [tablesRes, statsRes] = await Promise.all([
          fetch("/api/openclaw/database?action=tables"),
          fetch("/api/openclaw/database?action=stats"),
        ])
        const tableJson = await tablesRes.json()
        const statsJson = await statsRes.json()
        setTables(tableJson.tables || [])
        setDbStats(statsJson || null)
      } catch {
        setTables([])
      }
    }
    void fetchInit()
  }, [])

  const browseTable = useCallback(async (name: string, pageNum = 0) => {
    setSelectedTable(name)
    setPage(pageNum)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/openclaw/database?action=browse&table=${encodeURIComponent(name)}&limit=${PAGE_SIZE}&offset=${pageNum * PAGE_SIZE}`,
      )
      const data = await res.json()
      const normalizedData = {
        ...data,
        columns: Array.isArray(data.columns)
          ? data.columns.map((c: unknown) => typeof c === 'object' && c !== null ? (c as { name: string }).name : String(c))
          : [],
      }
      setTableData(normalizedData)
    } catch {
      setTableData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* 数据库看板 - 表列表 */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-cyan-400" />
              数据库看板
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {dbStats?.sizeFormatted ?? "..."} &bull; {openclawTables.length} 张 openclaw_* 表
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {openclawTables.map((table) => (
              <button
                key={table.name}
                type="button"
                onClick={() => void browseTable(table.name, 0)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedTable === table.name
                    ? "border-cyan-500/60 bg-cyan-500/10"
                    : "border-border/60 bg-muted/15 hover:border-border"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">{table.name}</span>
                  <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400">
                    {table.rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {table.columns.slice(0, 5).map((col) => (
                    <span
                      key={`${table.name}-${col.name}`}
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        col.pk
                          ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {col.name}
                    </span>
                  ))}
                  {table.columns.length > 5 ? (
                    <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{table.columns.length - 5}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 表数据预览 */}
      {(selectedTable || loading) && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Table2 className="h-4 w-4 text-cyan-400" />
                {selectedTable}
                {tableData ? <span className="ml-2 text-xs text-muted-foreground">{tableData.total} 行</span> : null}
              </CardTitle>
              {tableData && tableData.total > PAGE_SIZE ? (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => void browseTable(selectedTable as string, Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="rounded border border-border/60 bg-muted/20 px-2 py-1 disabled:opacity-40"
                  >
                    ← 上一页
                  </button>
                  <span className="text-muted-foreground">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, tableData.total)} / {tableData.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => void browseTable(selectedTable as string, page + 1)}
                    disabled={!tableData.hasMore}
                    className="rounded border border-border/60 bg-muted/20 px-2 py-1 disabled:opacity-40"
                  >
                    下一页 →
                  </button>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={tableData} loading={loading} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
