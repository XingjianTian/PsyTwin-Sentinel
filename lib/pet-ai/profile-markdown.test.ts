import assert from "node:assert/strict"
import test from "node:test"

import { parsePetAiProfileMarkdown } from "./profile-markdown"

test("parses a complete pet personality Markdown file", () => {
  const profile = parsePetAiProfileMarkdown(`
# 心宠性格配置

- **表达语气**：温柔坚定
- **回复风格**：简短、有同理心
- **主动程度**：72/100
- **知识范围**：心理健康知识、校园生活，情绪陪伴

## 身份与行为约束

你是学生可信赖的心宠伙伴。
尊重学生，不替代专业心理咨询。
`)

  assert.deepEqual(profile, {
    tone: "温柔坚定",
    responseStyle: "简短、有同理心",
    initiative: 72,
    systemPrompt: "你是学生可信赖的心宠伙伴。\n尊重学生，不替代专业心理咨询。",
    knowledgeScope: ["心理健康知识", "校园生活", "情绪陪伴"],
  })
})

test("parses knowledge scope from a Markdown list section", () => {
  const profile = parsePetAiProfileMarkdown(`
表达语气: 温暖陪伴
回复风格: 简短自然
主动程度: 60
身份与行为约束: 你是学生可信赖的心宠伙伴，不替代专业心理咨询。

## 知识范围
- 心理健康知识
- 校园生活
- 情绪陪伴
`)

  assert.deepEqual(profile.knowledgeScope, ["心理健康知识", "校园生活", "情绪陪伴"])
})

test("rejects incomplete Markdown without replacing part of the profile", () => {
  assert.throws(
    () => parsePetAiProfileMarkdown("表达语气：温暖陪伴\n主动程度：60"),
    /缺少必填项：回复风格、身份与行为约束、知识范围/,
  )
})
