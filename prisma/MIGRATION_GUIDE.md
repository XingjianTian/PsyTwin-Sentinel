# PsyTwin 数据库扩展迁移指南

## 概述

本文为 PsyTwin Pocket 小程序提供数据库扩展方案，补充 Sentinel 后端缺失的表和字段。

## 已创建的文件

1. **`prisma/schema-extensions.prisma`** - 新表定义（Teacher, Appointment, Post, ChatSession, ChatMessage, Warning, Schedule）
2. **`prisma/seed-pocket.ts`** - Pocket 扩展数据种子

## 迁移步骤

### 步骤 1：备份数据库

```bash
# 导出当前数据
pg_dump -h localhost -U postgres psytwin > backup.sql
```

### 步骤 2：更新 schema.prisma

将 `schema-extensions.prisma` 中的内容合并到主 `schema.prisma` 文件：

1. 在 Student model 中添加字段：
```prisma
model Student {
  // ... 已有字段 ...
  
  // 小程序扩展字段
  phone       String?   @unique
  avatar      String?
  nickname    String?
  role        String    @default("student")
  badges      Json?
  stats       Json?
  settings    Json?
  lastLoginAt DateTime? @map("last_login_at")
  
  // 关系
  posts       Post[]
  appointments Appointment[]
  chatMessages ChatMessage[]
  warnings    Warning[]
}
```

2. 在文件末尾添加新表定义（从 schema-extensions.prisma 复制）

### 步骤 3：生成迁移

```bash
npx prisma migrate dev --name add_pocket_extensions
```

### 步骤 4：填充 Mock 数据

```bash
# 先运行原有的 seed
npx prisma db seed

# 再运行 Pocket 扩展 seed
npx ts-node prisma/seed-pocket.ts
```

或者更新 package.json：
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts && ts-node prisma/seed-pocket.ts"
  }
}
```

## 数据模型对照表

| 小程序功能 | 数据库表 | 状态 |
|-----------|---------|------|
| 用户登录 | Student/Teacher + phone | ✅ 已添加 |
| 我的档案 | Student (avatar, nickname, badges, stats) | ✅ 已添加 |
| 预约 | Appointment | ✅ 已添加 |
| 心墙 | Post + Comment | ✅ 已添加 |
| AI对话 | ChatSession + ChatMessage | ✅ 已添加 |
| 预警 | Warning | ✅ 已添加 |
| 排班 | Schedule | ✅ 已添加 |

## Mock 数据预览

### 教师账号
- 王老师 (T2021001) - 国家二级心理咨询师
- 李老师 (T2021002) - 高级心理咨询师  
- 张老师 (T2021003) - 心理教师

### 学生账号（已更新）
- 手机号：13900001001 ~ 13900001003
- 昵称：小雨、思源、晴儿
- 成就徽章、统计数据

### 预约数据
- 5条预约记录（待确认/已确认/已完成）

### 心墙动态
- 4条动态（含匿名动态、图片动态）

### 预警数据
- 4条预警（高/中/低风险，待处理/处理中/已解决）

### 聊天数据
- 2个会话（AI助手、咨询师）
- 5条消息（含情绪标签、CBT卡片）

## 下一步

1. 运行迁移命令
2. 验证数据库结构
3. 开发后端 API 接口
4. 小程序对接真实数据

## 注意事项

- 所有新增字段都是可选的（nullable），不影响现有数据
- 原有 Sentinel 功能不受影响
- Mock 数据可以随时重新生成
