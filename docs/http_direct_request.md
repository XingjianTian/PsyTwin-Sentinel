# HTTP Direct Agent Request 功能实现计划

## 功能概述
在"智能体集群"页面添加交互式对话框，用户可点击地图上的 Agent 小人选择对应 Agent，直接发送 HTTP 请求进行对话。

## 界面布局变更

### 当前布局
```
[左侧: 智能体地图网格 (xl:col-span-2)]  [右侧: 活动记录面板]
```

### 新布局
```
[左侧: 智能体地图网格 (xl:col-span-2)]  [右侧: 活动记录 + Agent 对话框]
                                         [上方: 活动日志 (缩小高度) ]
                                         [下方: Agent 对话面板 ]
```

## 组件变更

### 1. OpenClawOrchestrationView.tsx
**变更:**
- 移除"请求流转" Tab
- 右侧面板改为上下两部分布局
- 上方：LivePanel（活动日志）高度缩小为 40%
- 下方：新增 AgentChatPanel 组件（高度 60%）

### 2. LivePanel.tsx
**变更:**
- 移除 Tabs 组件（去掉"请求流转"）
- 只保留"活动日志"内容
- 高度自适应父容器

### 3. AgentGridLabel.tsx
**变更:**
- 添加 `onClick` 事件，点击 Agent 卡片时触发选择
- 使用 EventBus 或直接 props 传递选中状态

### 4. 新增: AgentChatPanel.tsx
**功能:**
- 显示当前选中的 Agent 信息（头像、名称、角色描述）
- 文本输入框
- 发送按钮
- HTTP 请求发送逻辑

**数据结构:**
```typescript
interface AgentChatPanelProps {
  selectedAgent: AgentGridItem | null
  onSendMessage: (agentId: string, message: string) => Promise<void>
}
```

### 5. 新增: Agent 描述配置
在 `agents.config.ts` 中添加每个 Agent 的详细描述：
```typescript
export const AGENT_DESCRIPTIONS: Record<string, string> = {
  main: "首席数据官 - 协调全局，统筹所有子系统",
  Collector: "采集员 - 负责监控 VR 与手环的多模态原始流",
  Therapist: "咨询师 - 生成 VR 干预策略与孪生体交互",
  Relayer: "中继工程师 - 执行边缘降噪与协议转换",
  DBA: "数据哨兵 - 负责数据对齐与入库",
  Analyst: "分析师 - 调用模型提取焦虑与压力特征"
}
```

## HTTP API 实现

### 请求格式
```typescript
async function sendAgentRequest(agentId: string, message: string) {
  const response = await fetch('http://localhost:18789/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 123456',
      'Content-Type': 'application/json',
      'x-openclaw-agent-id': agentId
    },
    body: JSON.stringify({
      model: `openclaw:${agentId}`,
      input: message
    })
  })
  return response.json()
}
```

### 状态管理
- 使用 React useState 管理选中的 Agent
- 使用 useState 管理加载状态
- 发送成功后清空输入框，不保留消息历史（通过活动日志查看）

## 交互流程

### 1. Agent 选择
```
用户点击地图上的 Agent 小人
  ↓
AgentGridLabel 触发 onAgentSelect(agent)
  ↓
OpenClawOrchestrationView 更新 selectedAgent 状态
  ↓
AgentChatPanel 显示对应的 Agent 信息
```

### 2. 消息发送
```
用户在输入框输入文本
  ↓
点击发送按钮
  ↓
调用 sendAgentRequest(selectedAgent.id, message)
  ↓
显示加载状态
  ↓
发送成功，清空输入框
  ↓
活动日志自动更新（通过现有 WebSocket）
```

## 样式设计

### AgentChatPanel 布局（简化版，无消息历史）
```
┌─────────────────────────────────────┐
│ [头像]  Agent名称                   │  ← 头部信息区
│         角色描述...                 │
├─────────────────────────────────────┤
│ [输入框                     ] [发送]│  ← 输入区
└─────────────────────────────────────┘
```

### 样式规范
- 背景：与活动面板一致（bg-card）
- 边框：border-border
- Agent 头像：64×64px，圆形，带发光边框
- 输入框：多行 textarea，最大高度限制
- 发送按钮：主色渐变，圆角
- 输入框默认提示："点击上方 Agent 小人选择对话对象"

## 文件清单

### 修改文件
1. `components/ai-config/openclaw-orchestration-view.tsx` - 调整布局
2. `components/ai-config/live-panel.tsx` - 移除 Tab，简化布局
3. `components/ai-config/agent-grid-label.tsx` - 添加点击事件
4. `lib/openclaw/agents.config.ts` - 添加描述配置

### 新增文件
1. `components/ai-config/agent-chat-panel.tsx` - 聊天面板组件
2. `lib/openclaw/agent-chat.ts` - HTTP 请求逻辑

## 实现步骤

### Step 1: 基础配置
- [ ] 在 agents.config.ts 添加 AGENT_DESCRIPTIONS
- [ ] 创建 agent-chat.ts 工具函数

### Step 2: 组件开发
- [ ] 创建 AgentChatPanel.tsx 基础结构
- [ ] 实现 Agent 信息展示
- [ ] 实现输入框和发送按钮
- [ ] 实现 HTTP 请求逻辑

### Step 3: 布局调整
- [ ] 修改 LivePanel.tsx 移除 Tab
- [ ] 修改 OpenClawOrchestrationView.tsx 新布局
- [ ] 修改 AgentGridLabel.tsx 添加点击事件

### Step 4: 联调测试
- [ ] 测试 Agent 选择
- [ ] 测试消息发送
- [ ] 测试活动日志更新

## 注意事项

1. **HTTP 请求跨域**: 确保 Gateway CORS 配置允许 localhost:3000
2. **错误处理**: 网络错误时显示友好提示
3. **加载状态**: 发送请求时禁用输入框，显示 loading
4. **状态持久**: 切换 Tab 后保持选中状态
5. **无消息历史**: 发送成功即清空输入，通过活动日志查看结果

## 扩展可能

- 快捷指令按钮（预设常用命令）
- Agent 间切换快速对话
- 流式响应显示（SSE）
