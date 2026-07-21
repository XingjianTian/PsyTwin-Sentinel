export interface DemoConversationMessage {
  id: string
  role: "student" | "pet"
  content: string
  createdAt: string
  topic: string
  demo: true
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

const topics = [
  ["学习压力", "最近复习任务好多，我有点跟不上。", "先陪你把今天最重要的一件事挑出来，我们慢慢完成。"],
  ["睡眠状态", "昨晚又很晚才睡，今天脑子有点乱。", "今晚我们把节奏放慢一点，先从提前十分钟休息开始。"],
  ["同伴关系", "我不知道怎么和室友说自己的感受。", "可以先说事实，再说你的感受，我会陪你把那句话组织好。如果愿意，我们还可以一起练习第一句怎么开口。"],
  ["校园生活", "今天在操场走了一圈，感觉轻松了一点。", "我也替你开心，这种让身体动起来的小变化很值得记住。"],
  ["自我肯定", "这次展示虽然紧张，但我还是讲完了。", "你在紧张的时候也坚持完成了，这份勇气是真实的。"],
  ["日常问候", "今天好多了。", "真好，我在。"],
  ["课程选择", "选课结果出来后，我发现原来的计划全被打乱了，一想到要重新安排这学期的时间就有些烦。", "计划被打乱确实会让人焦虑。我们不用一次解决全部，先列出必须完成的课程，再把可以调整的部分放到后面，我陪你一步一步重新排。"],
  ["短暂休息", "我想先安静一会儿。", "好，我陪你安静待一会儿。"],
] as const

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 33 + character.charCodeAt(0)) >>> 0, 17)
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

export function buildDemoConversations(studentId: string, petName: string): DemoConversationMessage[] {
  const seed = hash(studentId)
  const baseTime = Date.UTC(2026, 6, 20, 6 + (seed % 6), 10)
  const result: DemoConversationMessage[] = []

  const topicCount = 2 + (seed % 3)
  for (let index = 0; index < topicCount; index += 1) {
    const [topic, studentText, petText] = topics[(seed + index * 3) % topics.length]
    const time = baseTime - index * 86_400_000
    result.push(
      { id: `${studentId}-${index}-student`, role: "student", content: studentText, createdAt: new Date(time).toISOString(), topic, demo: true },
      { id: `${studentId}-${index}-pet`, role: "pet", content: `${petName}：${petText}`, createdAt: new Date(time + 45_000).toISOString(), topic, demo: true },
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
