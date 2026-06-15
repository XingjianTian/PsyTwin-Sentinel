'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Loader2, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

// 预警类型定义
interface PetAlert {
  id: string
  petId: string
  userId: string
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  type: string
  title: string
  description: string
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED'
  moodSnapshot: number
  energySnapshot: number
  sociabilitySnapshot: number
  duration: number
  createdAt: string
  handledBy?: string
  handledAt?: string
  resolution?: string
  notes?: string
}

// 严重程度配置
const severityConfig: Record<string, { color: string; bg: string; text: string; label: string; icon: any }> = {
  CRITICAL: {
    color: 'border-destructive',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: '紧急',
    icon: AlertTriangle,
  },
  HIGH: {
    color: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    label: '高危',
    icon: AlertTriangle,
  },
  MEDIUM: {
    color: 'border-warning',
    bg: 'bg-warning/10',
    text: 'text-warning',
    label: '中危',
    icon: Clock,
  },
  LOW: {
    color: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    label: '低危',
    icon: Clock,
  },
  INFO: {
    color: 'border-success',
    bg: 'bg-success/10',
    text: 'text-success',
    label: '信息',
    icon: CheckCircle,
  },
}

// 状态配置
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: '待处理' },
  ACKNOWLEDGED: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: '已确认' },
  RESOLVED: { color: 'text-green-500', bg: 'bg-green-500/10', label: '已解决' },
  DISMISSED: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: '已忽略' },
}

const severityOptions = [
  { value: '', label: '全部严重' },
  { value: 'CRITICAL', label: '紧急' },
  { value: 'HIGH', label: '高危' },
  { value: 'MEDIUM', label: '中危' },
  { value: 'LOW', label: '低危' },
  { value: 'INFO', label: '信息' },
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'PENDING', label: '待处理' },
  { value: 'ACKNOWLEDGED', label: '已确认' },
  { value: 'RESOLVED', label: '已解决' },
  { value: 'DISMISSED', label: '已忽略' },
]

export default function PetAlertsPage() {
  const [alerts, setAlerts] = useState<PetAlert[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<PetAlert | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [notes, setNotes] = useState('')

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', '12')
      if (searchText) params.append('search', searchText)
      if (selectedSeverity) params.append('severity', selectedSeverity)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/admin/pet-alerts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const result = await response.json()
      
      if (result.code === 0) {
        setAlerts(result.data.alerts)
        setPagination({
          page: result.data.pagination.page,
          totalPages: result.data.pagination.totalPages,
          total: result.data.pagination.total,
        })
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      // 使用模拟数据
      setAlerts([
        {
          id: 'alert_001',
          petId: 'pet_001',
          userId: 'stu_001',
          severity: 'HIGH',
          type: 'MOOD_ANOMALY',
          title: '心宠心情持续低落',
          description: '心宠已连续1天心情低于15',
          status: 'PENDING',
          moodSnapshot: 12,
          energySnapshot: 45,
          sociabilitySnapshot: 30,
          duration: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'alert_002',
          petId: 'pet_002',
          userId: 'stu_002',
          severity: 'MEDIUM',
          type: 'SOCIAL_ISOLATION',
          title: '心宠社交孤立',
          description: '心宠已连续3天社交低于10',
          status: 'PENDING',
          moodSnapshot: 50,
          energySnapshot: 60,
          sociabilitySnapshot: 8,
          duration: 3,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
      setPagination({ page: 1, totalPages: 1, total: 2 })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, searchText, selectedSeverity, selectedStatus])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const getSeverityConfig = (severity: string) => {
    return severityConfig[severity] || severityConfig.INFO
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.PENDING
  }

  const handleAlertClick = (alert: PetAlert) => {
    setSelectedAlert(alert)
    setResolution(alert.resolution || '')
    setNotes(alert.notes || '')
    setShowDetailModal(true)
  }

  const handleResolve = async () => {
    if (!selectedAlert) return

    try {
      const response = await fetch(`/api/admin/pet-alerts/${selectedAlert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolution,
          notes,
        }),
      })

      if (response.ok) {
        setAlerts(alerts.map(a => 
          a.id === selectedAlert.id 
            ? { ...a, status: 'RESOLVED' as const, resolution, notes }
            : a
        ))
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const handleDismiss = async () => {
    if (!selectedAlert) return

    try {
      const response = await fetch(`/api/admin/pet-alerts/${selectedAlert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DISMISSED',
          notes,
        }),
      })

      if (response.ok) {
        setAlerts(alerts.map(a => 
          a.id === selectedAlert.id 
            ? { ...a, status: 'DISMISSED' as const, notes }
            : a
        ))
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
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
              placeholder="搜索预警标题或描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowSeverityDropdown(!showSeverityDropdown)
                setShowStatusDropdown(false)
              }}
              className="w-[140px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {severityOptions.find((s) => s.value === selectedSeverity)?.label || '全部严重'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showSeverityDropdown && (
              <div className="absolute top-full z-10 mt-1 w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {severityOptions.map((sev) => (
                  <button
                    key={sev.value}
                    onClick={() => {
                      setSelectedSeverity(sev.value)
                      setShowSeverityDropdown(false)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedSeverity === sev.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowSeverityDropdown(false)
              }}
              className="w-[140px] justify-between"
            >
              <span>{statusOptions.find((s) => s.value === selectedStatus)?.label || '全部状态'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showStatusDropdown && (
              <div className="absolute top-full z-10 mt-1 w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setSelectedStatus(status.value)
                      setShowStatusDropdown(false)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button onClick={fetchAlerts} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
          </Button>
        </CardContent>
      </Card>

      {/* Alert Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex h-64 flex-col items-center justify-center gap-2">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-muted-foreground">暂无符合条件的预警</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert) => {
            const sevConfig = getSeverityConfig(alert.severity)
            const statusConfig = getStatusConfig(alert.status)
            const SeverityIcon = sevConfig.icon

            return (
              <Card
                key={alert.id}
                className="group cursor-pointer border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                onClick={() => handleAlertClick(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${sevConfig.bg}`}>
                      <SeverityIcon className={`h-6 w-6 ${sevConfig.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">
                        学生ID: {alert.userId}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge className={`${sevConfig.bg} ${sevConfig.text} ${sevConfig.color} text-xs`}>
                      {sevConfig.label}
                    </Badge>
                    <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs`}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-secondary/50 p-2">
                      <span className="text-xs text-muted-foreground">心情</span>
                      <div className="text-sm font-bold text-primary">{alert.moodSnapshot}</div>
                    </div>
                    <div className="rounded bg-secondary/50 p-2">
                      <span className="text-xs text-muted-foreground">能量</span>
                      <div className="text-sm font-bold text-primary">{alert.energySnapshot}</div>
                    </div>
                    <div className="rounded bg-secondary/50 p-2">
                      <span className="text-xs text-muted-foreground">社交</span>
                      <div className="text-sm font-bold text-primary">{alert.sociabilitySnapshot}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    持续 {alert.duration} 天 · {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </CardContent>
              </Card>
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

      {/* Detail Modal */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedAlert.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <p className="text-muted-foreground mb-4">{selectedAlert.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-secondary/50 rounded">
                  <div className="text-sm text-muted-foreground">心情</div>
                  <div className="text-lg font-bold">{selectedAlert.moodSnapshot}</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded">
                  <div className="text-sm text-muted-foreground">能量</div>
                  <div className="text-lg font-bold">{selectedAlert.energySnapshot}</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded">
                  <div className="text-sm text-muted-foreground">社交</div>
                  <div className="text-lg font-bold">{selectedAlert.sociabilitySnapshot}</div>
                </div>
              </div>

              {selectedAlert.status === 'PENDING' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">处理措施</label>
                      <Input
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="输入处理措施..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">备注</label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="输入备注..."
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleResolve} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      标记已解决
                    </Button>
                    <Button variant="outline" onClick={handleDismiss} className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      忽略
                    </Button>
                  </div>
                </>
              )}

              {selectedAlert.status !== 'PENDING' && (
                <div className="mt-4 p-4 bg-secondary/50 rounded">
                  <p className="text-sm"><strong>状态:</strong> {statusConfig[selectedAlert.status]?.label}</p>
                  {selectedAlert.resolution && (
                    <p className="text-sm mt-2"><strong>处理措施:</strong> {selectedAlert.resolution}</p>
                  )}
                  {selectedAlert.notes && (
                    <p className="text-sm mt-2"><strong>备注:</strong> {selectedAlert.notes}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}