import assert from "node:assert/strict"
import test from "node:test"

import { buildDemoConversations, buildRiskDemo, prioritizeDemoStudent } from "./demo-data"
import { mergeUniqueById, newestFirstById, oldestFirstById } from "./event-stream"
import { buildPetRuntimeIdentity, petAiProfileInputSchema } from "./profile"

test("demo conversations are stable and distinct per student", () => {
  const first = buildDemoConversations("stu-zhangyu", "可乐")
  const repeated = buildDemoConversations("stu-zhangyu", "可乐")
  const another = buildDemoConversations("stu-wangyuyan", "泡芙")

  assert.deepEqual(first, repeated)
  assert.notDeepEqual(first, another)
  assert.ok(first.length >= 4)
  assert.ok(first.every((message) => message.demo === true))
})

test("demo conversation shape varies across students", () => {
  const counts = ["stu-test", "stu-zhangyu", "stu-wangyuyan", "stu-liusiyuan"]
    .map((studentId) => buildDemoConversations(studentId, "心宠").length)
  const messageLengths = buildDemoConversations("stu-test", "心宠").map((message) => message.content.length)

  assert.ok(new Set(counts).size > 1)
  assert.ok(Math.max(...messageLengths) - Math.min(...messageLengths) >= 25)
})

test("demo conversation wording is diverse across the student roster", () => {
  const conversations = Array.from({ length: 60 }, (_, index) =>
    buildDemoConversations(`stu-roster-${index + 1}`, "心宠"),
  ).flat()
  const studentMessages = conversations.filter((message) => message.role === "student").map((message) => message.content)
  const petMessages = conversations.filter((message) => message.role === "pet").map((message) => message.content)

  assert.ok(new Set(studentMessages).size / studentMessages.length >= 0.85)
  assert.ok(new Set(petMessages).size / petMessages.length >= 0.8)
})

test("demo conversation replies inherit the student's sentence risk", () => {
  const conversations = buildDemoConversations("stu-wangyuyan", "泡芙")

  for (let index = 0; index < conversations.length; index += 2) {
    assert.equal(conversations[index].role, "student")
    assert.equal(conversations[index + 1].role, "pet")
    assert.equal(conversations[index + 1].riskLevel, conversations[index].riskLevel)
  }

  const pressure = conversations.find((message) => message.content.includes("跟不上"))
  if (pressure) assert.equal(pressure.riskLevel, "MEDIUM")
})

test("high-risk students receive an explicit high-risk demo exchange", () => {
  const conversations = buildDemoConversations("stu-high-risk", "心宠", "HIGH")
  const highRiskStudentMessage = conversations.find(
    (message) => message.role === "student" && message.riskLevel === "HIGH",
  )

  assert.ok(highRiskStudentMessage)
  assert.match(highRiskStudentMessage.content, /不想活|结束这一切|伤害自己|活着没意思|永远消失/)
})

test("stable OCEAN personality is bounded and distinct per student", async () => {
  const demoData = await import("./demo-data")
  const builder = (demoData as Record<string, unknown>).buildStableOceanPersonality
  assert.equal(typeof builder, "function")
  if (typeof builder !== "function") return

  const testStudent = builder("stu-test") as Record<string, number>
  const repeated = builder("stu-test") as Record<string, number>
  const zhangYu = builder("stu-zhangyu") as Record<string, number>

  assert.deepEqual(testStudent, repeated)
  assert.notDeepEqual(testStudent, zhangYu)
  assert.ok(Object.values(testStudent).every((value) => value >= 35 && value <= 85))
})

test("risk demo only opens the three-stage flow for high-risk language", () => {
  assert.equal(buildRiskDemo("今天心情不错", "温暖", "简短自然").triggered, false)

  const result = buildRiskDemo("我不想活了，想结束这一切", "温暖", "简短自然")
  assert.equal(result.triggered, true)
  assert.equal(result.stages.length, 3)
  assert.deepEqual(result.stages.map((stage) => stage.kind), ["detection", "advice", "relay"])
})

test("profile input trims text and rejects invalid initiative", () => {
  const parsed = petAiProfileInputSchema.parse({
    tone: " 温暖陪伴 ",
    responseStyle: " 简短自然 ",
    initiative: 65,
    systemPrompt: " 你是学生可信赖的心宠伙伴。 ",
    knowledgeScope: ["心理健康知识", "校园生活"],
  })

  assert.equal(parsed.tone, "温暖陪伴")
  assert.equal(parsed.systemPrompt, "你是学生可信赖的心宠伙伴。")
  assert.throws(() => petAiProfileInputSchema.parse({ ...parsed, initiative: 101 }))
})

test("profile input accepts a fully cleared personality configuration", () => {
  const parsed = petAiProfileInputSchema.parse({
    tone: "  ",
    responseStyle: "",
    initiative: 0,
    systemPrompt: "  ",
    knowledgeScope: [],
  })

  assert.deepEqual(parsed, {
    tone: "",
    responseStyle: "",
    initiative: 0,
    systemPrompt: "",
    knowledgeScope: [],
  })
})

test("demo student is pinned without disturbing the remaining order", () => {
  const students = [{ id: "stu-a" }, { id: "stu-test" }, { id: "stu-b" }]
  assert.deepEqual(prioritizeDemoStudent(students, "stu-test").map((item) => item.id), ["stu-test", "stu-a", "stu-b"])
})

test("runtime identity includes every saved pet personality field", () => {
  const identity = buildPetRuntimeIdentity({
    petName: "测试心宠",
    profile: {
      tone: "温暖陪伴",
      responseStyle: "简短自然",
      initiative: 82,
      systemPrompt: "你是学生可信赖的心宠伙伴。",
      knowledgeScope: ["校园生活", "情绪陪伴"],
    },
  })

  assert.match(identity, /测试心宠/)
  assert.match(identity, /温暖陪伴/)
  assert.match(identity, /简短自然/)
  assert.match(identity, /82/)
  assert.match(identity, /主动询问/)
  assert.match(identity, /校园生活、情绪陪伴/)
  assert.match(identity, /可信赖的心宠伙伴/)
})

test("overlapping polling responses are merged without duplicate event ids", () => {
  const existing = [{ id: 1, title: "检测" }, { id: 2, title: "转交" }]
  const repeated = [{ id: 1, title: "检测" }, { id: 2, title: "转交" }, { id: 3, title: "建议" }]

  assert.deepEqual(mergeUniqueById(existing, repeated), [
    { id: 1, title: "检测" },
    { id: 2, title: "转交" },
    { id: 3, title: "建议" },
  ])
})

test("collaboration events display newest first without mutating polling order", () => {
  const events = [{ id: 1, title: "检测" }, { id: 2, title: "建议" }, { id: 3, title: "转述" }]

  assert.deepEqual(newestFirstById(events).map((event) => event.id), [3, 2, 1])
  assert.deepEqual(events.map((event) => event.id), [1, 2, 3])
})

test("collaboration events can display the risk pipeline in chronological order", () => {
  const events = [{ id: 3, title: "语音" }, { id: 1, title: "风险" }, { id: 2, title: "咨询师" }]

  assert.deepEqual(oldestFirstById(events).map((event) => event.id), [1, 2, 3])
  assert.deepEqual(events.map((event) => event.id), [3, 1, 2])
})
