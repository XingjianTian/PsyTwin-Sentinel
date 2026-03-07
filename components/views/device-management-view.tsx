"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Brain, 
  Watch, 
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  Monitor,
  Loader2,
} from "lucide-react"

// 设备类型映射
const typeMap = {
  VR: { label: "VR设备", icon: Brain, color: "text-purple-600", bg: "bg-purple-100" },
  BRACELET: { label: "生理手环", icon: Watch, color: "text-blue-600", bg: "bg-blue-100" },
  EEG: { label: "脑电设备", icon: Activity, color: "text-green-600", bg: "bg-green-100" },
}

const statusMap = {
  ONLINE: { label: "在线", color: "bg-green-500", text: "text-green-600" },
  OFFLINE: { label: "离线", color: "bg-gray-400", text: "text-gray-500" },
  IN_USE: { label: "使用中", color: "bg-amber-500", text: "text-amber-600" },
  MAINTENANCE: { label: "维护", color: "bg-red-500", text: "text-red-600" }
}

interface Device {
  id: string
  name: string
  serialNumber: string
  room: string | null
  status: "ONLINE" | "OFFLINE" | "IN_USE" | "MAINTENANCE"
  type: "VR" | "BRACELET" | "EEG"
  battery: number | null
  lastActive: string | null
}

// 创建设备表单组件
function CreateDeviceForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    type: 'VR',
    room: '',
    status: 'ONLINE',
    battery: 100,
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "设备创建成功" })
        onSuccess()
      } else {
        toast({ title: result.message || "创建失败", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "创建失败", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>设备名称 *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="如：Pico 4 Enterprise #1"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>序列号 *</Label>
        <Input
          value={formData.serialNumber}
          onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
          placeholder="如：P4E202401001"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>设备类型 *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({...formData, type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VR">VR设备</SelectItem>
              <SelectItem value="BRACELET">生理手环</SelectItem>
              <SelectItem value="EEG">脑电设备</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>状态</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONLINE">在线</SelectItem>
              <SelectItem value="OFFLINE">离线</SelectItem>
              <SelectItem value="IN_USE">使用中</SelectItem>
              <SelectItem value="MAINTENANCE">维护</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>所在房间</Label>
        <Input
          value={formData.room}
          onChange={(e) => setFormData({...formData, room: e.target.value})}
          placeholder="如：心理咨询室 A01"
        />
      </div>
      
      <div className="space-y-2">
        <Label>电量 (%)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={formData.battery}
          onChange={(e) => setFormData({...formData, battery: parseInt(e.target.value) || 0})}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        创建设备
      </Button>
    </form>
  )
}

// 删除确认对话框组件
function DeleteConfirmDialog({ 
  device, 
  onConfirm, 
  onCancel 
}: { 
  device: Device | null, 
  onConfirm: () => void, 
  onCancel: () => void 
}) {
  if (!device) return null
  
  return (
    <Dialog open={!!device} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认删除设备</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            确定要删除设备 <strong>{device.name}</strong> 吗？此操作不可撤销。
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>取消</Button>
            <Button variant="destructive" onClick={onConfirm}>删除</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 设备卡片组件
function DeviceCard({ 
  device, 
  onRefresh, 
  onDelete 
}: { 
  device: Device, 
  onRefresh: (id: string) => void, 
  onDelete: (device: Device) => void 
}) {
  const typeInfo = typeMap[device.type]
  const statusInfo = statusMap[device.status]
  const TypeIcon = typeInfo.icon
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${typeInfo.bg}`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <div>
              <p className="font-medium">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.serialNumber}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`${statusInfo.text} bg-opacity-10`}>
            <span className={`mr-1 h-2 w-2 rounded-full ${statusInfo.color}`} />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Monitor className="h-4 w-4" />
            {device.room || '未分配'}
          </div>
          {device.battery !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Battery className="h-4 w-4" />
              {device.battery}%
            </div>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {device.lastActive ? new Date(device.lastActive).toLocaleString() : '暂无活动'}
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onRefresh(device.id)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500"
              onClick={() => onDelete(device)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DeviceManagementView() {
  const { toast } = useToast()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null)
  
  // 加载设备列表
  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/devices?limit=100')
      const result = await response.json()
      console.log('API返回数据:', result)
      console.log('设备总数:', result.total)
      // 统计各类设备数量
      const typeCount = result.data?.reduce((acc: any, d: Device) => {
        acc[d.type] = (acc[d.type] || 0) + 1
        return acc
      }, {})
      console.log('设备类型分布:', typeCount)
      // 打印所有VR设备
      const vrDevs = result.data?.filter((d: Device) => d.type === 'VR')
      console.log('VR设备列表:', vrDevs?.map((d: Device) => d.name))
      console.log('VR设备数:', vrDevs?.length)
      if (result.success) {
        setDevices(result.data)
      } else {
        toast({ title: "加载失败", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "加载失败", description: "无法获取设备列表", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadDevices()
  }, [])
  
  // 刷新单个设备
  const handleRefresh = async (id: string) => {
    toast({ title: "刷新中..." })
    await loadDevices()
  }
  
  // 删除设备
  const handleDelete = async () => {
    if (!deviceToDelete) return
    try {
      const response = await fetch(`/api/devices/${deviceToDelete.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "设备已删除" })
        setDeviceToDelete(null)
        loadDevices()
      } else {
        toast({ title: result.message || "删除失败", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "删除失败", variant: "destructive" })
    }
  }
  
  // 按类型分组设备
  const vrDevices = devices.filter(d => d.type === 'VR')
  const braceletDevices = devices.filter(d => d.type === 'BRACELET')
  const eegDevices = devices.filter(d => d.type === 'EEG')
  
  // 统计在线设备数
  const onlineVr = vrDevices.filter(d => d.status === 'ONLINE' || d.status === 'IN_USE').length
  const onlineBracelet = braceletDevices.filter(d => d.status === 'ONLINE' || d.status === 'IN_USE').length
  const onlineEeg = eegDevices.filter(d => d.status === 'ONLINE' || d.status === 'IN_USE').length
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 删除确认对话框 */}
      <DeleteConfirmDialog 
        device={deviceToDelete} 
        onConfirm={handleDelete} 
        onCancel={() => setDeviceToDelete(null)} 
      />
      
      {/* 顶部统计 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">VR 设备</p>
              <p className="text-2xl font-bold">{onlineVr}/{vrDevices.length}</p>
              <p className="text-xs text-muted-foreground">在线</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Watch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">生理手环</p>
              <p className="text-2xl font-bold">{onlineBracelet}/{braceletDevices.length}</p>
              <p className="text-xs text-muted-foreground">在线</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">脑电设备</p>
              <p className="text-2xl font-bold">{onlineEeg}/{eegDevices.length}</p>
              <p className="text-xs text-muted-foreground">在线</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 设备列表 */}
      <Tabs defaultValue="vr" className="w-full">
        <TabsList className="flex w-full gap-3 bg-transparent p-0">
          <TabsTrigger 
            value="vr" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-purple-300 hover:data-[state=inactive]:bg-purple-50/50
              data-[state=active]:border-purple-500 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-purple-500/25"
          >
            <Brain className="h-5 w-5" />
            VR 设备
          </TabsTrigger>
          <TabsTrigger 
            value="bracelet" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-cyan-300 hover:data-[state=inactive]:bg-cyan-50/50
              data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/25"
          >
            <Watch className="h-5 w-5" />
            生理手环
          </TabsTrigger>
          <TabsTrigger 
            value="eeg" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-amber-300 hover:data-[state=inactive]:bg-amber-50/50
              data-[state=active]:border-amber-500 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-amber-500/25"
          >
            <Activity className="h-5 w-5" />
            脑电设备
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vr" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加 VR 设备
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>添加设备</DialogTitle>
                </DialogHeader>
                <CreateDeviceForm 
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    loadDevices()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vrDevices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device}
                onRefresh={handleRefresh}
                onDelete={setDeviceToDelete}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="bracelet" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加手环设备
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>添加设备</DialogTitle>
                </DialogHeader>
                <CreateDeviceForm 
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    loadDevices()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {braceletDevices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device}
                onRefresh={handleRefresh}
                onDelete={setDeviceToDelete}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="eeg" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加脑电设备
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>添加设备</DialogTitle>
                </DialogHeader>
                <CreateDeviceForm 
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    loadDevices()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eegDevices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device}
                onRefresh={handleRefresh}
                onDelete={setDeviceToDelete}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
