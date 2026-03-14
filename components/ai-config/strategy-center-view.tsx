"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Check, ChevronDown, RefreshCw, Settings2, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { checkAIStatus } from "@/app/actions/ai-services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

const strategyItems = [
  { label: "模型温度", value: "0.4", desc: "控制回复创造性与稳定性平衡" },
  { label: "最大回复长度", value: "1200 Tokens", desc: "用于限制单次输出长度" },
  { label: "高风险兜底策略", value: "已启用", desc: "检测敏感意图后优先触发人工介入" },
  { label: "编排路由模式", value: "策略优先", desc: "优先按任务类型与风险等级选择节点" },
]

export function StrategyCenterView() {
  const [selectedPreset, setSelectedPreset] = useState("daily-confide")
  const [promptText, setPromptText] = useState(defaultPromptText)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    async function loadStatus() {
      const status = await checkAIStatus()
      setAiEnabled(status.enabled)
    }
    loadStatus()
  }, [])

  const currentPresetLabel = promptPresets.find((p) => p.value === selectedPreset)?.label || ""

  const handleSavePrompt = async () => {
    toast.success("AI 设定已保存")
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="flex flex-col border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">模型与策略中心</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
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
                      selectedPreset === preset.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {preset.label}
                    {selectedPreset === preset.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-mono">system_prompt.txt</span>
              <span className="ml-auto text-muted-foreground/50">{promptText.length} 字符</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="min-h-[340px] flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground/90 focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${aiEnabled ? "bg-success" : "bg-destructive"}`} />
              <span className="text-xs text-muted-foreground">{aiEnabled ? "Qwen API 已连接" : "Qwen API 未配置"}</span>
            </div>
            <Button onClick={handleSavePrompt} className="ml-auto">
              <RefreshCw className="h-4 w-4" />
              保存并重载模型
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">调用策略配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategyItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">能力说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>该区域用于统一管理 Prompt、角色预设、模型参数与编排策略，不再局限于单一提示词编辑。</p>
            <p>后续可继续扩展策略版本历史、灰度切换、策略审计与环境级别配置。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
