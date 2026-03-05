/**
 * Qwen (通义千问) AI 客户端封装
 * 基于阿里云 Dashscope SDK
 * 
 * 环境变量:
 * - DASHSCOPE_API_KEY: 阿里云 Dashscope API Key
 * 
 * @see https://help.aliyun.com/zh/dashscope/
 */

import { OpenAI } from 'openai';

// 使用 OpenAI 兼容模式调用 Dashscope
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-turbo';

// 创建 OpenAI 兼容客户端
function createClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  
  if (!apiKey) {
    console.warn('[AI] DASHSCOPE_API_KEY not set, AI features will be disabled');
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });
}

// 全局客户端实例
const client = createClient();

/**
 * AI 调用配置选项
 */
export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * AI 响应结果
 */
export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * 调用 Qwen 模型进行对话
 * 
 * @param messages 对话消息列表
 * @param options 配置选项
 * @returns AI 响应结果
 */
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: AIOptions = {}
): Promise<AIResponse> {
  if (!client) {
    return {
      content: '',
      error: 'AI client not initialized. Please set DASHSCOPE_API_KEY.',
    };
  }

  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
    systemPrompt,
  } = options;

  try {
    // 如果有系统提示词，添加到消息列表开头
    const fullMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    const response = await client.chat.completions.create({
      model,
      messages: fullMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    return {
      content,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error('[AI] Chat completion error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 生成心理健康风险评估报告
 * 
 * @param data 学生多模态数据
 * @returns 风险评估报告
 */
export async function generateRiskAssessment(data: {
  studentName: string;
  heartRateData: number[];
  voiceTremorIndex: number;
  emotionAnalysis: string;
  behaviorData: string;
}): Promise<AIResponse> {
  const systemPrompt = `你是一名专业的心理健康风险评估AI助手。基于提供的多模态数据，生成详细的风险评估报告。

请按以下结构输出报告：

## 风险评估报告

### 语音维度
- 情感倾向：[分析结果]
- 语音颤抖指数：[数值及评估]
- 结论：[基于语音情感分析的风险判断]

### 生理维度  
- 心率变异：[HRV分析]
- 皮电反应：[GSR评估]
- 结论：[基于生理指标的风险判断]

### 行为维度
- 动作强度：[评估]
- 回避次数：[统计]
- 结论：[基于行为分析的风险判断]

### 综合风险等级
- [红色/橙色/黄色/绿色] 及理由

注意：
1. 保持专业、客观的语气
2. 如发现高风险信号，需明确标注并建议干预
3. 报告应当具体、可执行`;

  const userPrompt = `请为以下学生生成心理健康风险评估报告：

学生：${data.studentName}

**生理数据**：
- 心率记录：${data.heartRateData.join(', ')} bpm
- 平均心率：${Math.round(data.heartRateData.reduce((a, b) => a + b, 0) / data.heartRateData.length)} bpm

**语音分析**：
- 颤抖指数：${data.voiceTremorIndex}
- 情感状态：${data.emotionAnalysis}

**行为数据**：
${data.behaviorData}

请生成详细的风险评估报告。`;

  return chatCompletion(
    [{ role: 'user', content: userPrompt }],
    { systemPrompt, temperature: 0.3, maxTokens: 1500 }
  );
}

/**
 * 生成心理干预建议
 * 
 * @param context 学生上下文信息
 * @returns 干预建议
 */
export async function generateInterventionSuggestion(context: {
  studentName: string;
  riskLevel: string;
  alertHistory: string[];
  previousInterventions: string[];
}): Promise<AIResponse> {
  const systemPrompt = `你是一名经验丰富的心理咨询师，专注于大学生心理健康干预。

请基于学生的情况，提供：
1. 当前风险等级评估
2. 推荐的干预策略（CBT、正念、团体辅导等）
3. 具体的干预步骤建议
4. 预期效果与时间线
5. 需要关注的风险点

回复应当专业、温暖、可操作。`;

  const userPrompt = `请为以下学生提供干预建议：

学生：${context.studentName}
风险等级：${context.riskLevel}

历史预警：
${context.alertHistory.map((a, i) => `${i + 1}. ${a}`).join('\n')}

过往干预：
${context.previousInterventions.length > 0 
  ? context.previousInterventions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')
  : '无过往干预记录'}

请提供详细的干预建议。`;

  return chatCompletion(
    [{ role: 'user', content: userPrompt }],
    { systemPrompt, temperature: 0.4, maxTokens: 1200 }
  );
}

/**
 * RAG 知识库查询
 * 
 * @param query 查询问题
 * @param context 相关上下文
 * @returns 带引用的回答
 */
export async function queryKnowledgeBase(
  query: string,
  context?: string
): Promise<AIResponse> {
  const systemPrompt = `你是 PsyTwin Sentinel 心理健康平台的AI助手，基于专业知识库回答问题。

回答原则：
1. 基于专业知识提供准确信息
2. 如涉及危机干预，优先强调安全
3. 引用相关专业知识支持回答
4. 建议寻求专业帮助时，提供具体指导

${context ? `\n参考知识：\n${context}` : ''}`;

  return chatCompletion(
    [{ role: 'user', content: query }],
    { systemPrompt, temperature: 0.3, maxTokens: 1000 }
  );
}

/**
 * 检查 AI 客户端是否可用
 */
export function isAIEnabled(): boolean {
  return !!client && !!process.env.DASHSCOPE_API_KEY;
}

/**
 * 获取可用的模型列表
 */
export function getAvailableModels(): string[] {
  return [
    'qwen-turbo',      // 快速响应，成本低
    'qwen-plus',       // 平衡性能
    'qwen-max',        // 最强性能
    'qwen-max-longcontext', // 长上下文
  ];
}
