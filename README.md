# PsyTwin Sentinel

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" />
</p>

<p align="center">
  <strong>校园心理健康数字孪生管理平台</strong><br>
  基于多模态数据融合的学生心理健康监测预警与干预系统
</p>

---

## 📋 目录

- [项目简介](#项目简介)
- [近期功能更新概览](#近期功能更新概览)
- [项目生态](#项目生态)
- [核心功能模块](#核心功能模块)
  - [🎯 实时多模态直播舱](#实时多模态直播舱)
  - [🧠 心图·AI助手与 LightRAG 知识库](#心图ai助手与-lightrag-知识库)
  - [👤 学生心理孪生档案](#学生心理孪生档案)
  - [📅 设备与预约管理](#设备与预约管理)
  - [📊 全周期追踪](#全周期追踪)
  - [🛠️ 工程化与数据治理](#工程化与数据治理)
- [技术架构](#技术架构)
- [API 接口](#api-接口)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [文档索引](#文档索引)

---

## 项目简介

PsyTwin Sentinel 是基于 **数字孪生** 理念构建的校园心理健康管理平台，通过整合 **生理信号、语音情绪、面部表情、脑电数据** 等多模态信息，实现对学生心理健康状态的实时感知、风险预警和精准干预。

### 核心理念

- **全生命周期管理**: 从入学到毕业，持续追踪心理健康状态
- **多模态融合**: 生理+行为+环境数据交叉验证
- **预防为主**: 早期识别风险信号，主动干预
- **数据驱动**: AI 辅助决策，科学评估干预效果

---

## 近期功能更新概览

本仓库近期围绕“演示可用、业务聚合、知识库真实接入、工程化可维护”做了几轮集中更新：

| 更新方向 | 新增/调整能力 | 主要入口 |
|----------|---------------|----------|
| **导航与业务信息架构** | 精简“心理工作业务台”子栏目，将“心图·AI助手”前置；“评估干预档案”统一命名为“评估干预记录”；旧设备/预约入口保留重定向能力。 | `components/dashboard-sidebar.tsx` |
| **设备与预约管理** | 合并“线上预约管理”和“线下设备管理”，形成统一页面；顶部提供窄长双段切换按钮，在同一业务台内切换预约排期与设备状态。 | `/device-appointments` |
| **实时多模态直播舱** | 将原“心图·直播视窗”的摄像头直播能力并入多模态监测页；视觉、语音、生理、交互四路信号同屏展示，顶部状态卡适配 110% 演示缩放。 | `/multimodal` |
| **LightRAG 心理学知识库** | RAG 页面接入真实 LightRAG WebUI，支持文档管理、知识图谱、检索问答和 API 调试；OpenClaw 对话可附加 LightRAG 检索上下文。 | `/ai-config?tab=rag` |
| **数据库与种子数据** | 增加非破坏性增量种子脚本；补充宠物系统运行表迁移与测试，便于多人同步数据库结构而不清空本地业务数据。 | `npm run seed:incremental` |
| **工程化检查** | 补齐 ESLint 9 + Next.js 规则配置，`npm run lint` 成为可执行的基础质量检查。 | `eslint.config.mjs` |

---

## 项目生态

PsyTwin 是一套完整的**校园心理健康数字孪生解决方案**，由多个协同工作的子项目组成：

### 项目矩阵

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PsyTwin 生态系统                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│   │   PsyTwin-       │  │   PsyTwin-       │  │   PsyTwin-       │     │
│   │   Sentinel       │  │   Pocket         │  │   Companion      │     │
│   │   👆 本仓库       │  │   📱 移动端       │  │   🥽 VR终端       │     │
│   │                  │  │                  │  │                  │     │
│   │  管理后台        │  │  微信小程序      │  │  边缘计算网关    │     │
│   │  • 数据监控      │  │  • 学生端        │  │  • 多模态采集    │     │
│   │  • 预警中心      │  │  • 教师端        │  │  • 实时转发      │     │
│   │  • 干预管理      │  │  • AI心理咨询    │  │  • ASR/TTS       │     │
│   │  • 预约调度      │  │  • 心墙社交      │  │                  │     │
│   │                  │  │  • 线上预约      │  │  Tech: Node.js   │     │
│   │  Tech: Next.js   │  │                  │  │        Python    │     │
│   │        React     │  │  Tech: 微信小程序 │  │                  │     │
│   │        TS        │  │        TDesign   │  │                  │     │
│   └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│            │                     │                     │               │
│            │    REST API         │                     │  WebSocket    │
│            │    /api/pocket      │                     │  /ws/raspberry│
│            │                     │                     │  /ws/audio    │
│            └─────────────────────┴─────────────────────┘               │
│                              │                                           │
│                              ▼                                           │
│            ┌─────────────────────────────────────────┐                  │
│            │      PsyTwin-OpenClaw Gateway (AI 编排中心)  │                  │
│            │                                         │                  │
│            │  ┌──────────┐ ┌──────────┐ ┌────────┐  │                  │
│            │  │  main    │ │ Collector│ │Therapist│  │                  │
│            │  │首席数据官 │ │  采集员   │ │ 咨询师  │  │                  │
│            │  └──────────┘ └──────────┘ └────────┘  │                  │
│            │  ┌──────────┐ ┌──────────┐ ┌────────┐  │                  │
│            │  │ Relayer  │ │   DBA    │ │ Analyst │  │                  │
│            │  │中继工程师 │ │ 数据哨兵  │ │ 分析师  │  │                  │
│            │  └──────────┘ └──────────┘ └────────┘  │                  │
│            │                                         │                  │
│            └─────────────────────────────────────────┘                  │
│                              │                                           │
│                              ▼                                           │
│            ┌─────────────────────────────────────────┐                  │
│            │        共享基础设施                      │                  │
│            │  • PostgreSQL (主数据库)                │                  │
│            │  • Redis (缓存 / 消息队列)              │                  │
│            │  • LightRAG / 百度 AI / 阿里云百炼       │                  │
│            └─────────────────────────────────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 子项目职责

| 子项目                                                                                    | 定位       | 目标用户                   | 核心功能                                                                                                                                                                       | 技术栈                                                         |
| -------------------------------------------------------------------------------------- | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **[PsyTwin-Sentinel](https://github.com/XingjianTian/PsyTwin-Sentinel)**<br>👆 本仓库     | **管理后台** | 心理教师<br>学校管理层          | • 实时多模态直播舱<br>• 风险预警与溯源<br>• 学生心理孪生档案<br>• 干预工单管理<br>• 设备与预约管理<br>• LightRAG 知识库管理                                                                                                             | Next.js 16<br>React 19<br>TypeScript<br>PostgreSQL<br>Redis |
| **[PsyTwin-Pocket](https://github.com/XingjianTian/PsyTwin-Pocket)**<br>📱 移动端         | **学生入口** | 在校学生                   | • 心墙瀑布流社交<br>• AI 心理咨询 (Therapist)<br>• 心理画像查看<br>• 线上预约服务<br>• 消息通知中心                                                                                                     | 微信小程序<br>TDesign<br>LESS                                    |
| **[PsyTwin-Companion](https://github.com/XingjianTian/PsyTwin-Companion)**<br>🥽 VR 终端 | **边缘网关** | 系统对接<br>(Raspberry Pi) | • 多模态数据采集 (生理/语音/脑电)<br>• 实时数据转发 (WebSocket)<br>• 百度 ASR 语音转写<br>• 百度 TTS 语音合成<br>• 设备管理                                                                                   | Node.js<br>TypeScript<br>Python<br>Docker                   |
| **[PsyTwin-OpenClaw](https://github.com/XingjianTian/PsyTwin-OpenClaw)**<br>🧠 AI 编排           | **智能中枢** | AI 代理                  | • main: 首席数据官 (全链路监控)<br>• Collector: 采集员 (多模态采集)<br>• Therapist: 咨询师 (VR干预策略)<br>• Relayer: 中继工程师 (边缘处理)<br>• DBA: 数据哨兵 (数据整理)<br>• Analyst: 分析师 (特征提取)<br>• 多 Agent 协作编排 | Python<br>FastAPI<br>WebSocket                              |

### 数据流向

```
┌─────────────────────────────────────────────────────────────────┐
│                         数据流向图                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  数据采集层          边缘网关层           中台层         展示层   │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐   ┌────────┐ │
│  │ RaspBerry│        │ Companion│        │ Sentinel│   │ Pocket │ │
│  │   Pi     │───────▶│ WebSocket│───────▶│  REST   │◀──│ 小程序 │ │
│  │ (传感器) │        │  Server  │        │   API   │   │        │ │
│  └─────────┘        └────┬────┘        └────┬────┘   └────────┘ │
│                          │                    │                  │
│                          │    ┌──────────┐   │                  │
│                          └───▶│ PostgreSQL│◀──┘                  │
│                               │  Redis    │                      │
│                               └──────────┘                      │
│                                      ▲                          │
│                                      │                          │
│                               ┌──────┴──────┐                   │
│                               │  OpenClaw      │                   │
│                               │  AI 编排    │                   │
│                               └─────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 如何协作

1. **Sentinel (本仓库)** 作为**核心中台**，提供：
   - 统一的数据管理（PostgreSQL）
   - 对 Pocket 的 REST API (`/api/pocket/*`)
   - 对 Companion 的数据接收（通过 Redis）
   - 对 OpenClaw 的 AI 调用代理

2. **Pocket** 通过 REST API 与 Sentinel 交互：
   - 获取学生数据、提交预约、接收通知
   - 通过 PsyTwinClaw 直接进行 AI 对话

3. **Companion** 通过 WebSocket 与硬件交互：
   - 接收 Raspberry Pi 的传感器数据
   - 语音转写后写入数据库
   - 通过 Redis Pub/Sub 实时推送到 Sentinel

4. **Claw** 作为独立 AI 网关：
   - 被 Sentinel 和 Pocket 共同调用
   - 提供 6 个专业 Agent 服务：
     • main (首席数据官) - 全链路监控与指挥
     • Collector (采集员) - 多模态数据采集
     • Therapist (咨询师) - VR 干预策略生成
     • Relayer (中继工程师) - 边缘数据处理
     • DBA (数据哨兵) - 数据对齐与入库
     • Analyst (分析师) - 多模态特征提取

5. **LightRAG** 作为心理学知识库服务：
   - 在 Sentinel 的“心理学知识库”页面内嵌管理台
   - 负责文档入库、知识图谱、语义检索与检索问答
   - 为 OpenClaw Agent 请求补充可追溯的 RAG 上下文

---

## 核心功能模块

### 🎯 实时多模态直播舱

基于 **Server-Sent Events (SSE)** 的实时数据流架构，毫秒级同步学生生理与行为数据；同时将摄像头直播视窗合并到同一页面，形成面向心理咨询现场的实时多模态直播舱。

#### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    多模态数据采集与传输架构                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    WebSocket     ┌────────────────────────┐   │
│  │ Raspberry Pi │◄────────────────►│   WebSocket-Server     │   │
│  │   学生设备    │   /ws/raspberry  │   (PsyTwin-Companion)  │   │
│  │              │                  │                        │   │
│  │ • 心率/GSR   │                  │ • 数据解析与校验        │   │
│  │ • 血氧传感器  │                  │ • 百度 ASR 语音识别     │   │
│  │ • 录音设备   │                  │ • 语音转写存储          │   │
│  │ • 脑电设备   │                  │                        │   │
│  └──────────────┘                  └───────────┬────────────┘   │
│         ▲                                      │                 │
│         │                                      ▼                 │
│         │                            ┌──────────────────┐       │
│         │                            │     Redis        │       │
│         │                            │  Pub/Sub 广播    │       │
│         │                            └────────┬─────────┘       │
│         │                                     │                 │
│         │                      ┌──────────────┼──────────┐      │
│         │                      ▼              ▼          ▼      │
│  ┌──────┴──────────────────────┴──────────────┴──────────┐     │
│  │                    Sentinel 前端                      │     │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │     │
│  │  │  生理流     │  │  语音流     │  │  视觉流       │   │     │
│  │  │ • 心率曲线  │  │ • 实时转写  │  │ • 表情识别    │   │     │
│  │  │ • HRV/HBO │  │ • 情感分析  │  │ • 眼动追踪    │   │     │
│  │  │ • 压力指数  │  │ • 语音波形  │  │ • 脑电数据    │   │     │
│  │  └────────────┘  └────────────┘  └──────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 数据类型

| 数据流 | 采集频率 | 关键指标 | 应用场景 |
|--------|----------|----------|----------|
| **生理流** | 3秒/次 | 心率、HRV、血氧、皮电、压力指数 | 情绪唤醒度监测、压力预警 |
| **语音流** | 实时 | 转写文本、情感极性、颤抖指数 | 语言表达分析、情绪状态识别 |
| **视觉流** | 5秒/次 | 表情类型、焦虑/悲伤/愤怒指数 | 微表情分析、情绪识别 |
| **脑电数据** | 1秒/次 | Alpha/Beta/Theta 波段能量 | 专注度评估、放松度监测 |

#### 技术亮点

- **双向实时**: WebSocket 上行采集 + SSE 下行推送，端到端延迟 < 100ms
- **自动语音转写**: VAD 检测静音 → 百度 ASR 识别 → 实时显示转写文本
- **数据持久化**: 所有原始数据存入 PostgreSQL，支持历史回溯
- **智能过滤**: 支持按学生 ID 订阅，只接收关注学生的数据
- **直播融合**: 摄像头窗口优先使用 Reachy Mini 摄像头，未连接时回退到本机摄像头；状态只在视频画面内显示，避免顶部信息重复
- **演示友好布局**: 顶部学生、咨询室、会话状态、LIVE 状态和“学生列表 / 实时测试”切换保持单行；异常长时长会被格式化为 `HH:mm:ss` / `99:59:59+`
- **四流同屏**: 视觉流展示主要表情和焦虑/悲伤/愤怒指标，语音流展示波形与转写，生理流轮播心率/皮电/HRV/压力，交互流展示频率、反应延迟、震颤和回避行为

---

### 🧠 心图·AI助手与 LightRAG 知识库

**心图·AI助手** 以 PsyTwin Claw 为编排中枢，负责任务调度、工具编排和多 Agent 协作；近期进一步接入 LightRAG 心理学知识库，使 Agent 回答可以携带真实知识库检索上下文。

#### 架构设计

```
┌──────────────────────────────────────────────────────────────┐
│                    PsyTwin Claw AI 编排中心                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   编排层 (Orchestrator)                 │  │
│  │  • 意图识别  • 任务分解  • Agent 调度  • 结果聚合       │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │                    Agent 层                             │  │
│  │                                                         │  │
│  │   ┌───────────────────────────────────────────────┐    │  │
│  │   │  main (首席数据官) - 全链路监控与演示指挥      │    │  │
│  │   │  可调度: Collector, Therapist, Relayer,       │    │  │
│  │   │           DBA, Analyst                        │    │  │
│  │   └───────────────────────────────────────────────┘    │  │
│  │                                                         │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │   │ Collector│  │Therapist │  │ Relayer  │           │  │
│  │   │  采集员   │  │  咨询师   │  │ 中继工程师│           │  │
│  │   │ 多模态采集│  │ VR干预   │  │ 边缘处理  │           │  │
│  │   └──────────┘  └──────────┘  └──────────┘           │  │
│  │                                                         │  │
│  │   ┌──────────┐  ┌──────────┐                          │  │
│  │   │   DBA    │  │ Analyst  │                          │  │
│  │   │ 数据哨兵  │  │  分析师   │                          │  │
│  │   │ 数据整理  │  │ 特征提取  │                          │  │
│  │   └──────────┘  └──────────┘                          │  │
│  │                                                         │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │                   工具层 (Tools)                        │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │  │
│  │  │ 数据库 │ │ 知识库 │ │ API 调用│ │ 文件操作│          │  │
│  │  │ 查询   │ │ 检索   │ │ 外部服务│ │ 生成报告│          │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  WebSocket: ws://localhost:18789                              │
│  Protocol: OpenClaw Agent Protocol                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### 应用场景

1. **心理咨询 Agent**: 模拟咨询师对话，提供情绪支持和建议
2. **数据分析师 Agent**: 自动生成学生心理健康评估报告
3. **干预建议 Agent**: 基于风险等级推荐干预措施
4. **知识库增强问答**: 从 LightRAG 心理学知识库检索相关片段，并附加到 OpenClaw 输入上下文中

#### 集成方式

```typescript
// 调用 Claw Agent 示例
const response = await fetch('/api/openclaw/agent-chat', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'Therapist',
    message: '学生最近情绪低落，有什么建议？',
    context: { studentId: 'stu-001', riskLevel: 'medium' }
  })
})
```

#### LightRAG 心理学知识库

Sentinel 的 `AI 配置 -> 心理学知识库` 页面已经从本地模拟列表升级为嵌入式 LightRAG 管理台：

- **文档管理**: 上传 Markdown、TXT、PDF、Word 等资料，查看处理状态
- **知识图谱**: 默认使用 `label=*` 加载全局心理学图谱，支持节点检索和关系展开
- **检索测试**: 使用 mix 模式验证心理健康知识库召回效果
- **API 调试**: 直接在 LightRAG WebUI 中验证文档状态、图谱规模和查询接口
- **Agent 上下文注入**: `/api/openclaw/agent-chat` 会通过 LightRAG `/query` 获取上下文，并写入 `[PSYTWIN_RAG_CONTEXT]` 片段供 Agent 使用

相关配置见 `.env.example`：

```env
NEXT_PUBLIC_LIGHTRAG_WEBUI_URL="http://42.121.14.189:9621"
LIGHTRAG_API_URL="http://42.121.14.189:9621"
NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT="psytwin-local-rag-key"
```

部署与迁移细节见 [LightRAG 集成说明](./docs/LIGHTRAG_INTEGRATION.md) 和 [LightRAG 迁移部署教程](./docs/LIGHTRAG_MIGRATION_DEPLOYMENT_GUIDE.md)。

---

### 👤 学生心理孪生档案

为每位学生构建贯穿全生命周期的 **数字孪生体**，整合所有心理健康相关数据。

#### 档案架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    学生心理孪生档案                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 基础信息层                                                │   │
│  │  ├─ 学生基本信息 (姓名、学号、班级、联系方式)              │   │
│  │  ├─ 人口统计学特征 (性别、年龄、民族、家庭背景)            │   │
│  │  └─ 入学评估数据 (MBTI、初始心理测评)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 心理画像层 (PsychProfile)                                │   │
│  │  ├─ 8维度心理特质评估                                      │   │
│  │  │   • 逆境商数 (Adversity Quotient)                       │   │
│  │  │   • 情绪稳定性 (Emotional Stability)                    │   │
│  │  │   • 社交倾向 (Social Tendency)                          │   │
│  │  │   • 抗压能力 (Stress Resistance)                        │   │
│  │  │   • 自我觉察 (Self Awareness)                           │   │
│  │  │   • 同理心 (Empathy)                                    │   │
│  │  │   • 意志力 (Willpower)                                  │   │
│  │  │   • 适应性 (Adaptability)                               │   │
│  │  └─ 综合心理健康评分 (0-100)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 时间线层 (Timeline)                                       │   │
│  │  ├─ 生命周期事件                                            │   │
│  │  │   • 入学适应期 → 期中压力期 → 期末冲刺期 → 假期调整期    │   │
│  │  │   • 预警事件 (时间、类型、处理结果)                      │   │
│  │  │   • 干预记录 (干预措施、效果评估)                        │   │
│  │  └─ VR 疗愈记录                                            │   │
│  │      • 使用场景、时长、生理指标变化                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 实时数据层                                                │   │
│  │  ├─ 最新多模态数据快照                                      │   │
│  │  ├─ 风险等级动态评估 (LOW / MEDIUM / HIGH / CRITICAL)      │   │
│  │  └─ 当前状态标签 (平静、焦虑、抑郁、兴奋等)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 核心能力

- **360° 视图**: 一页展示学生的完整心理健康画像
- **趋势分析**: 时间线展示心理指标变化趋势
- **风险预警**: 自动识别异常模式，触发预警
- **干预追踪**: 记录每次干预措施及效果评估

---

### 📅 设备与预约管理

支持学生通过 **Pocket 小程序** 在线预约心理咨询服务，并在 Sentinel 中与线下疗愈空间、VR 设备、传感器设备状态统一管理。近期已将原“线上预约管理”和“线下设备管理”合并为 `/device-appointments` 统一页面。

#### 统一工作台

```
┌─────────────────────────────────────────────────────────────────┐
│                      设备与预约管理                              │
├─────────────────────────────────────────────────────────────────┤
│  顶部切换: [ 线上预约 ] [ 线下设备 ]                              │
│                                                                  │
│  线上预约视图                                                     │
│  • 预约申请 / 咨询师确认 / 咨询室排期 / 学生通知                   │
│                                                                  │
│  线下设备视图                                                     │
│  • VR 设备 / 摄像头 / 生理传感器 / 咨询室硬件状态                  │
│                                                                  │
│  老入口兼容                                                       │
│  • /consultation-room -> /device-appointments?tab=appointments   │
│  • /device-management -> /device-appointments?tab=devices        │
└─────────────────────────────────────────────────────────────────┘
```

#### 业务流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      线上预约业务流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  学生端 (Pocket 小程序)              咨询师端 (Sentinel)         │
│                                                                  │
│  ┌──────────────────────────┐        ┌──────────────────────┐   │
│  │ 1. 浏览咨询师列表         │        │                      │   │
│  │    • 查看咨询师简介       │        │                      │   │
│  │    • 查看擅长领域         │        │                      │   │
│  │    • 查看可预约时段       │        │                      │   │
│  └───────────┬──────────────┘        │                      │   │
│              ▼                        │                      │   │
│  ┌──────────────────────────┐        │                      │   │
│  │ 2. 选择时段提交预约       │───────►│ 3. 收到预约通知        │   │
│  │    POST /appointments     │        │    • 系统通知          │   │
│  │                           │        │    • 短信提醒          │   │
│  └───────────┬──────────────┘        └──────────┬───────────┘   │
│              ▼                                  ▼                │
│  ┌──────────────────────────┐        ┌──────────────────────┐   │
│  │ 4. 等待确认              │        │ 5. 咨询师确认/拒绝    │   │
│  │    状态: PENDING         │◄───────│    PATCH /:id        │   │
│  └───────────┬──────────────┘        └──────────┬───────────┘   │
│              ▼                                  ▼                │
│  ┌──────────────────────────┐        ┌──────────────────────┐   │
│  │ 6. 收到确认通知          │◄───────│ 7. 系统自动通知学生   │   │
│  │    • 微信推送             │        │    (确认/拒绝)        │   │
│  │    • 短信提醒             │        │                      │   │
│  └───────────┬──────────────┘        └──────────────────────┘   │
│              ▼                                                   │
│  ┌──────────────────────────┐                                    │
│  │ 8. 咨询当天               │                                    │
│  │    • 智能提醒 (提前30分钟)│                                    │
│  │    • 扫码签到             │                                    │
│  │    • VR 设备自动准备      │                                    │
│  └──────────────────────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 功能特性

- **咨询师管理**: 维护咨询师档案、擅长领域、排班表
- **智能排班**: 自动避开咨询师已预约时段
- **多渠道通知**: 系统消息 + 短信 + 微信推送
- **设备联动**: 预约成功后自动预留对应疗愈空间设备
- **统一入口**: 预约和设备两个高相似页面共用同一页面框架，减少导航层级和重复维护
- **旧路由兼容**: 原咨询室和设备管理路由保留重定向，避免旧链接失效
- **缓存刷新同步**: 预约和设备相关 Server Action 的 `revalidatePath` 已指向合并后的新页面

---

### 📊 全周期追踪

基于 **时间线 (Timeline)** 模型，记录学生从入学到毕业的心理健康全生命周期。

#### 追踪维度

```
┌─────────────────────────────────────────────────────────────────┐
│                      心理健康全周期追踪                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  时间轴 ──────────────────────────────────────────────────────►  │
│                                                                  │
│  入学        期中         期末        假期        毕业           │
│   │           │           │           │           │             │
│   ▼           ▼           ▼           ▼           ▼             │
│  ┌─┐         ┌─┐         ┌─┐         ┌─┐         ┌─┐          │
│  │初│        │期│        │期│        │调│        │离│          │
│  │始│   →    │中│   →    │末│   →    │整│   →    │校│          │
│  │评│        │压│        │冲│        │期│        │评│          │
│  │估│        │力│        │刺│        │  │        │估│          │
│  └─┘         └─┘         └─┘         └─┘         └─┘          │
│                                                                  │
│  追踪内容:                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • 定期心理测评 (PHQ-9、GAD-7 等量表)                      │   │
│  │ • 多模态数据基线建立                                      │   │
│  │ • 重大生活事件记录 (恋爱、挂科、家庭变故)                  │   │
│  │ • 预警事件及干预记录                                      │   │
│  │ • VR 疗愈使用记录与效果评估                               │   │
│  │ • 心理咨询历史                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  分析能力:                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • 个体趋势分析: 同一人不同时间点对比                      │   │
│  │ • 群体对比分析: 与班级/年级平均水平对比                    │   │
│  │ • 风险预测: 基于历史数据预测未来风险                      │   │
│  │ • 干预效果评估: 量化干预措施的有效性                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 可视化展示

- **时间线视图**: 垂直时间轴展示所有关键事件
- **趋势图表**: 心理评分、压力指数等指标的变化曲线
- **热力图**: 展示情绪波动的时间分布
- **对比视图**: 与同龄人平均水平对比

---

### 🛠️ 工程化与数据治理

近期更新补齐了多人协作和演示部署中的基础工程能力：

#### ESLint 工程化配置

- 使用 ESLint 9 flat config，并接入 `eslint-config-next/core-web-vitals` 与 TypeScript 规则
- `npm run lint` 可直接执行，默认忽略 `.next/`、`node_modules/`、`prisma/backups/`、`uploads/` 等生成或运行目录
- 对 `any`、`require`、React Hooks 静态规则等先降级为 warning，便于在不中断开发的前提下逐步收敛质量问题

#### 非破坏性增量种子

```bash
npm run seed:incremental
npm run seed:incremental -- --dry-run
```

- 使用稳定唯一键和 Prisma `upsert` 注入 OpenClaw Agents、宠物日记模板等核心数据
- 不执行 `deleteMany`、`TRUNCATE`、`DROP`，不会清空本地已有业务记录
- 适合团队成员 pull 新迁移后补齐基础数据

#### 宠物系统运行表

宠物运行态依赖以下表：

- `pets`
- `pet_events`
- `pet_items`
- `pet_diary_entries`
- `pet_alerts`
- `scene_items`

对应迁移为 `prisma/migrations/20260629000000_add_pet_system_tables/migration.sql`。如果应用提示 `public.pets does not exist`，说明当前连接数据库尚未应用该迁移。

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│               PsyTwin Sentinel校园心理健康后台管理系统 系统架构      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   前端层 (Next.js 16)                                           │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • 实时多模态直播舱                                       │   │
│   │  • 学生孪生档案                                           │   │
│   │  • 预警中心                                               │   │
│   │  • 设备与预约管理                                         │   │
│   │  • 心图·AI助手 / LightRAG 知识库                           │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │ REST / SSE                       │
│   API 层 (Next.js API)       ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  /api/multimodal/*  - 多模态数据接口                      │   │
│   │  /api/pocket/*      - 小程序接口                          │   │
│   │  /api/openclaw/*    - AI 编排与 RAG 增强接口                │   │
│   │  /api/students/*    - 学生管理接口                        │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │ Prisma ORM                       │
│   数据层                      ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  PostgreSQL  (关系型数据)                                │   │
│   │  Redis       (缓存 / 消息队列)                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   外部服务                                                       │
│   ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│   │ PsyTwin-Companion│  │   PsyTwin Claw    │  │   LightRAG     │  │
│   │ WebSocket-Server │  │   AI 编排中心    │  │  知识库服务     │  │
│   └─────────────────┘  └─────────────────┘  └────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | Next.js | 16.1.6 | App Router, SSR/SSG |
| **UI 库** | React | 19.2.4 | 组件化开发 |
| **样式** | Tailwind CSS | 4.2.0 | 原子化 CSS |
| **组件库** | shadcn/ui | - | Radix UI 封装 |
| **图表** | Recharts | 2.15.0 | 数据可视化 |
| **ORM** | Prisma | 6.19.2 | 数据库操作 |
| **数据库** | PostgreSQL | 15+ | 主数据库 |
| **缓存** | Redis | 7+ | 缓存 / PubSub |
| **实时通信** | SSE | - | 服务端推送 |
| **知识库** | LightRAG | 外部服务 | 文档管理、知识图谱、RAG 检索 |
| **质量检查** | ESLint | 9.x | Next.js + TypeScript 静态检查 |

---

## API 接口

### Sentinel 内部 API

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/multimodal/students` | GET | 获取学生多模态数据列表 |
| `/api/multimodal/sensors/stream` | GET | SSE 实时数据流订阅 |
| `/api/students/[id]/profile` | GET/PUT | 学生心理档案 |
| `/api/students/[id]/timeline` | GET/POST | 学生时间线事件 |
| `/api/warnings` | GET/POST | 预警记录管理 |
| `/api/interventions` | GET/POST | 干预记录管理 |
| `/api/appointments` | GET/POST | 预约管理 |
| `/api/devices` | GET/POST | 设备管理 |
| `/api/openclaw/agent-chat` | POST | OpenClaw AI 对话，自动附加 LightRAG 上下文 |
| `/api/openclaw/status` | GET | OpenClaw 连接状态 |
| `/api/openclaw/stats` | GET | OpenClaw 请求与 Agent 统计 |
| `/api/admin/pet-alerts` | GET/POST | 宠物系统预警管理 |

### Pocket 小程序 API

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/pocket/auth/login` | POST | 学生登录 |
| `/api/pocket/student/home/feed` | GET | 首页动态流 |
| `/api/pocket/student/my/notifications` | GET | 通知列表 |
| `/api/pocket/student/my/notifications/:id/read` | PUT | 标记已读 |
| `/api/pocket/consultation/teachers` | GET | 咨询师列表 |
| `/api/pocket/consultation/appointments` | POST | 创建预约 |
| `/api/pocket/consultation/appointments/:id` | PATCH | 更新预约状态 |

详细文档: [API 契约文档](./docs/api_contract.md)

---

## 快速开始

### 环境要求

- **Node.js**: 18+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Docker**: (可选，用于部署)

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/XingjianTian/PsyTwin-Sentinel.git
cd PsyTwin-Sentinel

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接、OpenClaw Gateway、LightRAG 服务地址等

# 4. 数据库迁移
npx prisma migrate dev

# 5. 生成 Prisma Client
npx prisma generate

# 6. 填充测试数据 (可选，完整重建演示数据)
npx prisma db seed

# 7. 非破坏性补齐核心数据 (推荐，适合 pull 新迁移后执行)
npm run seed:incremental

# 8. 运行基础质量检查
npm run lint

# 9. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Reachy Mini 心宠调试（Windows Host Bridge）

Sentinel 只通过服务端访问 ClawBody 和 Windows Host Bridge；浏览器只调用 Sentinel 同源 API。将下列配置分别写入两个仓库的本地 `.env`，不要提交密钥：

```dotenv
# clawbody-minimax/.env
SERVICE_API_KEY="<clawbody-service-key>"
HOST_BRIDGE_API_KEY="<host-bridge-key>"

# PsyTwin-Sentinel/.env
CLAWBODY_SERVICE_URL="http://127.0.0.1:7860"
CLAWBODY_SERVICE_KEY="<clawbody-service-key>"
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="<host-bridge-key>"
```

`CLAWBODY_SERVICE_KEY` 必须与 ClawBody 的 `SERVICE_API_KEY` 相同，Sentinel 与 ClawBody 两侧的 `HOST_BRIDGE_API_KEY` 也必须相同。这两组密钥都是服务端机密，禁止改成 `NEXT_PUBLIC_*` 变量或传入浏览器。`7860` 是 Sentinel 访问的 ClawBody 内部服务端口，`7861` 是只监听 Windows 回环地址的 Host Bridge 端口；不要将 Host Bridge 发布到局域网或公网。

在 Windows 10/11 上，先按 ClawBody 仓库 README 完成 `.venv`、Reachy Mini SDK 和 `.env` 配置。然后仅需在 ClawBody 仓库根目录安装一次当前用户的隐藏登录任务：

```powershell
.\.venv\Scripts\Activate.ps1
clawbody-host install
clawbody-host restart
clawbody-host status
```

`install` 创建或更新固定任务 `PsyTwin ClawBody Host Bridge`；`restart` 用于安装后立即启动，否则它会在下次登录时启动；`status` 查看任务状态。不要同时运行计划任务实例和前台 `clawbody-host-bridge`。更完整的安装、前台诊断与卸载说明以 ClawBody 仓库 README 为准。

日常使用前必须完全退出 Reachy Mini Control，避免它占用 USB 串口或 `8000` daemon 端口。本地设备启动不需要 VPN；学生在线对话仍需要 ClawBody 中已配置的阿里云和百度服务。日常流程为：

```text
启动 Docker → 打开 Sentinel → 心宠调试 → 启动设备
```

1. 启动 Docker Desktop，在 ClawBody 仓库运行 `docker compose up -d`，用 `docker compose ps` 确认 `clawbody-service` 正常。
2. 如需确认 Host Bridge，在 ClawBody 仓库运行 `clawbody-host status`；任务未运行时使用 `clawbody-host restart`。
3. 启动 Sentinel 并打开 `/pet-ai-management`，切换到“心宠调试”，选择检测到的 USB 设备后点击“启动设备”。

以下命令只读取任务、服务、设备状态和 USB 发现结果，不会启动 daemon 或移动机器人：

```powershell
.\.venv\Scripts\Activate.ps1
clawbody-host status
Invoke-RestMethod http://127.0.0.1:7861/health
$hostBridgeKey = Read-Host "HOST_BRIDGE_API_KEY"
$headers = @{"X-Host-Bridge-Key"=$hostBridgeKey}
Invoke-RestMethod http://127.0.0.1:7861/v1/device/status -Headers $headers
Invoke-RestMethod http://127.0.0.1:7861/v1/device/discover -Headers $headers
```

摄像头预览只在用户点击“打开摄像头预览”后请求浏览器权限，并优先选择名称包含 `Reachy` 或 `Mini` 的视频设备。Sentinel 不会为了预览自动释放 daemon 媒体；权限被拒绝、设备未识别或摄像头被 daemon/其他程序占用时，页面只显示媒体警告，不会将设备标记为离线，也不影响电机、扬声器或麦克风控制。关闭预览会停止浏览器获取的所有视频轨道。

| 现象 | 处理 |
|------|------|
| “心宠设备控制桥未运行” | 在 ClawBody 仓库执行 `clawbody-host status`，必要时执行 `clawbody-host restart`，再用 `/health` 只读检查。 |
| Host Bridge 返回 `401` 或 Sentinel 显示设备请求失败 | 确认 Sentinel 和 ClawBody 的 `HOST_BRIDGE_API_KEY` 完全一致，修改后重启对应服务；不要将密钥放入 URL、日志或前端变量。 |
| 未发现 Reachy Mini Lite USB | 确认 Reachy Mini Control 已退出，检查电源、USB 数据线、Windows 设备管理器和串口驱动；有多个候选串口时在页面明确选择。 |
| daemon 启动失败或 `8000` 端口冲突 | 退出 Reachy Mini Control 和单独启动的 daemon，查看“心宠调试”日志后重试。Host Bridge 只管理它启动的 daemon，不会代理任意命令或强制终止不明进程。 |
| Docker/ClawBody 未连接 | USB、daemon 和基础硬件调试仍可用；学生会话入口保持不可用。检查 `docker compose ps`、`http://127.0.0.1:7860/health` 以及 `SERVICE_API_KEY`/`CLAWBODY_SERVICE_KEY` 是否匹配。 |
| 摄像头预览受阻 | 允许浏览器摄像头权限，或关闭正在占用该摄像头的程序。这是可独立降级的媒体状态，无需停止设备。 |

Sentinel 设备 API 只接受预定义的发现、启停、重启、动作、姿态和音量命令，不接收 shell 命令、可执行文件路径或任意上游 URL。设备启动链路本身不访问 Hugging Face、GitHub、OpenAI 或应用商店。

### LightRAG 知识库配置

如果需要启用“心理学知识库”页面和 OpenClaw RAG 上下文增强，请确认 `.env` 中包含：

```env
NEXT_PUBLIC_LIGHTRAG_WEBUI_URL="http://42.121.14.189:9621"
LIGHTRAG_API_URL="http://42.121.14.189:9621"
NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT="psytwin-local-rag-key"
```

本地自建 LightRAG 时，通常将上述地址改为 `http://localhost:9621`。LightRAG 的部署、阿里云百炼模型配置和知识库迁移流程见 [LightRAG 迁移部署教程](./docs/LIGHTRAG_MIGRATION_DEPLOYMENT_GUIDE.md)。

### Docker 部署

```bash
# 一键启动完整环境
docker-compose up -d
```

### 完整生态启动（多仓库）

如需启动整个 PsyTwin 生态（Sentinel + Companion + Pocket），请按以下顺序：

```bash
# 1. 克隆所有仓库（假设在同一目录）
cd /Users/txj/Projects/PsyTwin

# 2. 启动 Companion (WebSocket Server)
cd PsyTwin-Companion/WebSocket-Server
docker-compose up -d
# 或本地: npm run dev

# 3. 启动 Sentinel (本仓库)
cd ../PsyTwin-Sentinel
npm install
npx prisma migrate dev
npm run dev

# 4. 启动 Pocket (微信小程序)
cd ../PsyTwin-Pocket
# 使用微信开发者工具导入项目
# 或 npm run dev (如使用 Taro 等跨端框架)

# 5. 启动 Claw / OpenClaw (AI 网关)
cd ../PsyTwin-OpenClaw
python -m openclaw.gateway
```

**依赖关系**:
- Companion 依赖: PostgreSQL, Redis
- Sentinel 依赖: PostgreSQL, Redis, Companion (可选), LightRAG (可选)
- Pocket 依赖: Sentinel API
- Claw / OpenClaw 依赖: Gateway 运行时；需要知识库增强时依赖 LightRAG

---

## 项目结构

```
PsyTwin-Sentinel/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # 仪表盘路由组
│   │   ├── multimodal/           # 多模态数据流监控
│   │   ├── device-appointments/  # 设备与预约统一管理
│   │   ├── students/             # 学生档案管理
│   │   ├── warnings/             # 预警中心
│   │   ├── interventions/        # 干预记录
│   │   └── ai-config/            # 心图·AI助手与知识库配置
│   ├── api/                      # API 路由
│   │   ├── multimodal/           # 多模态数据 API
│   │   ├── pocket/               # 小程序 API
│   │   │   └── student/          # 学生端 API
│   │   │       └── my/
│   │   │           └── notifications/
│   │   ├── openclaw/             # AI 编排与 RAG 增强 API
│   │   ├── appointments/         # 预约 API
│   │   ├── devices/              # 设备 API
│   │   └── students/             # 学生管理 API
│   └── layout.tsx                # 根布局
├── components/
│   ├── ui/                       # shadcn/ui 组件
│   └── views/                    # 业务视图组件
│       ├── multimodal-dataflow-view.tsx
│       ├── device-appointment-management-view.tsx
│       ├── student-profile-view.tsx
│       └── ...
├── lib/                          # 工具函数
│   ├── prisma.ts                 # Prisma 客户端
│   ├── api-response.ts           # API 响应工具
│   ├── openclaw/                 # OpenClaw Gateway 与 RAG 上下文
│   └── pocket-auth.ts            # 小程序认证
├── prisma/
│   ├── schema.prisma            # 数据库模型定义
│   ├── seed.ts                  # 完整种子数据
│   ├── seed/                    # 增量核心数据脚本
│   └── migrations/              # 迁移文件
├── docs/                         # 项目文档
│   ├── CHANGELOG.md             # 变更日志
│   ├── PRD.md                   # 产品需求文档
│   ├── LIGHTRAG_INTEGRATION.md  # LightRAG 集成说明
│   ├── LIGHTRAG_MIGRATION_DEPLOYMENT_GUIDE.md
│   ├── api_contract.md          # API 契约
│   └── OPENCLAW_AGENT_IMPLEMENTATION.md
├── eslint.config.mjs             # ESLint 9 flat config
└── public/                       # 静态资源
```

---

## 文档索引

### 本仓库文档

- **[产品需求文档 (PRD)](./docs/PRD.md)** - 系统设计和功能规格
- **[API 契约文档](./docs/api_contract.md)** - 前后端 API 规范 (Pocket 端)
- **[OpenClaw 集成文档](./docs/OPENCLAW_AGENT_IMPLEMENTATION.md)** - AI 编排中心集成指南
- **[LightRAG 集成说明](./docs/LIGHTRAG_INTEGRATION.md)** - 心理学知识库页面、模型配置、验证命令和常见问题
- **[LightRAG 迁移部署教程](./docs/LIGHTRAG_MIGRATION_DEPLOYMENT_GUIDE.md)** - 从零部署 PsyTwin 定制版 LightRAG 与迁移知识库
- **[技术规范文档](./docs/PsyTwin%20Sentinel%20技术规范文档.md)** - 编码规范和架构决策
- **[Prisma 数据库迁移说明](./prisma/README.md)** - 迁移、增量种子和宠物系统表说明
- **[变更日志](./docs/CHANGELOG.md)** - 版本更新记录

### 子项目文档

- **[PsyTwin-Pocket README](https://github.com/XingjianTian/PsyTwin-Pocket/blob/main/README.md)** - 小程序端完整文档
  - 心墙瀑布流架构
  - AI 心理咨询流程
  - 学生心理画像模型
  - 线上预约系统设计
- **[PsyTwin-Companion README](https://github.com/XingjianTian/PsyTwin-Companion/blob/main/README.md)** - VR 终端文档
  - WebSocket Server 架构
  - 百度 ASR/TTS 集成
  - 多模态数据采集流程
  - Docker 部署指南
- **[PsyTwin-Claw README](https://github.com/XingjianTian/PsyTwin-OpenClaw/blob/main/README.md)** - AI 编排中心文档
  - Agent 设计规范
  - 多 Agent 协作机制
  - 工具调用协议

---

## 开发规范

- **代码风格**: ESLint + Prettier
- **提交规范**: [Conventional Commits](https://www.conventionalcommits.org/)
- **分支策略**: Git Flow (main / develop / feature/*)
- **变更日志**: 手动维护 `[Unreleased]` + 自动生成历史版本

---

## 贡献者

- **田老师** - 项目架构师与后端开发
- **学生团队** - 前端开发与测试

---

## 许可证

[MIT License](./LICENSE)

---

<p align="center">
  <strong>PsyTwin</strong> - 守护每一颗心灵 💚
</p>
