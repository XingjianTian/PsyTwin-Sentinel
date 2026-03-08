"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Database,
  Upload,
  BrainCircuit,
  ChevronDown,
  RefreshCw,
  Check,
  FileText,
  Trash2,
  Search,
  Send,
  Loader2,
} from "lucide-react"
import { queryRAGKnowledgeBase, indexDocumentToRAG, deleteDocumentFromRAG, checkAIStatus } from "@/app/actions/ai-services"
import type { AIDocument } from "@prisma/client"
import { RagQueryDialog } from "@/components/rag-query-dialog"

// Prompt presets
const promptPresets = [
  { label: "星际面试官", value: "star-interviewer" },
  { label: "日常树洞", value: "daily-confide" },
  { label: "危机干预专家", value: "crisis-expert" },
  { label: "情感疏导师", value: "emotional-guide" },
]

const defaultPromptText = `你是一名专业的校园心理咨询AI助手，由心图PsyTwin平台驱动。你的核心职责如下：

1. 【角色定位】你是一个温暖、专业、非评判性的心理支持者。对话时使用温和的语气，避免任何可能造成二次伤害的措辞。

2. 【安全底线】当检测到用户表达自伤或自杀倾向时，必须立即触发安全协议：
   - 表达关心和倾听
   - 引导拨打心理援助热线 400-161-9995
   - 同时向平台后台发送紧急预警标记

3. 【回应策略】优先使用认知行为疗法（CBT）和正念引导技术。在用户表达困惑时，通过苏格拉底式提问引导其自我觉察，而非直接给出建议。

4. 【保密原则】向用户明确说明保密范围及例外情况。严格遵守来访者隐私保护原则。

5. 【知识边界】当问题超出你的能力范围时，坦诚告知并建议寻求线下专业咨询师帮助。`

export function AiConfigView() {
  // State
  const [selectedPreset, setSelectedPreset] = useState("daily-confide")
  const [promptText, setPromptText] = useState(defaultPromptText)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [documents, setDocuments] = useState<AIDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)
  
  // RAG Query state
  const [ragQuery, setRagQuery] = useState("")
  const [ragDialogOpen, setRagDialogOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")  // 存储当前查询内容用于弹窗显示

  const currentPresetLabel = promptPresets.find((p) => p.value === selectedPreset)?.label || ""

  // Load documents from API
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

  // Check AI status
  useEffect(() => {
    async function init() {
      setIsLoading(true)
      const status = await checkAIStatus()
      setAiEnabled(status.enabled)
      await loadDocuments()
      setIsLoading(false)
    }
    init()
  }, [loadDocuments])

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Check file type
    // 支持的文件扩展名
    const allowedExts = ['.pdf', '.txt', '.md', '.markdown', '.doc', '.docx']
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
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
        
        // Trigger indexing
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

  // Handle delete
  const handleDelete = async (documentId: string, name: string) => {
    if (!confirm(`确定要删除文档 "${name}" 吗？`)) return

    try {
      await deleteDocumentFromRAG(documentId)
      
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

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

  // Handle RAG query
  const handleRagQuery = async () => {
    if (!ragQuery.trim()) return
    
    // 保存当前查询内容，打开弹窗
    setCurrentQuery(ragQuery)
    setRagDialogOpen(true)
  }

  // Handle save prompt
  const handleSavePrompt = async () => {
    try {
      // In a real implementation, you would save to database
      toast.success("AI 设定已保存")
    } catch (error) {
      toast.error("保存失败")
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left: RAG Knowledge Base */}
      <div className="space-y-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              本地RAG知识库管理
            </CardTitle>
            <Badge className="ml-auto border-primary/30 bg-primary/10 font-mono text-xs text-primary">
              {documents.length} 份文档
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Upload area */}
            <div
              onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false) }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { 
                e.preventDefault(); 
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 bg-secondary/20 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <Upload className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground">
                上传 PDF / TXT / Word 文档
              </p>
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

            {/* Document table */}
            <ScrollArea className="h-[calc(100vh-500px)]">
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
                      <tr
                        key={doc.id}
                        className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                      >
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-foreground">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">
                          {doc.fileSize}
                        </td>
                        <td className="px-2 py-2.5">
                          {doc.status === "VECTORIZED" ? (
                            <Badge className="border-success/30 bg-success/10 text-xs text-success">
                              <Check className="mr-1 h-3 w-3" />
                              已向量化
                            </Badge>
                          ) : doc.status === "PROCESSING" ? (
                            <Badge className="border-warning/30 bg-warning/10 text-xs text-warning">
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              处理中
                            </Badge>
                          ) : (
                            <Badge className="border-destructive/30 bg-destructive/10 text-xs text-destructive">
                              失败
                            </Badge>
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

        {/* RAG Query Test */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Search className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">
              RAG 检索测试
            </CardTitle>
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
                <Send className="h-4 w-4" />
                查询
              </button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Right: Prompt Config */}
      <Card className="flex flex-col border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BrainCircuit className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-base font-semibold text-foreground">
            心图 PsyTwin AI 设定
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Preset dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary/50"
            >
              <span>预设角色：{currentPresetLabel}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-popover py-1 shadow-xl">
                {promptPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setSelectedPreset(preset.value)
                      setDropdownOpen(false)
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedPreset === preset.value
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {preset.label}
                    {selectedPreset === preset.value && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prompt editor */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-mono">system_prompt.txt</span>
              <span className="ml-auto text-muted-foreground/50">{promptText.length} 字符</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="min-h-[300px] flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground/90 placeholder:text-muted-foreground focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Bottom status & button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)] ${aiEnabled ? "bg-success" : "bg-destructive"}`} />
              <span className="text-xs text-muted-foreground">
                {aiEnabled ? "Qwen API 已连接" : "Qwen API 未配置"}
              </span>
            </div>
            <button 
              onClick={handleSavePrompt}
              className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
            >
              <RefreshCw className="h-4 w-4" />
              保存并重载模型
            </button>
          </div>
        </CardContent>
      </Card>

      {/* RAG Query Dialog */}
      <RagQueryDialog
        query={currentQuery}
        open={ragDialogOpen}
        onOpenChange={setRagDialogOpen}
      />
    </div>
  )
}
