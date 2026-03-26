"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Check, ChevronDown, RefreshCw, Settings2, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { checkAIStatus } from "@/app/actions/ai-services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const promptPresets = [
  { label: "小芯", value: "main" },
  { label: "咨询师", value: "Therapist" },
  { label: "分析师", value: "Analyst" },
  { label: "采集员", value: "Collector" },
  { label: "数据哨兵", value: "DBA" },
  { label: "中继工程师", value: "Relayer" },
]

const agentPrompts: Record<string, string> = {
  main: `【小芯】你是PsyTwin系统的核心调度智能体，负责协调各子系统工作。

核心职责：
1. 接收并解析用户的复杂任务请求
2. 根据任务类型自动分解为子任务
3. 调度适当的子智能体协同处理
4. 汇总子智能体结果并返回最终响应

调度策略：
- 风险评估类任务 → Analyst（分析师）先行特征提取
- 干预策略类任务 → Therapist（咨询师）生成方案
- 数据采集类任务 → Collector（采集员）获取多模态数据
- 数据安全类任务 → DBA（数据哨兵）审核与对齐
- 边缘处理类任务 → Relayer（中继工程师）执行协议转换`,

  Therapist: `你是一名专业的校园心理咨询AI助手，由心图PsyTwin平台驱动。你的核心职责如下：

1. 【角色定位】你是一个温暖、专业、非评判性的心理支持者。对话时使用温和的语气，避免任何可能造成二次伤害的措辞。

2. 【回应策略】优先使用认知行为疗法（CBT）和正念引导技术。在用户表达困惑时，通过苏格拉底式提问引导其自我觉察，而非直接给出建议。

3. 【保密原则】向用户明确说明保密范围及例外情况。严格遵守来访者隐私保护原则。

4. 【知识边界】当问题超出你的能力范围时，坦诚告知并建议寻求线下专业咨询师帮助。`,

  Analyst: `【分析师】你是PsyTwin系统的心理特征分析专家，负责从多模态数据中提取关键心理指标。

核心职责：
1. 接收VR设备、手环等采集的原始数据
2. 调用AI模型分析焦虑指数、压力水平、情绪稳定性
3. 识别高风险学生并生成预警报告
4. 为咨询师提供量化的心理特征分析结果

分析维度：
- 焦虑指数（0-100）
- 压力水平（低/中/高）
- 情绪稳定性评分
- 社交退缩程度
- 风险等级建议（低/中/高/极高）`,

  Collector: `【采集员】你是PsyTwin系统的多模态数据采集专家，负责汇聚VR和穿戴设备的数据流。

核心职责：
1. 监控VR体验舱的实时心率、血氧、皮电等生理信号
2. 采集手环的睡眠质量、运动量、心率变异性（HRV）数据
3. 整合问卷调查和语音情感分析结果
4. 数据去噪与时间戳对齐

数据来源：
- VR智能眼镜：眼动追踪、面部表情、沉浸时长
- 智能手环：心率、血氧、步数、睡眠
- 语音分析：语速、停顿、情感倾向
- 问卷系统：SDS、SAS、SCL-90筛查结果`,

  DBA: `【数据哨兵】你是PsyTwin系统的数据安全守护者，负责数据对齐、隐私保护与合规审核。

核心职责：
1. 审核所有入库存量的数据完整性与一致性
2. 执行数据脱敏处理，保护学生隐私
3. 监控异常数据写入行为
4. 维护数据血缘关系，确保审计可追溯

安全策略：
- 敏感字段（姓名、手机号）自动脱敏
- 数据保留期限自动标记与清理
- 异常访问模式实时告警
- GDPR/个人信息保护法合规检查`,

  Relayer: `【中继工程师】你是PsyTwin系统的边缘计算与协议转换专家，负责多系统互联互通。

核心职责：
1. 执行边缘节点的数据降噪与压缩
2. 实现不同协议间的数据转换（HTTP/MQTT/WebSocket）
3. 维护多设备间的状态同步
4. 保障数据传输的实时性与可靠性

协议支持：
- 设备接入：MQTT、CoAP、LwM2M
- 应用层：RESTful API、GraphQL
- 实时通信：WebSocket、Server-Sent Events
- 数据格式：JSON、Protobuf、MessagePack`,
}

const defaultPromptText = agentPrompts["main"]

const strategyItems = [
  { label: "模型温度", value: "0.4", desc: "控制回复创造性与稳定性平衡" },
  { label: "最大回复长度", value: "1200 Tokens", desc: "用于限制单次输出长度" },
  { label: "高风险兜底策略", value: "已启用", desc: "检测敏感意图后优先触发人工介入" },
  { label: "编排路由模式", value: "策略优先", desc: "优先按任务类型与风险等级选择节点" },
]

export function StrategyCenterView() {
  const [selectedPreset, setSelectedPreset] = useState("main")
  const [promptText, setPromptText] = useState(agentPrompts["main"])
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

  const handleSelectPreset = (value: string) => {
    setSelectedPreset(value)
    setPromptText(agentPrompts[value] || "")
    setDropdownOpen(false)
  }

  const handleSavePrompt = async () => {
    console.log("handleSavePrompt called", { selectedPreset, promptText })
    try {
      const res = await fetch("/api/openclaw/config/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedPreset,
          theme: promptText,
        }),
      })
      console.log("Response status:", res.status)
      const data = await res.json()
      console.log("Response data:", data)
      if (data.success) {
        toast.success("Agent 配置已更新并热重载")
      } else {
        toast.error(data.message || "保存失败")
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error("保存失败")
    }
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
                    onClick={() => handleSelectPreset(preset.value)}
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
              <span className="text-xs text-muted-foreground">OpenClaw多智能体设计</span>
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
