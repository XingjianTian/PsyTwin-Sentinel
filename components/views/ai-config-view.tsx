"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Database,
  Upload,
  BrainCircuit,
  ChevronDown,
  RefreshCw,
  Check,
  FileText,
  Trash2,
} from "lucide-react"

// Documents
const documents = [
  { name: "危机干预指南（第三版）", size: "2.4 MB", date: "2025-11-08", status: "vectorized" as const },
  { name: "CBT疗法手册", size: "1.8 MB", date: "2025-10-22", status: "vectorized" as const },
  { name: "大学生心理健康评估标准", size: "3.1 MB", date: "2025-12-01", status: "vectorized" as const },
  { name: "校园危机事件应急预案", size: "0.9 MB", date: "2026-01-15", status: "vectorized" as const },
  { name: "正念冥想训练指导手册", size: "1.2 MB", date: "2026-01-28", status: "vectorized" as const },
  { name: "心理咨询伦理规范", size: "0.7 MB", date: "2026-02-10", status: "processing" as const },
]

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
  const [selectedPreset, setSelectedPreset] = useState("daily-confide")
  const [promptText, setPromptText] = useState(defaultPromptText)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const currentPresetLabel = promptPresets.find((p) => p.value === selectedPreset)?.label || ""

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left: RAG Knowledge Base */}
      <Card className="border-[#1a1e30]/60 bg-[#10131f]/80 backdrop-blur-sm">
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
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false) }}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-all ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 bg-secondary/20 hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <Upload className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium text-foreground">
              上传心理咨询手册 PDF / TXT
            </p>
            <p className="text-xs text-muted-foreground">
              拖拽文件到此处，或点击上传
            </p>
          </div>

          {/* Document table */}
          <ScrollArea className="h-[calc(100vh-380px)]">
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
                {documents.map((doc, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                  >
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">
                      {doc.size}
                    </td>
                    <td className="px-2 py-2.5">
                      {doc.status === "vectorized" ? (
                        <Badge className="border-success/30 bg-success/10 text-xs text-success">
                          <Check className="mr-1 h-3 w-3" />
                          已向量化
                        </Badge>
                      ) : (
                        <Badge className="border-warning/30 bg-warning/10 text-xs text-warning">
                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                          处理中
                        </Badge>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right: Prompt Config */}
      <Card className="flex flex-col border-[#0a2520]/60 bg-[#081a18]/80 backdrop-blur-sm">
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
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-[#050d0c]">
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
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className="text-xs text-muted-foreground">
                Qwen-14B 模型已连接
              </span>
            </div>
            <button className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]">
              <RefreshCw className="h-4 w-4" />
              保存并重载模型
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
