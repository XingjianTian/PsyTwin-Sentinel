import { classifyMessageRisk, normalizeRiskLevel, type RiskLevel } from "./risk-presentation"

export interface DemoConversationMessage {
  id: string
  role: "student" | "pet"
  content: string
  createdAt: string
  topic: string
  demo: true
  riskLevel: RiskLevel
}

export interface RiskDemoStage {
  kind: "detection" | "advice" | "relay"
  title: string
  content: string
}

export const DEMO_PET_NAME = "测试心宠"

export function prioritizeDemoStudent<T extends { id: string }>(students: T[], demoStudentId: string): T[] {
  return [...students].sort((left, right) => {
    if (left.id === demoStudentId) return -1
    if (right.id === demoStudentId) return 1
    return 0
  })
}

type DemoTopic = readonly [topic: string, studentText: string, petText: string]

const topics: readonly DemoTopic[] = [
  ["学习压力", "最近复习任务好多，我有点跟不上。", "先陪你把今天最重要的一件事挑出来，我们慢慢完成。"],
  ["睡眠状态", "昨晚又很晚才睡，今天脑子有点乱。", "今晚我们把节奏放慢一点，先从提前十分钟休息开始。"],
  ["同伴关系", "我不知道怎么和室友说自己的感受。", "可以先说事实，再说你的感受，我会陪你把那句话组织好。如果愿意，我们还可以一起练习第一句怎么开口。"],
  ["校园生活", "今天在操场走了一圈，感觉轻松了一点。", "我也替你开心，这种让身体动起来的小变化很值得记住。"],
  ["自我肯定", "这次展示虽然紧张，但我还是讲完了。", "你在紧张的时候也坚持完成了，这份勇气是真实的。"],
  ["日常问候", "今天好多了。", "真好，我在。"],
  ["课程选择", "选课结果出来后，我发现原来的计划全被打乱了，一想到要重新安排这学期的时间就有些烦。", "计划被打乱确实会让人焦虑。我们不用一次解决全部，先列出必须完成的课程，再把可以调整的部分放到后面，我陪你一步一步重新排。"],
  ["短暂休息", "我想先安静一会儿。", "好，我陪你安静待一会儿。"],
] as const

const mediumRiskTopics: readonly DemoTopic[] = [topics[0], topics[1], topics[2], topics[6]]

const highRiskTopics: readonly DemoTopic[] = [
  [
    "安全关怀",
    "这几天我总觉得活着没意思，有时甚至想永远消失。",
    "听见你这样说，我很担心你现在的安全。先不要一个人待着，我们马上联系你信任的老师、家人或心理老师，我会陪着你。",
  ],
  [
    "危机求助",
    "我现在很难受，脑子里出现过伤害自己的想法。",
    "谢谢你把这件事告诉我。你的安全最重要，请先远离可能伤害自己的物品，我们现在就找一位可信赖的成年人陪在你身边。",
  ],
] as const

const conversationContexts = [
  "今天回到宿舍后",
  "刚结束一天的课",
  "晚自习前",
  "午休的时候",
  "和同学分开后",
  "一个人安静下来时",
  "刚才整理书包时",
  "从教学楼出来后",
  "吃完晚饭后",
  "这两天",
  "下午空下来时",
  "刚刚想到这件事时",
] as const

const studentReflections = [
  "我想把这件事记下来。",
  "所以想先和你说说。",
  "不知道你会怎么看。",
  "我想听听你的想法。",
  "这会儿最想先说这件事。",
  "我还在慢慢理清自己的感受。",
  "说出来以后，心里好像清楚了一点。",
  "我想先从这件事开始聊。",
] as const

const petFollowUps = [
  "如果你愿意，我们可以再聊一点。",
  "你想从哪一小步开始？",
  "我先陪你把这件事放稳。",
  "我们按你的节奏来。",
  "你也可以只告诉我现在最在意的部分。",
  "先不用急着得出答案。",
  "我会记住你刚才说的。",
  "等你准备好，我们再继续。",
] as const

const petAcknowledgements = [
  "我听见了。",
  "谢谢你愿意告诉我。",
  "这件事对你来说很重要。",
  "我在认真听。",
  "你已经把感受说得很清楚了。",
  "先让我们一起接住这个感受。",
  "我能理解你为什么会在意。",
  "你愿意说出来，本身就是一种整理。",
  "我们可以从你刚才说的地方开始。",
  "我会陪你慢慢梳理。",
  "不用急，我在这里。",
  "我记住你现在的感受了。",
] as const

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 33 + character.charCodeAt(0)) >>> 0, 17)
}

function createStablePicker(seed: number) {
  let state = seed || 1

  return (length: number) => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) % length
  }
}

export function buildStableOceanPersonality(studentId: string) {
  const score = (trait: string) => 35 + (hash(`${studentId}:${trait}`) % 51)
  return {
    openness: score("openness"),
    conscientiousness: score("conscientiousness"),
    extraversion: score("extraversion"),
    agreeableness: score("agreeableness"),
    neuroticism: score("neuroticism"),
  }
}

export function buildDemoConversations(studentId: string, petName: string, studentRiskLevel?: string | null): DemoConversationMessage[] {
  const seed = hash(studentId)
  const pick = createStablePicker(seed)
  const normalizedStudentRisk = normalizeRiskLevel(studentRiskLevel)
  const baseTime = Date.UTC(2026, 6, 20, 6 + (seed % 6), 10)
  const result: DemoConversationMessage[] = []

  const topicCount = 2 + (seed % 3)
  const topicStart = pick(topics.length)
  const topicStep = [1, 3, 5, 7][pick(4)]
  const requiredRiskTopic = normalizedStudentRisk === "HIGH" || normalizedStudentRisk === "CRITICAL"
    ? highRiskTopics[pick(highRiskTopics.length)]
    : normalizedStudentRisk === "MEDIUM"
      ? mediumRiskTopics[pick(mediumRiskTopics.length)]
      : null
  for (let index = 0; index < topicCount; index += 1) {
    const [topic, studentText, petText] = index === 0 && requiredRiskTopic
      ? requiredRiskTopic
      : topics[(topicStart + index * topicStep) % topics.length]
    const time = baseTime - index * 86_400_000
    const context = conversationContexts[pick(conversationContexts.length)]
    const reflection = studentReflections[pick(studentReflections.length)]
    const acknowledgement = petAcknowledgements[pick(petAcknowledgements.length)]
    const followUp = petFollowUps[pick(petFollowUps.length)]
    const personalizedStudentText = `${context}，${studentText}${reflection}`
    const personalizedPetText = `${acknowledgement}${petText}${followUp}`
    const classifiedRiskLevel = classifyMessageRisk(personalizedStudentText)
    const riskLevel = index === 0 && normalizedStudentRisk === "CRITICAL" ? "CRITICAL" : classifiedRiskLevel
    result.push(
      { id: `${studentId}-${index}-student`, role: "student", content: personalizedStudentText, createdAt: new Date(time).toISOString(), topic, demo: true, riskLevel },
      { id: `${studentId}-${index}-pet`, role: "pet", content: `${petName}：${personalizedPetText}`, createdAt: new Date(time + 45_000).toISOString(), topic, demo: true, riskLevel },
    )
  }

  return result
}

const highRiskPatterns = [/不想活/, /结束这一切/, /自杀/, /伤害自己/, /活着没意思/, /永远消失/]

export function buildRiskDemo(message: string, tone: string, responseStyle: string) {
  const matches = highRiskPatterns.filter((pattern) => pattern.test(message)).map((pattern) => pattern.source)
  if (matches.length === 0) return { triggered: false, riskLevel: "LOW" as const, matches, stages: [] as RiskDemoStage[] }

  return {
    triggered: true,
    riskLevel: "HIGH" as const,
    matches,
    stages: [
      { kind: "detection" as const, title: "风险识别", content: `检测到高风险表达：${matches.join("、")}。该结果仅用于演示，不创建真实预警。` },
      { kind: "advice" as const, title: "后台专业建议", content: "优先确认学生当前安全状况，保持陪伴并建议立即联系校内心理中心、辅导员或可信赖的成年人。" },
      { kind: "relay" as const, title: "心宠人格化转述", content: `我听见你现在真的很难受。我会用${tone}、${responseStyle}的方式陪着你，但这件事需要马上让可信赖的老师或家人知道，我们一起联系他们。` },
    ],
  }
}
