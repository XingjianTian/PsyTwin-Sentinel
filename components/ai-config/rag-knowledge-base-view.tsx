"use client"

import { Database, FileText, Network, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LIGHTRAG_URL = process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ?? "http://42.121.14.189:9621"
const LIGHTRAG_EMBED_URL = "/api/lightrag-proxy/webui/"

const statusRows = [
  ["服务地址", "LightRAG WebUI 与 API", LIGHTRAG_URL],
  ["模型服务", "阿里云百炼 OpenAI 兼容接口", "qwen-plus / qwen-turbo"],
  ["向量模型", "文档向量化与语义检索", "text-embedding-v4"],
  ["图谱入口", "默认加载全局知识图谱", "label=*"],
]

const featureCards = [
  {
    icon: FileText,
    title: "文档管理",
    description: "上传、扫描并查看文档处理状态。",
  },
  {
    icon: Network,
    title: "知识图谱",
    description: "浏览全局图谱并继续搜索节点关系。",
  },
  {
    icon: Search,
    title: "检索问答",
    description: "使用 mix 模式测试知识库召回效果。",
  },
]

export function RagKnowledgeBaseView() {
  return (
    <div className="h-[calc(100dvh-6.5rem)]">
      <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-foreground">心图心理学知识库</CardTitle>
            </div>
            <Badge className="ml-auto border-success/30 bg-success/10 text-success">已接入</Badge>
          </CardHeader>
          <CardContent className="h-[calc(100%-4.5rem)] p-3 pt-0">
            <div className="h-full overflow-hidden rounded-lg border border-border bg-background">
              <iframe
                id="lightrag-console"
                title="LightRAG 心理学知识库管理台"
                src={LIGHTRAG_EMBED_URL}
                className="h-full w-full bg-background"
                sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex min-h-0 flex-col gap-3">
          <Card className="shrink-0 gap-2 border-border bg-card py-0 shadow-sm">
            <CardHeader className="px-4 pb-1 pt-4">
              <CardTitle className="text-base font-semibold text-foreground">连接状态</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <table className="w-full table-fixed text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="w-[22%] py-1.5 pr-2 text-left font-medium">属性</th>
                    <th className="w-[43%] px-2 py-1.5 text-left font-medium">含义</th>
                    <th className="w-[35%] py-1.5 pl-2 text-left font-medium">值</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {statusRows.map(([name, meaning, value]) => (
                    <tr key={name} className="border-b border-border/30 last:border-0">
                      <td className="truncate py-1.5 pr-2 font-mono" title={name}>{name}</td>
                      <td className="truncate px-2 py-1.5" title={meaning}>{meaning}</td>
                      <td className="truncate py-1.5 pl-2 font-mono" title={value}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid min-h-0 flex-1 grid-rows-3 gap-3">
            {featureCards.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="min-h-0 gap-0 border-border bg-card py-0 shadow-sm">
                  <CardContent className="flex h-full items-center gap-3 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground" title={item.description}>
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
