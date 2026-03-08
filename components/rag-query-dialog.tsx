"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  FileText,
  Quote,
  Lightbulb,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react"

interface RagQueryDialogProps {
  query: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock RAG 检索结果数据
const mockRagResult = {
  answer: `根据知识库检索结果，校园心理危机干预应遵循以下核心原则：

1. **及时性原则**：发现危机信号后应在24小时内启动干预流程，确保学生安全。

2. **保密性原则**：在保护学生隐私的前提下，与相关人员（辅导员、家长、专业咨询师）建立信息共享机制。

3. **分级响应**：根据风险等级采取不同措施：
   - 高危（红色）：立即启动危机干预小组，24小时陪护
   - 中危（橙色）：安排专业咨询，密切观察
   - 低危（黄色）：定期随访，提供心理支持

4. **专业转介**：对于超出学校处理能力的情况，应及时转介至专业医疗机构。`,
  sources: [
    {
      id: "chunk-1",
      documentName: "校园危机事件应急预案",
      content: "心理危机干预是指在校园环境中，针对学生出现的自杀、自伤或其他严重心理危机情况，由专业人员及时介入提供帮助的过程。干预流程包括：识别危机信号 → 初步评估 → 制定干预方案 → 实施干预 → 跟踪随访。",
      similarity: 0.92,
      metadata: { position: 0, total: 5 },
    },
    {
      id: "chunk-2",
      documentName: "危机干预指南（第三版）",
      content: "危机干预的黄金时间是发现危机信号后的24-72小时。在此期间，干预团队应与当事人建立信任关系，评估自杀风险，制定安全计划。重要原则包括：不评判、不承诺保密（涉及生命安全时）、寻求专业支持。",
      similarity: 0.87,
      metadata: { position: 2, total: 8 },
    },
    {
      id: "chunk-3",
      documentName: "心理咨询伦理规范",
      content: "心理咨询师在处理危机个案时，应当：1) 优先考虑当事人生命安全；2) 在必要时突破保密限制，通知相关人员；3) 记录所有干预措施；4) 及时进行案例督导。保密例外情况包括：当事人有明确的自杀计划、伤害他人风险、或涉及法律要求披露的情况。",
      similarity: 0.81,
      metadata: { position: 1, total: 6 },
    },
    {
      id: "chunk-4",
      documentName: "大学生心理健康评估标准",
      content: "危机风险评估量表（CRR）包含以下维度：情绪稳定性（0-10分）、社会支持系统（0-10分）、应对资源（0-10分）、自杀意念强度（0-10分）。总分≥28分为高危，20-27分为中危，<20分为低危。评估应由受过专业训练的心理咨询师进行。",
      similarity: 0.76,
      metadata: { position: 4, total: 12 },
    },
    {
      id: "chunk-5",
      documentName: "CBT疗法手册",
      content: "认知行为疗法在危机干预中的应用：帮助当事人识别自动负性思维，挑战不合理信念，建立替代性思维模式。常用技术包括：认知重构、行为激活、放松训练、问题解决技能训练。危机干预中通常采用简短CBT模型，聚焦当下问题。",
      similarity: 0.72,
      metadata: { position: 3, total: 10 },
    },
  ],
  context: `【知识库检索上下文】
[1] 心理危机干预是指在校园环境中，针对学生出现的自杀、自伤或其他严重心理危机情况...

[2] 危机干预的黄金时间是发现危机信号后的24-72小时。在此期间，干预团队应与当事人建立信任关系...

[3] 心理咨询师在处理危机个案时，应当：1) 优先考虑当事人生命安全；2) 在必要时突破保密限制...`,
  totalChunks: 5,
}

// 相似度颜色映射
function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.9) return "bg-emerald-500/20 text-emerald-600 border-emerald-300/30"
  if (similarity >= 0.8) return "bg-blue-500/20 text-blue-600 border-blue-300/30"
  if (similarity >= 0.7) return "bg-amber-500/20 text-amber-600 border-amber-300/30"
  return "bg-slate-500/20 text-slate-600 border-slate-300/30"
}

// 来源卡片组件
function SourceCard({
  source,
  index,
}: {
  source: (typeof mockRagResult.sources)[0]
  index: number
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate max-w-[200px]">{source.documentName}</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 text-xs ${getSimilarityColor(source.similarity)}`}
        >
          {(source.similarity * 100).toFixed(0)}% 匹配
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80 line-clamp-4">
        {source.content}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>片段 {source.metadata.position + 1}/{source.metadata.total}</span>
      </div>
    </div>
  )
}

export function RagQueryDialog({
  query,
  open,
  onOpenChange,
}: RagQueryDialogProps) {
  const [activeTab, setActiveTab] = useState("answer")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<typeof mockRagResult | null>(null)

  // 模拟加载效果
  const handleSearch = async () => {
    setIsLoading(true)
    setResult(null)
    
    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 1200))
    
    setResult(mockRagResult)
    setIsLoading(false)
  }

  // 当弹窗打开时自动触发搜索
  if (open && !result && !isLoading) {
    handleSearch()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">RAG 检索结果</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                查询：{query}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span>正在检索知识库...</span>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : result ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="answer" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI 回答
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                引用来源
                <Badge variant="secondary" className="ml-1 text-xs">
                  {result.sources.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="context" className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                检索上下文
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="mt-4 h-[calc(85vh-200px)] pr-4">
              <TabsContent value="answer" className="mt-0 space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      基于知识库生成的回答
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {result.answer}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <ChevronRight className="h-4 w-4" />
                    参考文档
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, idx) => (
                      <Badge
                        key={source.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => setActiveTab("sources")}
                      >
                        [{idx + 1}] {source.documentName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-0 space-y-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>从 {result.totalChunks} 个文档片段中匹配到 {result.sources.length} 个相关结果</span>
                  <span>按相似度排序</span>
                </div>
                <div className="space-y-3">
                  {result.sources.map((source, idx) => (
                    <SourceCard key={source.id} source={source} index={idx} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="context" className="mt-0">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Quote className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      用于生成回答的上下文片段
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/70">
                    {result.context}
                  </pre>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
