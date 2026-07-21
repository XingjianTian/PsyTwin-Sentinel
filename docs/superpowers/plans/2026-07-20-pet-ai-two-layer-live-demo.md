# 心宠 AI 双层实时联调演示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在测试心宠的实体 Reachy 会话中实现“日常心宠对话—负面情绪检测—小芯专业建议—心宠个性化转述—百度 TTS”的可视化演示闭环。

**Architecture:** Sentinel 负责学生、心宠和 `PetAiProfile` 的权威数据，并在服务端生成第一层心宠运行提示词。ClawBody 负责语音链路、两次阿里云模型调用和内存事件流；Sentinel 轮询转写与事件，在现有实时联调页签中渲染可审核的阶段摘要。

**Tech Stack:** Next.js 16、React 19、Prisma、Zod、FastAPI、Pydantic、pytest、阿里云 OpenAI 兼容接口、百度 ASR/TTS。

## Global Constraints

- 不接入真实六智能体、预警、工单或咨询记录。
- 不展示模型原始思维链，只显示阶段状态、触发依据和专业建议摘要。
- 只有 `stu-test` 可以启动实体 Reachy。
- 不修改 `/api/pocket/*` 契约或 Pocket 工程。
- 当前任务不创建分支、不提交、不推送 Git。

---

### Task 1: 测试学生与测试心宠展示规则 *(已于 2026-07-20 完成)*

**Files:**
- Modify: `app/api/pet-ai/students/route.ts`
- Modify: `app/api/pet-ai/students/[studentId]/route.ts`
- Modify: `components/views/pet-ai-management-view.tsx`
- Test: `lib/pet-ai/pet-ai-api.test.ts`

**Interfaces:**
- Produces: 置顶的 `stu-test`、名称为“测试心宠”的详情、空的 `conversations`。

- [x] 写源代码/API 断言，覆盖置顶、名称覆盖、空记录和空状态文案。
- [x] 运行 `node --test --import tsx lib/pet-ai/pet-ai-api.test.ts`，确认新增断言先失败。
- [x] 在列表响应中对符合筛选的 `stu-test` 稳定置顶，并在列表和详情中统一心宠名称。
- [x] 详情接口对 `stu-test` 返回 `conversations: []`，界面为空数组渲染说明性空状态。
- [x] 重跑测试并确认通过。

### Task 2: Sentinel 服务端生成第一层心宠提示词 *(已于 2026-07-20 完成)*

**Files:**
- Modify: `lib/pet-ai/profile.ts`
- Modify: `app/api/pet-ai/reachy/session/route.ts`
- Modify: `app/api/pet-ai/reachy/test/route.ts`
- Modify: `components/views/pet-ai-management-view.tsx`
- Test: `lib/pet-ai/pet-ai-domain.test.ts`
- Test: `lib/pet-ai/pet-ai-api.test.ts`

**Interfaces:**
- Produces: `buildPetRuntimeIdentity(input)`，把心宠名称、五项 `PetAiProfile` 和公共不可覆盖说明组合为运行时个性层。
- Consumes: Prisma 中已保存的 `PetAiProfile`，缺省时使用 `DEFAULT_PET_AI_PROFILE`。

- [x] 为完整字段、主动程度分段指令以及客户端请求不再携带 `identity` 编写失败测试。
- [x] 运行对应 Node 测试，确认失败原因来自缺失的服务端组合逻辑。
- [x] 实现 `buildPetRuntimeIdentity`，会话和文本测试接口按 `studentId` 服务端查询心宠与配置。
- [x] 移除客户端 `identity/tone/responseStyle/systemPrompt` 请求字段，仅发送操作或测试文本。
- [x] 重跑 Node 测试并确认通过。

### Task 3: ClawBody 双层演示编排与事件流 *(已于 2026-07-20 完成)*

**Files:**
- Create: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/src/reachy_mini_openclaw/two_layer_demo.py`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/src/reachy_mini_openclaw/service.py`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/src/reachy_mini_openclaw/service_api.py`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/src/reachy_mini_openclaw/openai_realtime.py`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/robot_identity/AGENTS.md`
- Test: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/tests/test_two_layer_demo.py`
- Test: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/tests/test_service.py`
- Test: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/tests/test_service_api.py`

**Interfaces:**
- Produces: `detect_negative_emotion(text) -> DetectionResult`、`TwoLayerDemoOrchestrator.respond(text, pet_responder)`、`GET /v1/events?after=<cursor>`。
- Event shape: `{id, kind, status, title, summary, created_at}`，`kind` 为 `emotion|handoff|professional|relay|tts`。

- [x] 编写失败测试：普通内容不触发事件，指定负面句稳定触发 emotion/handoff/professional/relay，事件游标和 100 条容量正确。
- [x] 运行 ClawBody pytest，确认新增测试失败。
- [x] 实现纯函数检测器、内存 `EventStore` 和两阶段编排器；小芯调用使用阿里云兼容客户端，失败时返回标注为演示兜底的建议。
- [x] 在硬件会话启动时注入编排器；ASR 后普通话语直达心宠，负面话语先经过小芯再由心宠转述。
- [x] 百度 TTS 完成后写入 `tts` 事件；新增鉴权事件端点。
- [x] 修改心宠基础 `AGENTS.md`，去掉“小芯”固定身份，保留 Reachy 公共安全和身体规则。
- [x] 重跑 ClawBody `tests/` pytest 并确认通过。

### Task 4: 实时联调事件流界面 *(已于 2026-07-20 完成)*

**Files:**
- Modify: `app/api/pet-ai/reachy/status/route.ts`
- Modify: `components/views/pet-ai-management-view.tsx`
- Test: `lib/pet-ai/pet-ai-api.test.ts`
- Test: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: ClawBody `transcript` 与 `events` 的独立游标结果。
- Produces: 实时对话气泡和纵向“协作过程”事件流。

- [x] 编写失败测试，断言状态代理请求事件端点、页面包含协作过程阶段文案和空状态。
- [x] 运行 Node 测试确认失败。
- [x] 状态 API 并行代理 `/v1/status`、`/v1/transcript`、`/v1/events`。
- [x] 页面维护独立转写/事件游标，停止或切换学生时清理本地会话展示。
- [x] 在实时联调页签渲染设备卡、实时对话和结构化事件时间线；错误、处理中、完成状态使用一致的产品组件语义。
- [x] 重跑 Node 测试并确认通过。

### Task 5: 文档同步与完整验收 *(已于 2026-07-20 完成软件侧验收，实体硬件待连机)*

**Files:**
- Modify: `docs/superpowers/specs/2026-07-20-pet-ai-two-layer-live-demo-design.md`
- Modify: `docs/superpowers/specs/2026-07-20-pet-ai-management-navigation-design.md`
- Modify: `docs/PRD.md`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/README.md`

**Interfaces:**
- Produces: 配置、启动和现场演示说明，以及与实现一致的 OpenSpecs 状态。

- [x] 将已完成条目标记为 `- [x]` 并追加 2026-07-20 完成备注。
- [x] 运行全部相关 Node 测试和 ClawBody `tests/` pytest。
- [x] 运行 `npm run build` 和 Sentinel ESLint；记录任何既有、与本次无关的阻塞。
- [x] 在浏览器检查测试学生置顶、名称、空记录、实时页签内部滚动和控制台错误。
- [x] 使用文本测试验证负面句触发完整事件流；本次没有实体设备，ASR/TTS/动作仅完成代码接通，未完成实体连机验收。
