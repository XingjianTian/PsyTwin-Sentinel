"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  DoorOpen, 
  Clock, 
  Users, 
  Brain, 
  Watch, 
  Activity,
  Plus,
  Calendar,
  Monitor,
  Wifi
} from "lucide-react"

// 模拟数据
const consultationRooms = [
  {
    id: "room-001",
    name: "心理咨询室 A01",
    location: "学生活动中心 3 层",
    status: "available" as const,
    capacity: 1,
    currentUser: null,
    devices: {
      vr: { name: "Pico 4 Enterprise", status: "online" },
      bracelet: { name: "小米手环 9", status: "online" },
      eeg: { name: "BrainCo Flex", status: "offline" }
    }
  },
  {
    id: "room-002",
    name: "心理咨询室 A02",
    location: "学生活动中心 3 层",
    status: "in_use" as const,
    capacity: 1,
    currentUser: {
      name: "张同学",
      studentId: "2024001",
      avatar: "",
      startTime: "14:30",
      duration: 25,
      scenario: "社交焦虑脱敏"
    },
    devices: {
      vr: { name: "Pico 4 Enterprise", status: "online" },
      bracelet: { name: "小米手环 9", status: "online" },
      eeg: { name: "BrainCo Flex", status: "online" }
    }
  },
  {
    id: "room-003",
    name: "减压舱 B01",
    location: "图书馆 2 层",
    status: "available" as const,
    capacity: 2,
    currentUser: null,
    devices: {
      vr: { name: "Pico 4 Pro", status: "online" },
      bracelet: { name: "小米手环 8", status: "offline" },
      eeg: { name: "BrainCo Epoch", status: "online" }
    }
  },
  {
    id: "room-004",
    name: "VR 体验区 C01",
    location: "心理健康教育中心",
    status: "maintenance" as const,
    capacity: 1,
    currentUser: null,
    devices: {
      vr: { name: "Pico 4 Enterprise", status: "maintenance" },
      bracelet: { name: "小米手环 9", status: "online" },
      eeg: { name: "BrainCo Flex", status: "offline" }
    }
  }
]

const statusMap = {
  available: { label: "可用", color: "bg-green-500", text: "text-green-600" },
  in_use: { label: "使用中", color: "bg-amber-500", text: "text-amber-600" },
  maintenance: { label: "维护中", color: "bg-red-500", text: "text-red-600" }
}

const deviceStatusMap = {
  online: { label: "在线", color: "bg-green-500" },
  offline: { label: "离线", color: "bg-gray-400" },
  maintenance: { label: "维护", color: "bg-amber-500" }
}

export function ConsultationRoomView() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const availableCount = consultationRooms.filter(r => r.status === "available").length
  const inUseCount = consultationRooms.filter(r => r.status === "in_use").length

  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <DoorOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">可用房间</p>
              <p className="text-2xl font-bold">{availableCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-3">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">使用中</p>
              <p className="text-2xl font-bold">{inUseCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">设备在线率</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 房间列表 */}
      <div className="grid gap-4 md:grid-cols-2">
        {consultationRooms.map((room) => (
          <Card 
            key={room.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRoom === room.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedRoom(room.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                </div>
                <Badge variant="secondary" className={`${statusMap[room.status].text} bg-opacity-10`}>
                  <span className={`mr-1 h-2 w-2 rounded-full ${statusMap[room.status].color}`} />
                  {statusMap[room.status].label}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                {room.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 设备状态 */}
              <div className="mb-4 flex gap-4">
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
              </div>

              {/* 当前使用状态 */}
              {room.status === "in_use" && room.currentUser && (
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={room.currentUser.avatar} />
                        <AvatarFallback className="bg-amber-200 text-xs">
                          {room.currentUser.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{room.currentUser.name}</p>
                        <p className="text-xs text-muted-foreground">{room.currentUser.studentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{room.currentUser.scenario}</p>
                      <p className="text-xs text-muted-foreground">
                        已使用 {room.currentUser.duration} 分钟
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(room.currentUser.duration / 60) * 100} 
                    className="mt-2 h-1.5" 
                  />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="mr-1 h-4 w-4" />
                  预约
                </Button>
                {room.status === "available" && (
                  <Button size="sm" className="flex-1">
                    <Plus className="mr-1 h-4 w-4" />
                    开始使用
                  </Button>
                )}
                {room.status === "in_use" && (
                  <Button size="sm" className="flex-1">
                    <Activity className="mr-1 h-4 w-4" />
                    查看数据
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
