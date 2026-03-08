"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserManagement } from "@/components/user-management";
import {
  Settings,
  Users,
  Cloud,
  Shield,
  Bell,
  RefreshCw,
  Check,
  Database,
  Cpu,
  HardDrive,
  Trash2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Lock,
  Globe,
  MessageSquare,
  Mail,
  Smartphone,
  FileText,
  MoreHorizontal,
  Clock,
} from "lucide-react";

import {
  mockSystemStatus,
  mockDatabaseStatus,
  mockSystemResources,
  mockCacheInfo,
  mockDataSources,
  mockSyncTasks,
  mockSyncStats,
  mockIPWhitelist,
  mockAuditLogs,
  mockNotificationChannels,
  mockNotificationRules,
  mockSilentHours,
} from "@/lib/mock-settings";

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getRelativeTime = (isoString: string | null) => {
  if (!isoString) return "从未";
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
};

function BasicSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">系统状态监控</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">平台名称</p>
              <p className="text-sm font-medium text-foreground mt-1">{mockSystemStatus.platformName}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">版本号</p>
              <p className="text-sm font-medium text-foreground mt-1">{mockSystemStatus.version}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">运行时间</p>
              <p className="text-sm font-medium text-foreground mt-1">{mockSystemStatus.uptime}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">系统状态</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">正常运行</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Database className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-base font-semibold text-foreground">数据库连接</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">PostgreSQL</p>
                <p className="text-xs text-muted-foreground">主数据库</p>
              </div>
            </div>
            <Badge className="border-success/30 bg-success/10 text-success">
              <Check className="mr-1 h-3 w-3" />
              已连接
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <RefreshCw className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Redis缓存</p>
                <p className="text-xs text-muted-foreground">命中率 {mockDatabaseStatus.redis.hitRate}%</p>
              </div>
            </div>
            <Badge className="border-success/30 bg-success/10 text-success">
              <Check className="mr-1 h-3 w-3" />
              已连接
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Cpu className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">系统资源</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CPU 使用率</span>
              <span className="font-medium text-foreground">{mockSystemResources.cpu.usage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${mockSystemResources.cpu.usage}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">内存</span>
              <span className="font-medium text-foreground">{mockSystemResources.memory.used}GB / {mockSystemResources.memory.total}GB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-chart-4 transition-all" style={{ width: `${mockSystemResources.memory.usage}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <HardDrive className="h-5 w-5 text-chart-3" />
          <CardTitle className="text-base font-semibold text-foreground">缓存管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">当前缓存大小</p>
              <p className="text-xs text-muted-foreground mt-0.5">Redis 缓存数据</p>
            </div>
            <span className="text-lg font-semibold text-foreground">{formatBytes(mockCacheInfo.size)}</span>
          </div>
          <Button variant="outline"><Trash2 className="mr-2 h-4 w-4" />清理缓存</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]">
          <RefreshCw className="h-4 w-4" />
          保存设置
        </Button>
      </div>
    </div>
  );
}

function DataSyncSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">数据源配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDataSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
                <div className="flex items-center gap-3">
                  <Cloud className={`h-4 w-4 ${source.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{source.name}</p>
                    <p className="text-xs text-muted-foreground">上次同步：{getRelativeTime(source.lastSyncAt)}</p>
                  </div>
                </div>
                <Badge className={source.status === 'CONNECTED' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'}>
                  {source.status === 'CONNECTED' ? '已启用' : '未连接'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">同步任务</CardTitle>
          </div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />新建任务</Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px]">
            <div className="space-y-2">
              {mockSyncTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-2 w-2 rounded-full ${task.status === 'RUNNING' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    <p className="text-sm font-medium text-foreground">{task.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">{task.status === 'RUNNING' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Clock className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">今日同步统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatBytes(mockSyncStats.todayDataSize)}</p>
              <p className="text-xs text-muted-foreground mt-1">同步数据量</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4 text-center">
              <p className="text-2xl font-bold text-success">{mockSyncStats.successRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">成功率</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4 text-center">
              <p className="text-2xl font-bold text-warning">{mockSyncStats.retryCount}</p>
              <p className="text-xs text-muted-foreground mt-1">失败重试</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">登录安全</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground mb-2">密码复杂度</p>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue="中（8位以上+数字）">
                <option>低（6位以上）</option>
                <option>中（8位以上+数字）</option>
                <option>高（8位以上+数字+特殊字符）</option>
                <option selected>中（8位以上+数字）</option>
                <option>高（8位以上+数字+特殊字符）</option>
              </select>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground mb-2">最大登录失败次数</p>
              <Input type="number" defaultValue={5} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">IP白名单</CardTitle>
          </div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />添加IP</Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px]">
            <div className="space-y-2">
              {mockIPWhitelist.map((ip) => (
                <div key={ip.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={ip.enabled ? "default" : "secondary"}>{ip.enabled ? "启用" : "禁用"}</Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ip.ipAddress}</p>
                      <p className="text-xs text-muted-foreground">{ip.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <FileText className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">操作日志审计</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-2 py-2 text-left">时间</th>
                  <th className="px-2 py-2 text-left">用户</th>
                  <th className="px-2 py-2 text-left">操作</th>
                  <th className="px-2 py-2 text-left">结果</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="border-b border-border/30">
                    <td className="px-2 py-2 text-xs text-muted-foreground">{getRelativeTime(log.createdAt)}</td>
                    <td className="px-2 py-2 text-sm">{log.userName}</td>
                    <td className="px-2 py-2 text-sm">{log.action}</td>
                    <td className="px-2 py-2">
                      <Badge className={log.status === 'SUCCESS' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'}>
                        {log.status === 'SUCCESS' ? '成功' : '失败'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">通知渠道配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockNotificationChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
                <div className="flex items-center gap-3">
                  {channel.type === 'WECHAT_WORK' && <MessageSquare className="h-4 w-4 text-primary" />}
                  {channel.type === 'SMS' && <Smartphone className="h-4 w-4 text-primary" />}
                  {channel.type === 'EMAIL' && <Mail className="h-4 w-4 text-muted-foreground" />}
                  {channel.type === 'APP_PUSH' && <Bell className="h-4 w-4 text-primary" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">{channel.testStatus === 'SUCCESS' ? '上次测试成功' : '未测试'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={channel.enabled ? 'border-success/30 bg-success/10 text-success' : 'border-muted/30 bg-muted/10 text-muted-foreground'}>
                    {channel.enabled ? '已配置' : '未配置'}
                  </Badge>
                  <Button variant="outline" size="sm">测试</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">通知规则</CardTitle>
          </div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />新建规则</Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {mockNotificationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${rule.enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">触发条件: {rule.triggerType}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Clock className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">静默时段</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div className="flex items-center gap-4 mb-4">
              <Input type="time" defaultValue={mockSilentHours.startTime} className="w-32" />
              <span className="text-muted-foreground">至</span>
              <Input type="time" defaultValue={mockSilentHours.endTime} className="w-32" />
            </div>
            <p className="text-xs text-muted-foreground">仅发送高危级别通知，其他通知延迟至次日推送</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主组件
function SystemSettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "basic";

  return (
    <div className="flex-1">
      {activeTab === "basic" && <BasicSettings />}
      {activeTab === "users" && <UserManagement />}
      {activeTab === "sync" && <DataSyncSettings />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </div>
  );
}

export function SystemSettingsView() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SystemSettingsContent />
    </Suspense>
  );
}
