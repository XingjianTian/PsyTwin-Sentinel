import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = async (relativePath: string) =>
  readFile(new URL(relativePath, import.meta.url), "utf8").catch(() => "")

test("sidebar exposes pet AI management after the AI assistant and renames strategy configuration", async () => {
  const source = await readSource("../components/dashboard-sidebar.tsx")
  const assistantIndex = source.indexOf('label: "心图·AI助手"')
  const petAiIndex = source.indexOf('label: "心宠AI管理中心"')

  assert.notEqual(assistantIndex, -1)
  assert.ok(petAiIndex > assistantIndex)
  assert.match(source, /label: "心宠AI管理中心", href: "\/pet-ai-management"/)
  assert.match(source, /label: "后台智能体配置中心", href: "\/ai-config\?tab=strategy"/)
  assert.doesNotMatch(source, /模型与策略中心/)
})

test("pet AI management route renders the native management workspace", async () => {
  const viewSource = await readSource("../components/views/pet-ai-management-view.tsx")
  const pageSource = await readSource("../app/(dashboard)/pet-ai-management/page.tsx")
  const collaborationPresentationSource = await readSource("./pet-ai/collaboration-presentation.ts")

  assert.match(viewSource, />心宠AI管理中心</)
  assert.match(viewSource, /学生与心宠/)
  assert.match(viewSource, /性格配置/)
  assert.match(viewSource, />心宠信息</)
  assert.match(viewSource, /对话记录/)
  assert.match(viewSource, /实时联调/)
  assert.match(viewSource, /value="info"/)
  assert.match(viewSource, /value="profile"/)
  assert.match(viewSource, /grid-cols-4/)
  assert.doesNotMatch(viewSource, /value="risk"/)
  assert.doesNotMatch(viewSource, />风险演示</)
  assert.match(viewSource, /当前性格配置/)
  assert.match(viewSource, /保存后用于下一次 Reachy 会话/)
  assert.match(viewSource, /loading="eager"/)
  assert.match(viewSource, /w-fit/)
  assert.match(viewSource, /学生发送/)
  assert.match(viewSource, /Pocket 同款心宠/)
  assert.match(viewSource, /协作过程/)
  assert.match(viewSource, /检测到负面情绪/)
  assert.match(viewSource, /咨询师智能体专业建议/)
  assert.match(viewSource, /getCollaborationEventPresentation/)
  assert.match(collaborationPresentationSource, /Therapist\.png/)
  assert.match(viewSource, /alt="心宠头像" width=\{40\} height=\{40\} className="size-9/)
  assert.match(viewSource, /aria-label="学生头像"[^>]*className="flex size-10/)
  assert.match(viewSource, /alt="咨询师智能体头像" width=\{40\} height=\{40\} className="size-10/)
  assert.match(viewSource, /百度 TTS/)
  assert.match(viewSource, /risk_level/)
  assert.match(viewSource, /实时风险/)
  assert.match(viewSource, /getRiskPresentation/)
  assert.match(viewSource, /sessionRiskLevel/)
  assert.match(viewSource, /message\.riskLevel/)
  assert.match(viewSource, /lg:grid-cols-2/)
  assert.doesNotMatch(viewSource, />功能规划中</)
  assert.match(pageSource, /<PetAiManagementView\s*\/>/)
})

test("strategy configuration page uses the renamed title", async () => {
  const source = await readSource("../components/ai-config/strategy-center-view.tsx")

  assert.match(source, />后台智能体配置中心</)
  assert.doesNotMatch(source, />模型与策略中心</)
})
