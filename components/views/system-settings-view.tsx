"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/user-management"
import {
  Settings,
  Cpu,
  Wifi,
  WifiOff,
  Watch,
  Glasses,
  Shield,
  Cloud,
  Bell,
  Database,
  ChevronRight,
  Users,
} from "lucide-react"
const settingsTabs = [
  { label: "基础设置", icon: Settings },
  { label: "设备管理", icon: Cpu },
  { label: "用户管理", icon: Users },
  { label: "数据同步", icon: Cloud },
  { label: "安全策略", icon: Shield },
  { label: "通知管理", icon: Bell },
]

/* ── Devices data ── */
interface Device {
  id: string
  name: string
  type: "pico" | "band"
  model: string
  status: "在线" | "离线" | "维护中"
  battery: number
  lastSync: string
  location: string
}

const devices: Device[] = [
  { id: "PICO-001", name: "一号体验室-Pico4U", type: "pico", model: "Pico 4 Ultra", status: "在线", battery: 85, lastSync: "2分钟前", location: "心理中心A201" },
  { id: "PICO-002", name: "二号体验室-Pico4U", type: "pico", model: "Pico 4 Ultra", status: "在线", battery: 72, lastSync: "5分钟前", location: "心理中心A202" },
  { id: "PICO-003", name: "三号体验室-Pico4", type: "pico", model: "Pico 4", status: "离线", battery: 0, lastSync: "3小时前", location: "心理中心A203" },
  { id: "PICO-004", name: "团辅室-Pico4U", type: "pico", model: "Pico 4 Ultra", status: "在线", battery: 91, lastSync: "1分钟前", location: "团辅活动室B105" },
  { id: "PICO-005", name: "流动设备-Pico4", type: "pico", model: "Pico 4", status: "维护中", battery: 45, lastSync: "1天前", location: "设备维护间" },
  { id: "BAND-001", name: "监测手环-A组01", type: "band", model: "华为 Band 9", status: "在线", battery: 68, lastSync: "实时", location: "宿舍楼6栋" },
  { id: "BAND-002", name: "监测手环-A组02", type: "band", model: "华为 Band 9", status: "在线", battery: 54, lastSync: "实时", location: "宿舍楼6栋" },
  { id: "BAND-003", name: "监测手环-B组01", type: "band", model: "小米手环8 Pro", status: "在线", battery: 82, lastSync: "实时", location: "宿舍楼3栋" },
  { id: "BAND-004", name: "监测手环-B组02", type: "band", model: "小米手环8 Pro", status: "离线", battery: 12, lastSync: "6小时前", location: "宿舍楼3栋" },
  { id: "BAND-005", name: "监测手环-C组01", type: "band", model: "华为 Band 9", status: "在线", battery: 77, lastSync: "实时", location: "宿舍楼9栋" },
]

/* ── Toggle switches ── */
interface SwitchSetting {
  label: string
  desc: string
  defaultOn: boolean
}

const switchSettings: SwitchSetting[] = [
  { label: "开启多模态数据云端同步", desc: "将VR设备、手环、语音数据实时上传至云端数据湖", defaultOn: true },
  { label: "异常心率自动告警推送", desc: "当监测到心率超过阈值时自动触发预警流程", defaultOn: true },
  { label: "设备低电量提醒", desc: "设备电量低于20%时向管理员发送通知", defaultOn: true },
  { label: "自动固件OTA升级", desc: "设备连接WiFi后自动检查并安装固件更新", defaultOn: false },
  { label: "数据本地缓存加密", desc: "设备离线时缓存数据采用AES-256加密存储", defaultOn: true },
]

/* ── Toggle component ── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
      aria-label="切换开关"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  )
}

const statusConfig = {
  "在线": { dot: "bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]", text: "text-success" },
  "离线": { dot: "bg-muted-foreground", text: "text-muted-foreground" },
  "维护中": { dot: "bg-warning shadow-[0_0_6px_rgba(249,115,22,0.5)]", text: "text-warning" },
}

export function SystemSettingsView() {
  const [activeTab, setActiveTab] = useState("设备管理")
  const [switches, setSwitches] = useState<Record<string, boolean>>(
    Object.fromEntries(switchSettings.map((s) => [s.label, s.defaultOn]))
  )

  const picoDevices = devices.filter((d) => d.type === "pico")
  const bandDevices = devices.filter((d) => d.type === "band")

  return (
    <div className="flex gap-4">
      {/* ── Left: Settings nav ── */}
      <Card className="w-56 shrink-0 border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            系统设置
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <ul className="flex flex-col gap-1">
            {settingsTabs.map((tab) => {
              const isActive = tab.label === activeTab
              return (
                <li key={tab.label}>
                  <button
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{tab.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* ── Right: Content panel ── */}
      <div className="flex-1">
        {activeTab === "设备管理" && (
          <div className="flex flex-col gap-4">
            {/* Pico devices */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Glasses className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  Pico VR 头显设备
                </CardTitle>
                <Badge className="ml-auto border-primary/30 bg-primary/10 font-mono text-xs text-primary">
                  {picoDevices.filter((d) => d.status === "在线").length}/{picoDevices.length} 在线
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {picoDevices.map((device) => (
                    <div
                      key={device.id}
                      className="rounded-lg border border-border/50 bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusConfig[device.status].dot}`} />
                        <span className="text-sm font-medium text-foreground">{device.name}</span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>型号</span>
                          <span className="text-foreground">{device.model}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>状态</span>
                          <span className={statusConfig[device.status].text}>{device.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>电量</span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${
                                  device.battery > 50 ? "bg-success" : device.battery > 20 ? "bg-warning" : "bg-destructive"
                                }`}
                                style={{ width: `${device.battery}%` }}
                              />
                            </div>
                            <span className="font-mono">{device.battery}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>位置</span>
                          <span className="text-foreground">{device.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>上次同步</span>
                          <span className="text-foreground">{device.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Band devices */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Watch className="h-5 w-5 text-chart-4" />
                <CardTitle className="text-base font-semibold text-foreground">
                  生理监测手环
                </CardTitle>
                <Badge className="ml-auto border-chart-4/30 bg-chart-4/10 font-mono text-xs text-chart-4">
                  {bandDevices.filter((d) => d.status === "在线").length}/{bandDevices.length} 在线
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {bandDevices.map((device) => (
                    <div
                      key={device.id}
                      className="rounded-lg border border-border/50 bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusConfig[device.status].dot}`} />
                        <span className="text-sm font-medium text-foreground">{device.name}</span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>型号</span>
                          <span className="text-foreground">{device.model}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>状态</span>
                          <span className={statusConfig[device.status].text}>{device.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>电量</span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${
                                  device.battery > 50 ? "bg-success" : device.battery > 20 ? "bg-warning" : "bg-destructive"
                                }`}
                                style={{ width: `${device.battery}%` }}
                              />
                            </div>
                            <span className="font-mono">{device.battery}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>位置</span>
                          <span className="text-foreground">{device.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>上次同步</span>
                          <span className="text-foreground">{device.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System switches */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold text-foreground">
                  系统功能开关
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {switchSettings.map((setting) => (
                    <div
                      key={setting.label}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{setting.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{setting.desc}</p>
                      </div>
                      <ToggleSwitch
                        checked={switches[setting.label]}
                        onChange={(v) => setSwitches((prev) => ({ ...prev, [setting.label]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "基础设置" && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">基础设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="text-sm font-medium text-foreground">系统名称</p>
                  <input
                    defaultValue="心图PsyTwin-校园心理健康数字孪生管理平台"
                    className="mt-2 w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="text-sm font-medium text-foreground">数据保留策略</p>
                  <p className="mt-1 text-xs text-muted-foreground">设置历史数据的自动清理周期</p>
                  <div className="mt-2 flex items-center gap-3">
                    <select className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>保留 12 个月</option>
                      <option>保留 24 个月</option>
                      <option>保留 36 个月</option>
                      <option>永久保留</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="text-sm font-medium text-foreground">预警阈值配置</p>
                  <p className="mt-1 text-xs text-muted-foreground">调整心率异常触发预警的 BPM 阈值</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      defaultValue={110}
                      className="w-24 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="text-sm text-muted-foreground">BPM</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                    <RefreshCw className="h-4 w-4" />
                    保存设置
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "用户管理" && (
          <UserManagement />
        )}

        {activeTab === "数据同步" && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Cloud className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">数据同步配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">云端数据湖连接</p>
                      <p className="mt-0.5 text-xs">阿里云 OSS + MaxCompute</p>
                    </div>
                    <Badge className="border-success/30 bg-success/10 text-success">已连接</Badge>
                  </div>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">实时流数据管道</p>
                      <p className="mt-0.5 text-xs">Kafka 消息队列</p>
                    </div>
                    <Badge className="border-success/30 bg-success/10 text-success">运行中</Badge>
                  </div>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">向量数据库</p>
                      <p className="mt-0.5 text-xs">Milvus 2.3 集群</p>
                    </div>
                    <Badge className="border-success/30 bg-success/10 text-success">已连接</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "安全策略" && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Shield className="h-5 w-5 text-chart-4" />
              <CardTitle className="text-base font-semibold text-foreground">安全策略管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">数据加密标准</p>
                  <p className="mt-1 text-xs">传输层：TLS 1.3 | 存储层：AES-256-GCM</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">访问控制策略</p>
                  <p className="mt-1 text-xs">基于RBAC的四级权限体系：超级管理员 / 咨询师 / 辅导员 / 只读用户</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">审计日志</p>
                  <p className="mt-1 text-xs">所有敏感操作记录保留36个月，支持全文检索</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "通知管理" && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Bell className="h-5 w-5 text-chart-2" />
              <CardTitle className="text-base font-semibold text-foreground">通知管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">预警通知渠道</p>
                  <p className="mt-1 text-xs">企业微信 + 短信 + App推送（三通道冗余）</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">通知频率限制</p>
                  <p className="mt-1 text-xs">同一学生同一类型预警：每小时最多推送1次</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
                  <p className="font-medium text-foreground">静默时段</p>
                  <p className="mt-1 text-xs">23:00 - 07:00 仅发送高危级别通知，中低危通知延迟至次日推送</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
