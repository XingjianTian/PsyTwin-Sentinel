"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Database, FileText, Loader2, RefreshCw, Search, Send, Trash2, Upload } from "lucide-react"
import type { AIDocument } from "@prisma/client"
import { toast } from "sonner"

import { deleteDocumentFromRAG, indexDocumentToRAG } from "@/app/actions/ai-services"
import { RagQueryDialog } from "@/components/rag-query-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RagKnowledgeBaseView() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [documents, setDocuments] = useState<AIDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ragQuery, setRagQuery] = useState("")
  const [ragDialogOpen, setRagDialogOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
    }
  }, [])

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      await loadDocuments()
      setIsLoading(false)
    }
    init()
  }, [loadDocuments])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const allowedExts = [".pdf", ".txt", ".md", ".markdown", ".doc", ".docx"]
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!allowedExts.includes(fileExt)) {
      toast.error("仅支持 PDF、TXT、Markdown 或 Word 文档(.doc/.docx)")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", file.name)
      formData.append("size", `${(file.size / 1024 / 1024).toFixed(1)} MB`)

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`文档 "${file.name}" 上传成功，正在索引...`)
        const content = await file.text()
        await indexDocumentToRAG(result.document.id, content)
        toast.success(`文档 "${file.name}" 索引完成`)
        await loadDocuments()
      } else {
        toast.error("上传失败")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("上传失败")
    }
  }

  const handleDelete = async (documentId: string, name: string) => {
    if (!confirm(`确定要删除文档 "${name}" 吗？`)) return

    try {
      await deleteDocumentFromRAG(documentId)
      const response = await fetch(`/api/documents/${documentId}`, { method: "DELETE" })

      if (response.ok) {
        toast.success(`文档 "${name}" 已删除`)
        await loadDocuments()
      } else {
        toast.error("删除失败")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("删除失败")
    }
  }

  const handleRagQuery = () => {
    if (!ragQuery.trim()) return
    setCurrentQuery(ragQuery)
    setRagDialogOpen(true)
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="flex">
        <Card className="flex h-full w-full flex-col border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">RAG 向量知识库</CardTitle>
            <Badge className="ml-auto border-primary/30 bg-primary/10 text-primary">{documents.length} 份文档</Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-4">
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragOver(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                handleFileUpload(e.dataTransfer.files)
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 bg-secondary/20 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <Upload className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground">上传 PDF / TXT / Word 文档</p>
              <p className="text-xs text-muted-foreground">
                拖拽文件到此处，或
                <label className="cursor-pointer text-primary hover:underline">
                  点击上传
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </p>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-2 py-2 text-left font-medium">文档名称</th>
                    <th className="px-2 py-2 text-left font-medium">大小</th>
                    <th className="px-2 py-2 text-left font-medium">状态</th>
                    <th className="px-2 py-2 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-8 text-center text-muted-foreground">
                        暂无文档，请上传
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-border/30 transition-colors hover:bg-secondary/20">
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-foreground">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">{doc.fileSize}</td>
                        <td className="px-2 py-2.5">
                          {doc.status === "VECTORIZED" ? (
                            <Badge className="border-success/30 bg-success/10 text-success">
                              <Check className="mr-1 h-3 w-3" />已向量化
                            </Badge>
                          ) : doc.status === "PROCESSING" ? (
                            <Badge className="border-warning/30 bg-warning/10 text-warning">
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />处理中
                            </Badge>
                          ) : (
                            <Badge className="border-destructive/30 bg-destructive/10 text-destructive">失败</Badge>
                          )}
                        </td>
                        <td className="px-2 py-2.5">
                          <button
                            onClick={() => handleDelete(doc.id, doc.name)}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">知识库说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>建议接入心理危机干预流程、咨询伦理、CBT 实操手册、学校转介机制等专业材料。</p>
            <p>知识库文档将用于增强 AI 回答的专业性与一致性，为后续编排节点提供可信上下文。</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">向量数据库状态</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-3 text-left font-medium">属性</th>
                  <th className="px-3 py-1.5 text-left font-medium">含义</th>
                  <th className="pl-3 py-1.5 text-left font-medium">值</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/30">
                  <td className="py-1.5 pr-3 font-mono">backend</td>
                  <td className="px-3 py-1.5">向量数据库引擎</td>
                  <td className="pl-3 py-1.5 font-mono">qmd</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1.5 pr-3 font-mono">citations</td>
                  <td className="px-3 py-1.5">引用来源追踪</td>
                  <td className="pl-3 py-1.5 font-mono">auto</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1.5 pr-3 font-mono">sessions.enabled</td>
                  <td className="px-3 py-1.5">会话状态管理</td>
                  <td className="pl-3 py-1.5 font-mono">true</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1.5 pr-3 font-mono">update.interval</td>
                  <td className="px-3 py-1.5">索引更新间隔</td>
                  <td className="pl-3 py-1.5 font-mono">5m</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-1.5 pr-3 font-mono">update.debounceMs</td>
                  <td className="px-3 py-1.5">防抖延迟</td>
                  <td className="pl-3 py-1.5 font-mono">15000ms</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 font-mono">update.onBoot</td>
                  <td className="px-3 py-1.5">启动时更新索引</td>
                  <td className="pl-3 py-1.5 font-mono">true</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">RAG 检索测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="输入查询问题，测试知识库检索效果..."
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRagQuery()}
                className="flex-1"
              />
              <button
                onClick={handleRagQuery}
                disabled={!ragQuery.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />查询
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <RagQueryDialog query={currentQuery} open={ragDialogOpen} onOpenChange={setRagDialogOpen} />
    </div>
  )
}
