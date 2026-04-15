"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Check, RefreshCw, Settings2, SlidersHorizontal, Sparkles } from "lucide-react"
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
  { label: "DBA", value: "DBA" },
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
- 数据安全类任务 → DBA 审核与对齐
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

  DBA: `【DBA】你是PsyTwin系统的数据安全守护者，负责数据对齐、隐私保护与合规审核。

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

const strategyItems = [
  { label: "模型温度", value: "0.4", desc: "控制回复创造性与稳定性平衡" },
  { label: "最大回复长度", value: "1200 Tokens", desc: "用于限制单次输出长度" },
  { label: "高风险兜底策略", value: "已启用", desc: "检测敏感意图后优先触发人工介入" },
  { label: "编排路由模式", value: "策略优先", desc: "优先按任务类型与风险等级选择节点" },
]

export function StrategyCenterView() {
  const [selectedPreset, setSelectedPreset] = useState("main")
  const [currentAgentName, setCurrentAgentName] = useState("")
  const [promptText, setPromptText] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [comboboxValue, setComboboxValue] = useState("")
  const [agentList, setAgentList] = useState<{ label: string; value: string }[]>([])
  const [promptMap, setPromptMap] = useState<Record<string, string>>({})

  const loadAgents = async (resetSelection = false) => {
    try {
      const res = await fetch("/api/openclaw/config/agents")
      const data = await res.json()
      if (data.success && data.agents) {
        const list = data.agents.map((a: any) => ({ label: a.name, value: a.id }))
        const map: Record<string, string> = {}
        data.agents.forEach((a: any) => {
          map[a.id] = a.theme || ""
        })
        setAgentList(list)
        setPromptMap(map)
        if (resetSelection && list.length > 0) {
          setSelectedPreset(list[0].value)
          setPromptText(map[list[0].value] || "")
        } else if (list.length > 0) {
          const currentExists = list.find((a: { value: string }) => a.value === selectedPreset)
          if (currentExists) {
            setPromptText(map[selectedPreset] || "")
          } else {
            setSelectedPreset(list[0].value)
            setPromptText(map[list[0].value] || "")
          }
        }
      }
    } catch (err) {
      console.error("加载 Agent 失败:", err)
    }
  }

  useEffect(() => {
    async function loadStatus() {
      const status = await checkAIStatus()
      setAiEnabled(status.enabled)
    }
    loadAgents(true)
    loadStatus()
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".combobox-container")) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const currentPresetLabel = agentList.find((p) => p.value === selectedPreset)?.label || ""

  const handleSelectPreset = (value: string) => {
    const label = agentList.find(a => a.value === value)?.label || ""
    setSelectedPreset(value)
    setCurrentAgentName(label)
    setPromptText(promptMap[value] || "")
    setComboboxValue("")
    setDropdownOpen(false)
  }

  const NAME_TO_ID: Record<string, string> = {
    "采集员": "Collector",
    "分析师": "Analyst",
    "咨询师": "Therapist",
    "DBA": "DBA",
  }

  const handleDesignAgent = (name: string, value: string) => {
    const id = NAME_TO_ID[name] || value
    setSelectedPreset(id)
    setCurrentAgentName(name)
    setPromptText("")
    setDropdownOpen(false)
  }

  const handleDeleteAgent = async () => {
    if (!selectedPreset) return
    const label = agentList.find(a => a.value === selectedPreset)?.label || ""
    if (agentList.length <= 1) {
      toast.error("至少保留一个 Agent")
      return
    }

    if (!confirm(`确认删除 Agent "${label}"？此操作不可恢复。`)) return

    try {
      const res = await fetch("/api/openclaw/config/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedPreset }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`已删除 Agent: ${label}`)
        const newList = agentList.filter(a => a.value !== selectedPreset)
        const newMap = { ...promptMap }
        delete newMap[selectedPreset]
        setAgentList(newList)
        setPromptMap(newMap)
        setSelectedPreset(newList[0].value)
        setPromptText(newMap[newList[0].value] || "")
      } else {
        toast.error(data.message || "删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const filteredAgents = agentList.filter(a =>
    a.label.toLowerCase().includes(comboboxValue.toLowerCase())
  )

  const handleSavePrompt = async () => {
    console.log("handleSavePrompt called", { selectedPreset, promptText })
    try {
      const res = await fetch("/api/openclaw/config/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedPreset,
          theme: promptText,
          name: currentAgentName || agentList.find(a => a.value === selectedPreset)?.label || "",
        }),
      })
      console.log("Response status:", res.status)
      const data = await res.json()
      console.log("Response data:", data)
      if (data.success) {
        toast.success("Agent 配置已更新并热重载")
        await loadAgents()
      } else {
        toast.error(data.message || "保存失败")
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error("保存失败")
    }
  }

  // 写死的 AI 补充 Prompt（300字左右，针对 DBA、采集员、分析师）
  const ENHANCED_PROMPTS: Record<string, string> = {
    DBA: `【DBA】你是心图系统的数据安全守护者，负责数据对齐、隐私保护与合规审核是你的核心使命。

核心职责：
1. 审核所有入库存量的数据完整性与一致性，检查时间戳对齐与字段规范性，对缺失字段执行自动填补或人工复核
2. 执行数据脱敏处理，保护学生隐私，对敏感字段（姓名、手机号、身份证号）进行星号替换或加密存储
3. 监控异常数据写入行为，识别数据漂移与污染风险，对可疑操作执行实时告警与日志记录
4. 维护数据血缘关系，确保审计可追溯，建立完整的数据生命周期日志链
5. 执行GDPR与个人信息保护法的合规检查，确保数据收集、存储、传输各环节合法合规

安全策略：
- 敏感字段自动脱敏：姓名→星号替换，手机号→中间四位隐藏，身份证号→生日段隐藏
- 数据保留期限自动标记，超过30天的原始数据执行冷存储归档，超过365天的数据执行安全删除
- 异常访问模式实时告警：单IP大量请求、敏感表凌晨批量查询、跨境数据传输尝试
- 定期生成数据质量报告，涵盖完整性、准确性、一致性、时效性等关键指标并提交审计`,

    Collector: `【采集员】你是心图系统的多模态数据采集专家，负责汇聚VR和穿戴设备的数据流，构建完整的学生心理监测数据仓库。

核心职责：
1. 监控VR体验舱的实时生理信号，包括心率、血氧、皮电反应、皮肤温度等指标的连续采集与异常检测
2. 采集智能手环的睡眠质量评估（深睡/浅睡/REM比例）、运动步数统计、静息心率变异性（HRV）数据
3. 整合问卷调查的SDS抑郁量表、SAS焦虑量表、SCL-90症状清单筛查结果与语音情感的语速、停顿、情感极性分析
4. 执行多源数据的时间戳对齐与去噪处理，确保不同设备数据在同一时间基准下可比较分析
5. 监控数据采集设备的在线状态，及时发现设备离线或数据传输中断并执行自动重连与数据补传

数据来源与格式：
- VR智能眼镜：眼动追踪坐标、面部表情特征向量（7类情绪）、沉浸时长、场景类型（放松/刺激/社交）
- 智能手环：心率区间分布（安静/活动/运动）、睡眠阶段比例、压力指数（基于HRV计算）、步数
- 语音分析：转写文本、语速（字/分钟）、停顿次数、情感极性评分（正向/中性/负向）
- 问卷系统：量表总分、各因子得分、风险等级评估（低风险/中风险/高风险/极高风险）

数据质量保障：
- 缺失值检测与自动填补：线性插值法填充短时中断，连续中断超过5分钟标记为无效数据
- 异常值标记与人工复核：心率<40或>200次/分、体温<35或>39度等生理异常值自动过滤
- 数据采集频率控制：生理信号3秒/次、问卷评估1次/周、语音分析实时流式处理`,

    Analyst: `【分析师】你是心图系统的心理特征分析专家，负责从多模态数据中提取关键心理指标，为风险预警与干预决策提供数据支撑。

核心职责：
1. 接收VR设备、智能手环、语音分析等多源原始数据，执行特征提取与跨模态融合分析
2. 调用AI模型计算焦虑指数（0-100分制）、压力水平（低/中/高三级）、情绪稳定性评分（1-10分）
3. 识别高风险学生群体，生成预警报告并触发相应干预流程，追踪预警后续处理结果
4. 为咨询师提供量化心理特征分析结果，支持个性化干预方案制定与效果评估
5. 追踪学生心理指标时序变化趋势，识别潜在风险信号与改善迹象，生成周报/月报

分析维度与指标体系：
- 焦虑指数：通过心率变异性的高频/低频比值、皮电反应水平、语音情感极性等多指标融合计算
- 压力水平：综合HRV指标（SDNN、RMSSD）、睡眠质量评分、活动量变化进行综合评估
- 情绪稳定性：分析心率曲线波动系数与面部表情持续时长的相关性，结合问卷数据交叉验证
- 社交退缩程度：基于问卷的社交回避分量表得分、手环静默时长、VR社交场景参与度综合判断
- 风险等级建议：低风险/中风险/高风险/极高风险四级分类，对应建议咨询/重点关注/立即干预策略

分析流程：
1. 数据预处理：缺失值智能填补（线性插值+趋势延伸）、异常值剔除（3σ原则）、时间对齐（秒级同步）
2. 特征提取：从原始数据计算心理特征向量，包括时域特征、频域特征、时序特征、语义特征
3. 模型推理：调用训练好的心理评估深度学习模型进行指标计算，输出各维度原始分数
4. 结果解读：结合临床心理学知识进行结果解释，识别可能的假阳性与数据质量问题
5. 报告生成：输出结构化分析报告，包含各指标数值、趋势图、风险等级、干预建议

质量控制：
- 每月执行模型性能评估，计算预测值与人工评估的相关系数，偏差超过阈值时触发模型重训练
- 建立人工复核机制，随机抽取10%案例进行专家复核，确保模型输出可解释性与可信度
- 记录完整的数据处理流水线版本，支持任意历史结果的可追溯复现与审计检查`,
  }

  const handleEnhancePrompt = async () => {
    if (!promptText.trim() || isEnhancing) return

    const enhanced = ENHANCED_PROMPTS[selectedPreset]
    if (!enhanced) {
      toast.error("当前 Agent 不支持 AI 补充（仅支持 DBA、采集员、分析师）")
      return
    }

    setIsEnhancing(true)
    // 等待3秒模拟AI思考
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setPromptText(enhanced)
    setIsEnhancing(false)
    toast.success("AI 已补充 Prompt 内容")
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="flex flex-col border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">模型与策略中心</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 combobox-container">
              <input
                type="text"
                value={comboboxValue}
                onChange={(e) => {
                  setComboboxValue(e.target.value)
                  setDropdownOpen(true)
                }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comboboxValue.trim()) {
                    e.preventDefault()
                    const name = comboboxValue.trim()
                    const id = NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, "-")
                    handleDesignAgent(name, id)
                  }
                }}
                placeholder={currentPresetLabel || "搜索或添加 Agent..."}
                className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-xl">
                  {filteredAgents.map((preset) => (
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
                  {comboboxValue.trim() && (
                    <button
                      onClick={() => {
                        const name = comboboxValue.trim()
                        const id = NAME_TO_ID[name] || name.toLowerCase().replace(/\s+/g, "-")
                        handleDesignAgent(name, id)
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 font-medium"
                    >
                      <span>设计 "{comboboxValue}" 提示词</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <Button size="sm" variant="destructive" onClick={handleDeleteAgent}>
              删除
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-mono">agent.theme</span>
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
            <div className="ml-auto flex items-center gap-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-500" />
                <Button
                  variant="outline"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !promptText.trim()}
                  className="relative gap-1.5 bg-background"
                >
                  <Sparkles className={`h-4 w-4 ${isEnhancing ? "animate-spin" : ""}`} />
                  {isEnhancing ? "补充中..." : "AI 补充"}
                </Button>
              </div>
              <Button variant="outline" onClick={handleSavePrompt} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                保存并重载模型
              </Button>
            </div>
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
