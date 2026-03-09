"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DoorOpen, 
  Clock, 
  Users, 
  Brain, 
  Watch, 
  Activity,
  Calendar,
  Monitor,
  Loader2,
  CheckCircle,
  Power,
  Armchair,
  Glasses,
  Sparkles,
} from "lucide-react"

// 咨询室状态映射
const roomStatusMap = {
  available: { label: "可用", color: "bg-green-500", text: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  in_use: { label: "使用中", color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  maintenance: { label: "维护中", color: "bg-red-500", text: "text-red-600", bg: "bg-red-50 dark:bg-red-950" }
}

const deviceStatusMap = {
  online: { label: "在线", color: "bg-green-500" },
  ONLINE: { label: "在线", color: "bg-green-500" },
  offline: { label: "离线", color: "bg-gray-400" },
  OFFLINE: { label: "离线", color: "bg-gray-400" },
  in_use: { label: "使用中", color: "bg-amber-500" },
  IN_USE: { label: "使用中", color: "bg-amber-500" },
  maintenance: { label: "维护", color: "bg-amber-500" },
  MAINTENANCE: { label: "维护", color: "bg-amber-500" },
}

const typeLabels: Record<string, string> = {
  COUNSELING: "心理咨询",
  VR: "VR体验",
  GROUP: "团体辅导",
}

interface Room {
  id: string
  name: string
  location: string
  status: "available" | "in_use" | "maintenance"
  capacity: number
  currentSession?: {
    id: string
    student: {
      id: string
      name: string
      studentNo: string
    }
    type: string
    startTime: string
    duration: number
  } | null
  devices: {
    vr: { name: string; status: "online" | "offline" | "maintenance" }
    bracelet: { name: string; status: "online" | "offline" | "maintenance" }
    eeg: { name: string; status: "online" | "offline" | "maintenance" }
  }
}

interface Appointment {
  id: string
  student: {
    id: string
    name: string
    studentNo: string
    className: string
  }
  teacher?: {
    id: string
    name: string
    title: string
  }
  type: string
  date: string
  timeSlot: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  reason?: string
}

// 房间数据从API获取

// 创建预约表单
function CreateAppointmentForm({ 
  roomId, 
  onSuccess 
}: { 
  roomId?: string
  onSuccess: () => void 
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Array<{id: string, name: string, studentNo: string}>>([])
  const [teachers, setTeachers] = useState<Array<{id: string, name: string, title: string}>>([])
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    roomId: roomId || '',
    type: 'COUNSELING',
    date: '',
    timeSlot: '',
    reason: '',
  })

  // 加载学生和教师列表
  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          fetch('/api/students?limit=100'),
          fetch('/api/teachers?limit=100'),
        ])
        const studentsResult = await studentsRes.json()
        const teachersResult = await teachersRes.json()
        if (studentsResult.success) setStudents(studentsResult.data)
        if (teachersResult.success) setTeachers(teachersResult.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "预约创建成功" })
        onSuccess()
      } else {
        toast({ title: result.message, variant: "destructive" })
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
        <Label>学生 *</Label>
        <Select 
          value={formData.studentId} 
          onValueChange={(value) => setFormData({...formData, studentId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择学生" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} ({student.studentNo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>咨询师</Label>
        <Select 
          value={formData.teacherId} 
          onValueChange={(value) => setFormData({...formData, teacherId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择咨询师" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>预约类型 *</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData({...formData, type: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COUNSELING">心理咨询</SelectItem>
            <SelectItem value="VR">VR体验</SelectItem>
            <SelectItem value="GROUP">团体辅导</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>日期 *</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>时段 *</Label>
          <Input
            placeholder="如：09:00-09:50"
            value={formData.timeSlot}
            onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>咨询主题/备注</Label>
        <Input
          placeholder="请输入咨询主题或备注"
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        创建预约
      </Button>
    </form>
  )
}

// 查看预约列表对话框
function RoomAppointmentsDialog({ 
  room, 
  appointments,
  isOpen, 
  onClose,
  onStartSession
}: { 
  room: Room | null
  appointments: Appointment[]
  isOpen: boolean
  onClose: () => void
  onStartSession: (appointmentId: string) => void
}) {
  if (!room) return null

  const roomAppointments = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room.name} - 今日预约</DialogTitle>
        </DialogHeader>
        
        {roomAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无预约数据
          </div>
        ) : (
          <div className="space-y-3">
            {roomAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{appointment.student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{appointment.student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()} {appointment.timeSlot}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {typeLabels[appointment.type]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {appointment.status === 'PENDING' && '待确认'}
                    {appointment.status === 'CONFIRMED' && '已确认'}
                    {appointment.status === 'COMPLETED' && '已完成'}
                    {appointment.status === 'CANCELLED' && '已取消'}
                  </Badge>
                  {appointment.status === 'CONFIRMED' && room.status === 'available' && (
                    <Button size="sm" onClick={() => onStartSession(appointment.id)}>
                      开始
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// 咨询室卡片组件
function RoomCard({ 
  room, 
  onBook, 
  onViewAppointments,
  onStartSession,
  onEndSession
}: { 
  room: Room
  onBook: (room: Room) => void
  onViewAppointments: (room: Room) => void
  onStartSession: (room: Room) => void
  onEndSession: (room: Room) => void
}) {
  const status = roomStatusMap[room.status]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </div>
          <Badge variant="secondary" className={`${status.text} bg-opacity-10`}>
            <span className={`mr-1 h-2 w-2 rounded-full ${status.color}`} />
            {status.label}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          {room.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* 设备状态 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{room.devices.vr.name}</span>
            <span className={`h-2 w-2 rounded-full ${deviceStatusMap[room.devices.vr.status].color}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <Watch className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{room.devices.bracelet.name}</span>
            <span className={`h-2 w-2 rounded-full ${deviceStatusMap[room.devices.bracelet.status].color}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{room.devices.eeg.name}</span>
            <span className={`h-2 w-2 rounded-full ${deviceStatusMap[room.devices.eeg.status].color}`} />
          </div>
        </div>


        {/* 当前使用状态 - 带进度条的版本 */}
        {room.status === "in_use" && room.currentSession && (
          <div className={`rounded-lg p-4 mb-4 ${status.bg} border border-amber-200`}>
            {/* 学生信息和咨询类型 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-amber-400 text-white text-sm font-medium">
                    {room.currentSession.student.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{room.currentSession.student.name}</p>
                  <p className="text-xs text-gray-500">{room.currentSession.student.studentNo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-700">
                  {room.currentSession.topic || typeLabels[room.currentSession.type]}
                </p>
                <p className="text-xs text-gray-500">
                  已使用 {room.currentSession.duration} 分钟
                </p>
              </div>
            </div>
            
            {/* 进度条 - 假设标准咨询时长为50分钟 */}
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((room.currentSession.duration / 50) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onBook(room)}
          >
            <Calendar className="mr-1 h-4 w-4" />
            预约
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewAppointments(room)}
          >
            <Clock className="mr-1 h-4 w-4" />
            查看
          </Button>
          
          {room.status === "available" ? (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onStartSession(room)}
            >
              <Power className="mr-1 h-4 w-4" />
              开始
            </Button>
          ) : room.status === "in_use" ? (
            <Button 
              size="sm" 
              variant="destructive"
              className="flex-1"
              onClick={() => onEndSession(room)}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              结束
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              disabled
            >
              维护
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ConsultationRoomView() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAppointmentsDialogOpen, setIsAppointmentsDialogOpen] = useState(false)

  // 加载房间列表
  const loadRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rooms')
      const result = await response.json()
      if (result.success) {
        setRooms(result.data)
      } else {
        toast({ title: '加载失败', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
      toast({ title: '加载失败', description: '无法获取房间列表', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  // 加载预约列表
  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const result = await response.json()
      if (result.success) {
        setAppointments(result.data)
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  // 开始咨询会话
  const handleStartSession = async (room: Room) => {
    setSelectedRoom(room)
    setIsAppointmentsDialogOpen(true)
  }

  const handleStartSessionFromAppointment = async (appointmentId: string) => {
    // 模拟开始会话
    toast({ title: "咨询已开始" })
    setIsAppointmentsDialogOpen(false)
    
    // 更新本地房间状态
    if (selectedRoom) {
      setRooms(prev => prev.map(r => 
        r.id === selectedRoom.id 
          ? { ...r, status: "in_use" as const }
          : r
      ))
    }
  }

  // 结束咨询会话
  const handleEndSession = async (room: Room) => {
    toast({ title: "咨询已结束" })
    
    // 更新本地房间状态
    setRooms(prev => prev.map(r => 
      r.id === room.id 
        ? { ...r, status: "available" as const, currentSession: null }
        : r
    ))
  }

  const availableCount = rooms.filter(r => r.status === "available").length
  const inUseCount = rooms.filter(r => r.status === "in_use").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 预约对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom ? `${selectedRoom.name} - 新建预约` : '新建预约'}
            </DialogTitle>
          </DialogHeader>
          <CreateAppointmentForm 
            roomId={selectedRoom?.id}
            onSuccess={() => {
              setIsCreateDialogOpen(false)
              loadAppointments()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 预约列表对话框 */}
      <RoomAppointmentsDialog
        room={selectedRoom}
        appointments={appointments}
        isOpen={isAppointmentsDialogOpen}
        onClose={() => {
          setIsAppointmentsDialogOpen(false)
          setSelectedRoom(null)
        }}
        onStartSession={handleStartSessionFromAppointment}
      />

      {/* 顶部统计 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <DoorOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">可用房间</p>
              <p className="text-2xl font-bold">{availableCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">使用中</p>
              <p className="text-2xl font-bold">{inUseCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">设备在线率</p>
              <p className="text-2xl font-bold">
                {(() => {
                  // 计算所有设备的在线率
                  const allDevices = rooms.flatMap(room => [
                    room.devices.vr, 
                    room.devices.bracelet, 
                    room.devices.eeg
                  ])
                  const onlineDevices = allDevices.filter(d => 
                    d.status === 'online' || d.status === 'ONLINE' || 
                    d.status === 'in_use' || d.status === 'IN_USE'
                  )
                  return Math.round((onlineDevices.length / allDevices.length) * 100)
                })()}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 房间分类 Tabs */}
      <Tabs defaultValue="counseling" className="w-full">
        <TabsList className="flex w-full gap-3 bg-transparent p-0">
          <TabsTrigger 
            value="counseling" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-emerald-300 hover:data-[state=inactive]:bg-emerald-50/50
              data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-emerald-500/25"
          >
            <Armchair className="h-5 w-5" />
            咨询室
          </TabsTrigger>
          <TabsTrigger 
            value="vr" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-purple-300 hover:data-[state=inactive]:bg-purple-50/50
              data-[state=active]:border-purple-500 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-purple-500/25"
          >
            <Glasses className="h-5 w-5" />
            VR体验区
          </TabsTrigger>
          <TabsTrigger 
            value="relaxation" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-4 px-6 text-base font-medium transition-all duration-200
              data-[state=inactive]:border-border data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:border-cyan-300 hover:data-[state=inactive]:bg-cyan-50/50
              data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/25"
          >
            <Sparkles className="h-5 w-5" />
            减压舱
          </TabsTrigger>
        </TabsList>

        {/* 咨询室 */}
        <TabsContent value="counseling" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.filter(r => r.name.includes('心理咨询室') || r.name.includes('疗愈')).map((room) => (
              <RoomCard 
                key={room.id} 
                room={room}
                onBook={(room) => {
                  setSelectedRoom(room)
                  setIsCreateDialogOpen(true)
                }}
                onViewAppointments={(room) => {
                  setSelectedRoom(room)
                  setIsAppointmentsDialogOpen(true)
                }}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            ))}
          </div>
        </TabsContent>

        {/* VR体验区 */}
        <TabsContent value="vr" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.filter(r => r.name.includes('VR体验区')).map((room) => (
              <RoomCard 
                key={room.id} 
                room={room}
                onBook={(room) => {
                  setSelectedRoom(room)
                  setIsCreateDialogOpen(true)
                }}
                onViewAppointments={(room) => {
                  setSelectedRoom(room)
                  setIsAppointmentsDialogOpen(true)
                }}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            ))}
          </div>
        </TabsContent>

        {/* 减压舱 */}
        <TabsContent value="relaxation" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.filter(r => r.name.includes('减压舱')).map((room) => (
              <RoomCard 
                key={room.id} 
                room={room}
                onBook={(room) => {
                  setSelectedRoom(room)
                  setIsCreateDialogOpen(true)
                }}
                onViewAppointments={(room) => {
                  setSelectedRoom(room)
                  setIsAppointmentsDialogOpen(true)
                }}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
