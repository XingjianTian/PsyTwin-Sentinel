"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Check, Cpu, HardDrive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSystemStatus, clearAllCache } from "@/app/actions/settings";
import { getCacheInfo } from "@/lib/cache";

// 格式化字节
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

interface SystemStatus {
  platform: {
    name: string;
    version: string;
    nodeVersion: string;
  };
  database: {
    postgresql: {
      connected: boolean;
      latency: number;
    };
  };
  redis: {
    connected: boolean;
    latency: number;
    hitRate: string;
    memory: string;
    keys: number;
  };
  resources: {
    memory: {
      used: number;
      total: number;
      usage: number;
    };
    uptime: string;
  };
}

export function BasicSettingsReal() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  // 加载系统状态
  const loadStatus = async () => {
    setLoading(true);
    try {
      const result = await getSystemStatus();
      if (result.success && result.data) {
        setStatus(result.data as SystemStatus);
      } else {
        toast.error(result.error || "加载失败");
      }
    } catch (error) {
      toast.error("加载系统状态失败");
    } finally {
      setLoading(false);
    }
  };

  // 清理缓存
  const handleClearCache = async () => {
    setClearing(true);
    try {
      const result = await clearAllCache();
      if (result.success) {
        toast.success(result.message);
        await loadStatus(); // 刷新状态
      } else {
        toast.error(result.error || "清理失败");
      }
    } catch (error) {
      toast.error("清理缓存失败");
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        加载失败，请刷新页面
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 系统状态监控 */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">
            系统状态监控
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">平台名称</p>
              <p className="text-sm font-medium text-foreground mt-1">{status.platform.name}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">版本号</p>
              <p className="text-sm font-medium text-foreground mt-1">{status.platform.version}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-4">
              <p className="text-xs text-muted-foreground">运行时间</p>
              <p className="text-sm font-medium text-foreground mt-1">{status.resources.uptime}</p>
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

      {/* 数据库连接 */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Database className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-base font-semibold text-foreground">
            数据库连接
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* PostgreSQL */}
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
            <div className="flex items-center gap-3">
              {status.database.postgresql.connected ? (
                <>
                  <span className="text-xs text-muted-foreground">响应 {status.database.postgresql.latency}ms</span>
                  <Badge className="border-success/30 bg-success/10 text-success">
                    <Check className="mr-1 h-3 w-3" />
                    已连接
                  </Badge>
                </>
              ) : (
                <Badge className="border-destructive/30 bg-destructive/10 text-destructive">
                  未连接
                </Badge>
              )}
            </div>
          </div>

          {/* Redis */}
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <RefreshCw className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Redis缓存</p>
                <p className="text-xs text-muted-foreground">
                  命中率 {status.redis.hitRate} · {status.redis.keys} 个键 · {status.redis.memory}
                </p>
              </div>
            </div>
            {status.redis.connected ? (
              <Badge className="border-success/30 bg-success/10 text-success">
                <Check className="mr-1 h-3 w-3" />
                已连接
              </Badge>
            ) : (
              <Badge className="border-destructive/30 bg-destructive/10 text-destructive">
                未连接
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 系统资源 */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Cpu className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">
            系统资源
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">内存使用</span>
              <span className="font-medium text-foreground">
                {status.resources.memory.used}MB / {status.resources.memory.total}MB ({status.resources.memory.usage}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-chart-4 transition-all"
                style={{ width: `${status.resources.memory.usage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 缓存管理 */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <HardDrive className="h-5 w-5 text-chart-3" />
          <CardTitle className="text-base font-semibold text-foreground">
            缓存管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">当前缓存状态</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {status.redis.keys} 个键 · {status.redis.memory} · 命中率 {status.redis.hitRate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClearCache} disabled={clearing}>
              {clearing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              清理缓存
            </Button>
            <Button variant="outline" onClick={loadStatus}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新状态
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
