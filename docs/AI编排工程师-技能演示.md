# AI编排工程师 - 技能演示

> PsyTwin VR 校园心理健康数字孪生解决方案
> 展示时长：10-12 分钟

---

## 零、准备工作（老师的电脑已完成）

**设置快捷命令：**
```bash

# Docker Sentinel 的 openclaw
alias psytwinclaw="docker exec -w /home/node/.openclaw/workspace openclaw-gateway openclaw"
```

写入配置文件永久保存：

```bash
echo 'alias psytwinclaw="docker exec -w /home/node/.openclaw/workspace openclaw-gateway openclaw"' >> ~/.zshrc && source ~/.zshrc
```

**命令说明：**
- `psytwinclaw` — Docker Sentinel 容器内的 OpenClaw

---

## 一、整体介绍（1 分钟）

**（开场，鞠躬）**

"大家好，我是项目的 AI 工程师，我负责构筑心图项目的AI大脑。我们以OpenClaw为基础进行了定制化二次开发，核心内容包括构建RAG 知识库、设计多智能体角色和协作框架以及集成开发可视化的AI编排流程。今天我来演示这几个核心技能操作。"

**（指向架构图）**

首先，我们的AI模型会部署在本地，OpenClaw部署在Docker里，最大限度保护心理健康隐私数据，那么要解决的第一个问题就是AI主脑的RAG向量知识库的构建，这里我们使用OpenClaw的衍生向量库工具QMD来实现记忆搜索，先让我使用自定义别名来进入Docker内的Claw实例

---

## 二、第一幕：RAG 向量知识库

> 一句话：RAG 让 AI 回答有据可查，专业可信。

### 技能演示：查看与配置 memory 参数，蓝色的命令行不打，直接改配置文件

| 操作 | 讲解 |
| --- | --- |
| 执行 `psytwinclaw memory status` | "查看 memory 状态：backend 是 qmd，已启用 Gemini embedding，已索引多条记忆" |
| #执行 `psytwinclaw config get memory`<br>直接编辑文件改配置，解释配置含义 | "查看 memory 配置：backend=sqlite、qmd 路径、citations=auto 开启引用" |
| #执行 `psytwinclaw config get agents.defaults.memorySearch`<br>直接编辑文件改配置，解释配置含义 | "查看向量搜索配置：provider=gemini、model=gemini-embedding-001、启用缓存" |
| 执行 `psytwinclaw config get memory.qmd.update` | "查看索引更新策略：interval=5m 每5分钟更新、debounceMs=15000 防抖" |
| 执行 `psytwinclaw memory status` 确认变更 | "确认变更——已生效" |

### 测试演示：RAG 搜索验证

| 操作 | 讲解 |
| --- | --- |
| 打开 Sentinel → RAG 向量知识库页面 | "现在验证配置效果——这是 RAG 可视化页面" |
| 指向左侧状态栏 | "大家看：状态正常，backend=qmd、provider=Gemini、索引就绪" |
| 在右侧搜索框输入"心理咨询" | "输入心理学生常见问题" |
| 点击搜索 | "结果返回专业回答，并标注参考来源" |
| 指向引用标注 | "每个结论都链接到原始知识库——这就是 RAG 的价值" |

---

好的，我们已经完成了主脑RAG向量知识库的构建，现在让我们来解决第二个问题，那就是多智能体的编排。由于PsyTwin Claw在我们的每个系统都有参与，涉及到不同的工作场景。
例如在web管理系统中我们需要专精数据清洗、数据隐私保护等技能的DBA智能体，在微信小程序AI咨询窗口我们需要专精陪伴与聊天的咨询师智能体，等等；
因此我们需要对不同的场景做出不同的子智能体编排，让他们分工合作，这样便可以压缩上下文，针对性配置MCP和Skills，更好地完成更复杂的任务，同时还节省了token成本。

接下来我就演示第二个核心技能操作。在我们的web管理系统，可以进行基础智能体Prompt的编排，并以配置文件形式存储和一键热更新到Docker里的Claw实例。
（打开web管理系统，操作模型与策略编排页面，点击保存按钮，然后点击一键热更新按钮）

接下来我们进入docker里的claw实例，进行多智能体的编排

## 三、第二幕：多 Agent 协作


### 技能演示：查看与配置 agents 参数

| 操作 | 讲解 |
| --- | --- |
| 执行 `psytwinclaw config get agents.list` | "查看 6 个 Agent 列表：main、Collector、Therapist、Analyst、DBA、Relayer" |
| #执行 `psytwinclaw config get agents.list[3]`<br>改写配置内容，讲解属性含义 | "查看 Analyst 配置：maxTokens=1500、分析维度=情绪/压力/风险" |
| 执行 `psytwinclaw config get agents.list[2]` 确认变更 | "确认变更——温度已更新为 0.75" |

### 技能演示：编排MCP与Skills

可以看到我们的智能体已经初步完成角色与Prompt设计，接下来让我们进入Claw控制端，进行针对性的MCP与Skills编排

**打开locolhost:18789**
**（给主智能体添加几个skills）**


好，这样我们就完成了多智能体的策略、技能与编排设计，接下来让我们验证全链路的AI实践，

### 测试演示：任务分配验证

| 操作 | 讲解 |
| --- | --- |
| 切换到 Sentinel → OpenClaw 编排页面 | "现在验证配置效果——这是可视化编排界面" |
| 指向架构图 | "6 个 Agent 各司其职，main 是总调度" |
| 指向右下角任务分配框 | "右下角是任务分配框，我们输入任务" |
| 输入任务 | "'针对本月心理状况异常学生，在小程序端发送温馨提示通知'" |
| 点击发送 | "点击发送——任务发给首席数据官 main" |
| 指向活动日志 | "活动日志显示——任务开始在多个 Agent 之间流转" |
| 指向日志内容 | "Collector 采集数据 → Analyst 分析异常 → Therapist 生成温馨提示 → 推送小程序" |
| 打开微信小程序预览 | "小程序已收到温馨提示通知" |
| 指向屏幕 | "这就是多 Agent 协作——一个任务自动分解、并行处理、结果汇总" |

---

## 四、结尾

**（鞠躬）**

"感谢各位评委老师，这就是 我作为AI 编排工程师的核心技能演示感谢各位老师！"

---

## 附录：核心配置速览

### RAG 配置

```bash
psytwinclaw memory status
psytwinclaw config get memory
psytwinclaw config get agents.defaults.memorySearch
```

```json
"memory": {
  "backend": "qmd",
  "qmd": {
    "provider": "gemini",
    "model": "gemini-embedding-001"
  }
}
```

### Multi-Agent 配置

```bash
psytwinclaw config get agents.defaults
psytwinclaw config get agents.list
```

```json
"agents": {
  "defaults": {
    "model": "minimax/MiniMax-M2.7-highspeed",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "list": [
    { "id": "main", "default": true, "subagents": { "allowAgents": ["Collector", "Therapist", "Analyst"] } },
    { "id": "Therapist", "temperature": 0.7, "maxTokens": 2000 },
    { "id": "Analyst", "maxTokens": 1500 },
    { "id": "Collector" },
    { "id": "DBA" },
    { "id": "Relayer" }
  ]
}
```

### 安全边界配置

```json
"Therapist": {
  "identity": {
    "theme": "始终以共情开场。检测到危机关键词立即预警，禁止提供用药建议。"
  },
  "compaction": { "mode": "safeguard" }
}
```

---

## 注意事项

1. **时间控制**：整体介绍 1 分钟、RAG 4-5 分钟、Multi-Agent 5-6 分钟、结尾 1 分钟
2. **技能演示**：终端命令要熟练，边敲边解释参数意义
3. **测试演示**：提前准备好转场问题（焦虑症、考试焦虑）和小程序预览
4. **流程测试**：提前测试 Multi-Agent 任务流转，确保活动日志清晰可见
5. **重点突出**：技能演示展示"会配置"，测试演示展示"配置有效"
