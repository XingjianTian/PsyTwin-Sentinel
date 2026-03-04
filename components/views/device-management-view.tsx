"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Monitor
} from "lucide-react"

// VR设备数据
const vrDevices = [
  { id: "vr-001", name: "Pico 4 Enterprise #1", sn: "P4E202401001", room: "心理咨询室 A01", status: "online", battery: 85, lastActive: "10分钟前" },
  { id: "vr-002", name: "Pico 4 Enterprise #2", sn: "P4E202401002", room: "心理咨询室 A02", status: "in_use", battery: 72, lastActive: "使用中" },
  { id: "vr-003", name: "Pico 4 Pro", sn: "P4P202401001", room: "减压舱 B01", status: "online", battery: 45, lastActive: "30分钟前" },
  { id: "vr-004", name: "Pico 4 Enterprise #3", sn: "P4E202401003", room: "VR 体验区 C01", status: "maintenance", battery: 0, lastActive: "2小时前" },
]

// 手环设备数据
const braceletDevices = [
  { id: "br-001", name: "小米手环 9 #1", sn: "MW9202401001", room: "心理咨询室 A01", status: "online", battery: 92, lastActive: "5分钟前" },
  { id: "br-002", name: "小米手环 9 #2", sn: "MW9202401002", room: "心理咨询室 A02", status: "in_use", battery: 68, lastActive: "使用中" },
  { id: "br-003", name: "小米手环 8", sn: "MW8202401001", room: "减压舱 B01", status: "offline", battery: 0, lastActive: "1天前" },
  { id: "br-004", name: "小米手环 9 #3", sn: "MW9202401003", room: "心理咨询室 A01", status: "online", battery: 55, lastActive: "15分钟前" },
]

// 脑电设备数据
const eegDevices = [
  { id: "eeg-001", name: "BrainCo Flex #1", sn: "BCF202401001", room: "心理咨询室 A01", status: "offline", battery: null, lastActive: "3天前" },
  { id: "eeg-002", name: "BrainCo Flex #2", sn: "BCF202401002", room: "心理咨询室 A02", status: "in_use", battery: null, lastActive: "使用中" },
  { id: "eeg-003", name: "BrainCo Epoch", sn: "BCE202401001", room: "减压舱 B01", status: "online", battery: null, lastActive: "20分钟前" },
]

const statusMap = {
  online: { label: "在线", color: "bg-green-500", text: "text-green-600" },
  offline: { label: "离线", color: "bg-gray-400", text: "text-gray-500" },
  in_use: { label: "使用中", color: "bg-amber-500", text: "text-amber-600" },
  maintenance: { label: "维护", color: "bg-red-500", text: "text-red-600" }
}

function DeviceCard({ device, type }: { device: any; type: "vr" | "bracelet" | "eeg" }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${
              type === "vr" ? "bg-purple-100 dark:bg-purple-900" :
              type === "bracelet" ? "bg-blue-100 dark:bg-blue-900" :
              "bg-green-100 dark:bg-green-900"
            }`}>
              {type === "vr" && <Brain className={`h-5 w-5 text-purple-600 dark:text-purple-400`} />}
              {type === "bracelet" && <Watch className={`h-5 w-5 text-blue-600 dark:text-blue-400`} />}
              {type === "eeg" && <Activity className={`h-5 w-5 text-green-600 dark:text-green-400`} />}
            </div>
            <div>
              <p className="font-medium">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.sn}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`${statusMap[device.status].text} bg-opacity-10`}>
            <span className={`mr-1 h-2 w-2 rounded-full ${statusMap[device.status].color}`} />
            {statusMap[device.status].label}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Monitor className="h-4 w-4" />
            {device.room}
          </div>
          {type !== "eeg" && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Battery className="h-4 w-4" />
              {device.battery}%
            </div>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {device.lastActive}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DeviceManagementView() {
  const onlineVr = vrDevices.filter(d => d.status === "online" || d.status === "in_use").length
  const onlineBracelet = braceletDevices.filter(d => d.status === "online" || d.status === "in_use").length
  const onlineEeg = eegDevices.filter(d => d.status === "online" || d.status === "in_use").length

  return (
    <div className="space-y-6">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vr">VR 设备</TabsTrigger>
          <TabsTrigger value="bracelet">生理手环</TabsTrigger>
          <TabsTrigger value="eeg">脑电设备</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vr" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加 VR 设备
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vrDevices.map(device => (
              <DeviceCard key={device.id} device={device} type="vr" />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="bracelet" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加手环设备
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {braceletDevices.map(device => (
              <DeviceCard key={device.id} device={device} type="bracelet" />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="eeg" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加脑电设备
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eegDevices.map(device => (
              <DeviceCard key={device.id} device={device} type="eeg" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
