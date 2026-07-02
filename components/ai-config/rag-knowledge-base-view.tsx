"use client"

import { Database, ExternalLink, FileText, KeyRound, Network, RefreshCw, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LIGHTRAG_URL = process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ?? "http://42.121.14.189:9621"
const LIGHTRAG_API_KEY_HINT = process.env.NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT ?? "psytwin-local-rag-key"

const statusRows = [
  ["服务地址", "LightRAG WebUI 与 API", LIGHTRAG_URL],
  ["模型服务", "阿里云百炼 OpenAI 兼容接口", "qwen-plus / qwen-turbo"],
  ["向量模型", "文档向量化与语义检索", "text-embedding-v4"],
  ["图谱入口", "默认加载全局知识图谱", "label=*"],
  ["访问密钥", "LightRAG 管理台访问", LIGHTRAG_API_KEY_HINT],
]

const featureCards = [
  {
    icon: FileText,
    title: "文档管理",
    description: "在嵌入式 LightRAG 管理台中上传、扫描、查看文档处理状态。",
  },
  {
    icon: Network,
    title: "知识图谱",
    description: "进入 Knowledge Graph 后默认展示全局图谱，可继续搜索节点并展开关系。",
  },
  {
    icon: Search,
    title: "检索问答",
    description: "切换到 Retrieval 页面，用 mix 模式测试心理健康知识库的召回效果。",
  },
]

export function RagKnowledgeBaseView() {
  const openLightRag = () => {
    window.open(LIGHTRAG_URL, "_blank", "noopener,noreferrer")
  }

  const reloadEmbed = () => {
    const frame = document.getElementById("lightrag-console") as HTMLIFrameElement | null
    if (frame) {
      frame.src = LIGHTRAG_URL
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="min-w-0 border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-foreground">心理学知识库管理台</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                已接入 LightRAG，文档管理、知识图谱和检索测试都使用同一套真实知识库。
              </p>
            </div>
            <Badge className="ml-auto border-success/30 bg-success/10 text-success">已接入</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
              <KeyRound className="h-4 w-4 text-primary" />
              <span>如果嵌入页面提示 API Key，请输入</span>
              <code className="rounded bg-background px-2 py-1 font-mono text-xs text-foreground">
                {LIGHTRAG_API_KEY_HINT}
              </code>
              <span>。这是 LightRAG 访问密钥，不是阿里云百炼密钥。</span>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <iframe
                id="lightrag-console"
                title="LightRAG 心理学知识库管理台"
                src={LIGHTRAG_URL}
                className="h-[720px] w-full bg-background"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={reloadEmbed}>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新嵌入页
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={openLightRag}>
                <ExternalLink className="mr-2 h-4 w-4" />
                独立窗口打开
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>嵌入窗口顶部可以切换“文档”“知识图谱”“搜索”“API”等页面。</p>
              <p>
                进入知识图谱后，默认 label 为 *，会直接加载全局图谱；也可以搜索 Depression、PsyTwin
                VR、危机干预闭环等节点。
              </p>
              <p>上传新资料后，等待状态变为 Completed，再切到知识图谱或检索页查看效果。</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">连接状态</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 text-left font-medium">属性</th>
                    <th className="px-3 py-2 text-left font-medium">含义</th>
                    <th className="pl-3 py-2 text-left font-medium">值</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {statusRows.map(([name, meaning, value]) => (
                    <tr key={name} className="border-b border-border/30 last:border-0">
                      <td className="py-2 pr-3 font-mono">{name}</td>
                      <td className="px-3 py-2">{meaning}</td>
                      <td className="max-w-[150px] truncate pl-3 py-2 font-mono" title={value}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {featureCards.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="border-border bg-card shadow-sm">
                  <CardContent className="flex gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
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
