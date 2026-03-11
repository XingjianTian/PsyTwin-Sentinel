# PsyTwin Sentinel 数据格式规范文档

**文档版本**: v1.0  
**生成日期**: 2026-03-10  
**数据库**: PostgreSQL  
**ORM**: Prisma 6.19.2

---

## 目录

1. [通用约定](#通用约定)
2. [数据类型说明](#数据类型说明)
3. [枚举类型定义](#枚举类型定义)
4. [数据表详细定义](#数据表详细定义)

---

## 通用约定

### 1. 命名规范

| 层级 | 命名方式 | 示例 |
|------|----------|------|
| 代码层 (Prisma) | camelCase | `studentId`, `createdAt` |
| 数据库层 | snake_case | `student_id`, `created_at` |
| 表名 | PascalCase (代码) / snake_case (DB) | `Alert` → `alerts` |

### 2. ID 格式规范

| 实体类型 | ID 前缀 | 示例 |
|----------|---------|------|
| 学生 | stu- | stu-chenyuqing, stu-zhangmingyuan |
| 预警 | al- | al-01, al-02 |
| 文档 | doc- | doc-1, doc-2 |
| AI提示词 | preset- | preset-1, preset-2 |
| 预约 | appt- | appt-1 |
| 工单 | wo- | wo-1 |
| 设备 | dev- | dev-1 |
| 咨询师/教师 | tea- | tea-1 |
| 聊天会话 | cs- | cs-1 |
| 聊天消息 | cm- | cm-1 |
| 帖子 | post- | post-1 |
| 评论 | cm- | cm-1 (与聊天消息区分需看上下文) |
| VR场景 | scene- | scene-1 |
| VR会话 | vs- | vs-1 |

### 3. 时间戳字段

所有表均包含以下字段：
- `created_at`: 创建时间，`CURRENT_TIMESTAMP`
- `updated_at`: 更新时间，Prisma `@updatedAt` 自动维护

### 4. 状态字段约定

| 字段名 | 类型 | 说明 |
|--------|------|------|
| status | Enum | 实体状态 |
| riskLevel | RiskLevel | 风险等级：HIGH, MEDIUM, LOW |

---

## 数据类型说明

### PostgreSQL ↔ Prisma 类型映射

| PostgreSQL 类型 | Prisma 类型 | 说明 |
|-----------------|-------------|------|
| `text` | `String` | 文本，最大 1GB |
| `timestamp without time zone` | `DateTime` | 时间戳 (UTC) |
| `boolean` | `Boolean` | 布尔值 |
| `integer` | `Int` | 32位整数 |
| `double precision` | `Float` | 双精度浮点数 |
| `USER-DEFINED` | `Enum` | 枚举类型 |
| `jsonb` | `Json` | JSON 数据 |
| `ARRAY` | `String[]` | 字符串数组 |
| `uuid` | `String @id @default(uuid())` | UUID 主键 |

---

## 枚举类型定义

### RiskLevel (风险等级)
```
HIGH    - 高风险
MEDIUM  - 中风险  
LOW     - 低风险
```

### AlertType (预警类型)
```
HEART_RATE_SURGE   - 心率骤升
VOICE_TREMOR       - 声音颤抖
SLEEP_ANOMALY      - 睡眠异常
EMOTION_SWING      - 情绪波动
SOCIAL_WITHDRAWAL  - 社交退缩
GAIT_ANOMALY       - 步态异常
EATING_ANOMALY     - 饮食异常
```

### WorkOrderStatus (工单状态)
```
PENDING      - 待处理
IN_PROGRESS  - 处理中
COMPLETED    - 已完成
```

### InterventionType (干预类型)
```
REGULAR_INTERVIEW   - 常规访谈
CBT_THERAPY         - CBT疗法
GROUP_COUNSELING    - 团体辅导
CRISIS_INTERVENTION - 危机干预
INITIAL_ASSESSMENT  - 初始评估
```

### DeviceType (设备类型)
```
VR        - VR设备
BRACELET  - 手环
EEG       - 脑电设备
```

### DeviceStatus (设备状态)
```
ONLINE       - 在线
OFFLINE      - 离线
IN_USE       - 使用中
MAINTENANCE  - 维护中
```

### RoomStatus (咨询室状态)
```
AVAILABLE    - 可用
IN_USE       - 使用中
MAINTENANCE  - 维护中
```

### UserRole (用户角色)
```
ADMIN      - 系统管理员
COUNSELOR  - 心理咨询师
ASSISTANT  - 咨询助理
TEACHER    - 普通教师
```

### TeacherStatus (教师状态)
```
ACTIVE     - 活跃
INACTIVE   - 非活跃
SUSPENDED  - 已暂停
```

### StudentStatus (学生状态)
```
ACTIVE     - 活跃
INACTIVE   - 非活跃
SUSPENDED  - 已暂停
```

### Sentiment (情感倾向)
```
POSITIVE   - 积极
NEGATIVE   - 消极
NEUTRAL    - 中性
```

### AppointmentType (预约类型)
```
COUNSELING  - 咨询
VR          - VR体验
GROUP       - 团体活动
```

### AppointmentStatus (预约状态)
```
PENDING     - 待确认
CONFIRMED   - 已确认
COMPLETED   - 已完成
CANCELLED   - 已取消
NO_SHOW     - 爽约
```

### PostStatus (帖子状态)
```
ACTIVE   - 正常
PENDING  - 审核中
HIDDEN   - 已隐藏
DELETED  - 已删除
```

### CommentStatus (评论状态)
```
ACTIVE   - 正常
HIDDEN   - 已隐藏
DELETED  - 已删除
```

### NotificationType (通知类型)
```
SYSTEM       - 系统通知
APPOINTMENT  - 预约通知
CHAT         - 聊天通知
WARNING      - 预警通知
POST         - 帖子通知
COMMENT      - 评论通知
```

### SessionType (会话类型)
```
AI         - AI对话
COUNSELOR  - 咨询师对话
```

### MessageStatus (消息状态)
```
SENDING    - 发送中
SENT       - 已发送
DELIVERED  - 已送达
READ       - 已读
FAILED     - 发送失败
```

### WarningStatus (预警状态)
```
PENDING     - 待处理
PROCESSING  - 处理中
RESOLVED    - 已解决
```

### DocStatus (文档状态)
```
VECTORIZED  - 已向量化
PROCESSING  - 处理中
FAILED      - 失败
```

### DataSourceType (数据源类型)
```
VR_DEVICE  - VR设备
BAND       - 手环
AUDIO      - 音频
RAG        - RAG知识库
```

### DataSourceStatus (数据源状态)
```
CONNECTED     - 已连接
DISCONNECTED  - 已断开
ERROR         - 错误
```

### SyncTaskStatus (同步任务状态)
```
IDLE      - 空闲
RUNNING   - 运行中
PAUSED    - 已暂停
ERROR     - 错误
```

### SyncLogStatus (同步日志状态)
```
SUCCESS  - 成功
FAILED   - 失败
PARTIAL  - 部分成功
```

### ChannelType (通知渠道类型)
```
WECHAT_WORK  - 企业微信
SMS          - 短信
EMAIL        - 邮件
APP_PUSH     - App推送
```

### TestStatus (测试状态)
```
SUCCESS  - 成功
FAILED   - 失败
```

### TemplateType (模板类型)
```
WARNING   - 预警模板
CRISIS    - 危机模板
REMINDER  - 提醒模板
SYSTEM    - 系统模板
```

### TriggerType (触发器类型)
```
RISK_LEVEL      - 风险等级
HEART_RATE      - 心率
EMOTION_CHANGE  - 情绪变化
APPOINTMENT     - 预约
SYSTEM_EVENT    - 系统事件
```

### NotificationStatus (通知状态)
```
PENDING     - 待发送
SENT        - 已发送
DELIVERED   - 已送达
READ        - 已读
FAILED      - 失败
```

### SessionStatus (会话状态)
```
ACTIVE    - 活跃
CLOSED    - 已关闭
ARCHIVED  - 已归档
```

### UserStatus (用户状态)
```
ACTIVE     - 活跃
INACTIVE   - 非活跃
SUSPENDED  - 已暂停
```

### MessageType (消息类型)
```
TEXT         - 文本
EMOTION_TAG  - 情绪标签
CBT_CARD     - CBT卡片
AUDIO        - 语音
```

---

## 数据表详细定义

### AIDocument (AI文档)

存储 AI 知识库文档信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | doc-1 | 主键，格式：doc-{n} |
| name | String | 是 | - | name | 危机干预指南（第三版） | 文档名称 |
| fileSize | String | 是 | - | file_size | 2.4 MB | 文件大小 |
| uploadDate | DateTime | 是 | - | upload_date | 2025-11-08 | 上传日期 |
| status | DocStatus | 是 | - | status | VECTORIZED | 文档状态 |
| vectorStatus | String | 是 | - | vector_status | ready | 向量状态 |
| createdAt | DateTime | 是 | now() | created_at | 2026-03-06T14:38:41Z | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | 2026-03-07T09:23:47Z | 更新时间 |

**索引**: status, uploadDate

---

### AIPromptPreset (AI提示词预设)

存储 AI 对话的提示词预设。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | preset-1 | 主键 |
| label | String | 是 | - | label | 星际面试官 | 显示标签 |
| value | String | 是 | - | value | star-interviewer | 唯一标识值 |
| promptText | String | 是 | - | prompt_text | 面向面试压力场景... | 提示词内容 |
| isActive | Boolean | 是 | false | is_active | true/false | 是否激活 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: isActive  
**唯一约束**: value

---

### Alert (预警记录)

存储学生心理健康预警信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | al-01 | 主键，格式：al-{n} |
| studentId | String | 是 | - | student_id | stu-chenyuqing | 学生ID |
| type | AlertType | 是 | - | type | VOICE_TREMOR | 预警类型 |
| level | RiskLevel | 是 | - | level | HIGH/MEDIUM | 风险等级 |
| alertTime | DateTime | 是 | - | alert_time | 2026-03-07T09:23:47Z | 预警时间 |
| source | String | 是 | - | source | voice/vitals/behavior | 数据来源 |
| description | String | 是 | - | description | - | 预警描述 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, type, level, alertTime  
**外键**: studentId → Student.id (Cascade)

---

### Appointment (预约记录)

存储学生心理咨询预约信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | appt-1 | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| teacherId | String | 否 | - | teacher_id | tea-xxx | 教师/咨询师ID |
| roomId | String | 否 | - | room_id | room-xxx | 咨询室ID |
| type | AppointmentType | 是 | - | type | COUNSELING | 预约类型 |
| date | DateTime | 是 | - | date | 2026-03-10 | 预约日期 |
| timeSlot | String | 是 | - | time_slot | 09:00-10:00 | 时间段 |
| status | AppointmentStatus | 是 | PENDING | status | CONFIRMED | 预约状态 |
| reason | String | 否 | - | reason | 学业压力 | 预约原因 |
| cancelReason | String | 否 | - | cancel_reason | - | 取消原因 |
| meetingLink | String | 否 | - | meeting_link | https://... | 会议链接 |
| feedbackScore | Int | 否 | - | feedback_score | 5 | 反馈评分(1-5) |
| feedbackContent | String | 否 | - | feedback_content | 很好 | 反馈内容 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, teacherId, date, status  
**外键**: studentId → Student.id, teacherId → Teacher.id

---

### AuditLog (审计日志)

存储系统操作审计日志。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | - | 主键 |
| userId | String | 是 | - | user_id | user-xxx | 操作用户ID |
| action | String | 是 | - | action | CREATE/UPDATE/DELETE | 操作类型 |
| resource | String | 是 | - | resource | Student | 资源类型 |
| resourceId | String | 否 | - | resource_id | stu-xxx | 资源ID |
| details | Json | 否 | - | details | {...} | 详细数据 |
| ipAddress | String | 否 | - | ip_address | 192.168.1.1 | IP地址 |
| userAgent | String | 否 | - | user_agent | Mozilla/5.0... | 用户代理 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |

**索引**: userId, action, createdAt

---

### ChatMessage (聊天消息)

存储聊天会话中的消息记录。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | cm-xxx | 主键 |
| sessionId | String | 是 | - | session_id | cs-xxx | 会话ID |
| senderId | String | 是 | - | sender_id | stu-xxx/ai | 发送者ID |
| type | MessageType | 是 | TEXT | type | TEXT/EMOTION_TAG/CBT_CARD | 消息类型 |
| content | String | 是 | - | content | 你好 | 消息内容 |
| seq | Int | 是 | 0 | seq | 1,2,3... | 消息序号 |
| emotionTag | String | 否 | - | emotion_tag | happy/sad/anxious | 情绪标签 |
| cbtCard | Json | 否 | - | cbt_card | {...} | CBT卡片数据 |
| status | MessageStatus | 是 | SENT | status | SENT/DELIVERED/READ | 消息状态 |
| isRead | Boolean | 是 | false | is_read | true/false | 是否已读 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: sessionId, createdAt, seq, status  
**外键**: sessionId → ChatSession.id (Cascade)

---

### ChatSession (聊天会话)

存储学生的聊天会话信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | cs-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| type | SessionType | 是 | - | type | AI/COUNSELOR | 会话类型 |
| title | String | 是 | - | title | AI助手 | 会话标题 |
| targetId | String | 否 | - | target_id | ai/counselor-xxx | 对话目标ID |
| targetName | String | 否 | - | target_name | 心理助手 | 目标名称 |
| targetAvatar | String | 否 | - | target_avatar | https://... | 目标头像 |
| lastMessage | String | 否 | - | last_message | 最新消息内容 | 最后消息 |
| lastMessageAt | DateTime | 否 | - | last_message_at | - | 最后消息时间 |
| unreadCount | Int | 是 | 0 | unread_count | 0,1,2... | 未读数 |
| status | SessionStatus | 是 | ACTIVE | status | ACTIVE/CLOSED | 会话状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, status, lastMessageAt  
**外键**: studentId → Student.id (Cascade)

---

### Comment (评论)

存储帖子评论信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | cm-xxx | 主键 |
| postId | String | 是 | - | post_id | post-xxx | 帖子ID |
| authorId | String | 是 | - | author_id | stu-xxx | 作者ID |
| parentId | String | 否 | - | parent_id | cm-xxx | 父评论ID |
| replyToId | String | 否 | - | reply_to_id | stu-xxx | 回复用户ID |
| content | String | 是 | - | content | 评论内容 | 评论内容 |
| likeCount | Int | 是 | 0 | like_count | 0,1,2... | 点赞数 |
| status | CommentStatus | 是 | ACTIVE | status | ACTIVE/HIDDEN/DELETED | 状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: postId, authorId, parentId  
**外键**: postId → Post.id (Cascade), authorId → Student.id (Cascade)

---

### ConsultationRoom (咨询室)

存储心理咨询室信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | room-xxx | 主键 |
| name | String | 是 | - | name | 101咨询室 | 房间名称 |
| location | String | 是 | - | location | 心理中心1楼 | 位置 |
| status | RoomStatus | 是 | - | status | AVAILABLE | 房间状态 |
| capacity | Int | 是 | - | capacity | 4 | 容纳人数 |
| currentStudentId | String | 否 | - | current_student_id | stu-xxx | 当前使用学生 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: status, currentStudentId

---

### DataSource (数据源)

存储外部数据源配置。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | ds-xxx | 主键 |
| name | String | 是 | - | name | VR设备数据 | 数据源名称 |
| type | DataSourceType | 是 | - | type | VR_DEVICE | 数据源类型 |
| enabled | Boolean | 是 | true | enabled | true/false | 是否启用 |
| config | Json | 否 | - | config | {...} | 配置信息 |
| lastSyncAt | DateTime | 否 | - | last_sync_at | - | 最后同步时间 |
| status | DataSourceStatus | 是 | DISCONNECTED | status | CONNECTED | 连接状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

---

### Device (设备)

存储物联网设备信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | dev-xxx | 主键 |
| name | String | 是 | - | name | VR头显01 | 设备名称 |
| serialNumber | String | 是 | - | serial_number | SN12345678 | 序列号 |
| type | DeviceType | 是 | - | type | VR/BRACELET/EEG | 设备类型 |
| model | String | 否 | - | model | Meta Quest 3 | 型号 |
| status | DeviceStatus | 是 | - | status | ONLINE | 设备状态 |
| battery | Int | 否 | - | battery | 85 | 电量百分比 |
| room | String | 否 | - | room | room-xxx | 所在房间 |
| location | String | 否 | - | location | 心理中心 | 位置描述 |
| lastActive | String | 否 | - | last_active | 2分钟前 | 最后活跃 |
| lastSync | String | 否 | - | last_sync | 2026-03-10 09:00 | 最后同步 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: type, status  
**唯一约束**: serialNumber

---

### DocumentChunk (文档分块)

存储 RAG 文档分块信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | dc-xxx | 主键 |
| documentId | String | 是 | - | document_id | doc-xxx | 文档ID |
| content | String | 是 | - | content | 文本内容... | 分块内容 |
| embedding | String | 否 | - | embedding | [...] | 向量嵌入 |
| chunkIndex | Int | 是 | - | chunk_index | 0,1,2... | 分块序号 |
| metadata | Json | 否 | - | metadata | {...} | 元数据 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: documentId, chunkIndex  
**外键**: documentId → AIDocument.id

---

### ExpressionData (表情数据)

存储学生面部表情分析数据。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | ed-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| timestamp | DateTime | 是 | - | timestamp | 2026-03-10T09:00:00Z | 时间戳 |
| primaryExpression | String | 是 | - | primary_expression | neutral/happy/sad | 主要表情 |
| anxietyLevel | Float | 是 | - | anxiety_level | 0.3 | 焦虑程度(0-1) |
| sadnessLevel | Float | 是 | - | sadness_level | 0.1 | 悲伤程度(0-1) |
| angerLevel | Float | 是 | - | anger_level | 0.0 | 愤怒程度(0-1) |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, timestamp, [studentId, timestamp]  
**外键**: studentId → Student.id (Cascade)

---

### Faculty (院系)

存储学校院系信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | fac-xxx | 主键 |
| name | String | 是 | - | name | 计算机学院 | 院系名称 |
| campusX | Float | 否 | - | campus_x | 100.5 | 校区X坐标 |
| campusY | Float | 否 | - | campus_y | 200.3 | 校区Y坐标 |
| stressIndex | Float | 否 | - | stress_index | 65.5 | 压力指数 |
| riskLevel | RiskLevel | 是 | LOW | risk_level | MEDIUM | 风险等级 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: riskLevel  
**唯一约束**: name

---

### InterventionDetail (干预详情)

存储心理干预的详细信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | id-xxx | 主键 |
| recordId | String | 是 | - | record_id | ir-xxx | 干预记录ID |
| preMood | String | 否 | - | pre_mood | 焦虑 | 干预前情绪 |
| preAnxietyLevel | Int | 否 | - | pre_anxiety_level | 7 | 干预前焦虑(1-10) |
| preDepressionLevel | Int | 否 | - | pre_depression_level | 5 | 干预前抑郁(1-10) |
| preStressLevel | Int | 否 | - | pre_stress_level | 8 | 干预前压力(1-10) |
| mainIssues | String | 否 | - | main_issues | 学业压力... | 主要问题 |
| riskLevel | String | 否 | - | risk_level | MEDIUM | 风险评估 |
| riskAssessment | String | 否 | - | risk_assessment | 详细评估... | 评估详情 |
| sessionContent | String | 否 | - | session_content | 会谈摘要... | 会谈内容 |
| techniquesUsed | String[] | 否 | - | techniques_used | [CBT, 正念] | 使用技术 |
| studentEngagement | String | 否 | - | student_engagement | 积极参与 | 参与度 |
| keyPoints | String | 否 | - | key_points | 关键点... | 要点记录 |
| emotionalChanges | String | 否 | - | emotional_changes | 情绪改善 | 情绪变化 |
| postMood | String | 否 | - | post_mood | 平静 | 干预后情绪 |
| postAnxietyLevel | Int | 否 | - | post_anxiety_level | 4 | 干预后焦虑(1-10) |
| postDepressionLevel | Int | 否 | - | post_depression_level | 3 | 干预后抑郁(1-10) |
| postStressLevel | Int | 否 | - | post_stress_level | 5 | 干预后压力(1-10) |
| improvementScore | Int | 否 | - | improvement_score | 7 | 改善评分(1-10) |
| breakthroughPoints | String | 否 | - | breakthrough_points | 突破点... | 突破点 |
| unfinishedIssues | String | 否 | - | unfinished_issues | 待续... | 未完成问题 |
| followUpActions | String | 否 | - | follow_up_actions | 后续行动... | 后续计划 |
| nextAppointment | DateTime | 否 | - | next_appointment | 2026-03-17 | 下次预约 |
| referrals | String | 否 | - | referrals | 转介建议... | 转介建议 |
| recommendations | String | 否 | - | recommendations | 建议... | 给学生的建议 |
| privateNotes | String | 否 | - | private_notes | 咨询师笔记... | 私人笔记 |
| attachments | String[] | 否 | - | attachments | [url1, url2] | 附件链接 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: recordId  
**唯一约束**: recordId  
**外键**: recordId → InterventionRecord.id (Cascade)

---

### InterventionRecord (干预记录)

存储心理干预的基本记录。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | ir-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| date | DateTime | 是 | - | date | 2026-03-10 | 干预日期 |
| type | InterventionType | 是 | - | type | CBT_THERAPY | 干预类型 |
| counselor | String | 是 | - | counselor | 张医生 | 咨询师姓名 |
| duration | String | 是 | - | duration | 50分钟 | 时长 |
| result | String | 是 | - | result | 效果良好 | 干预结果 |
| status | String | 是 | - | status | completed | 状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, type, date, status  
**外键**: studentId → Student.id (Cascade)

---

### IPWhitelist (IP白名单)

存储系统访问 IP 白名单。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | ip-xxx | 主键 |
| ipAddress | String | 是 | - | ip_address | 192.168.1.100 | IP地址 |
| description | String | 否 | - | description | 办公室网络 | 描述 |
| enabled | Boolean | 是 | true | enabled | true/false | 是否启用 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| createdBy | String | 否 | - | created_by | admin | 创建者 |

**索引**: ipAddress

---

### NotificationChannel (通知渠道)

存储通知渠道配置。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | nc-xxx | 主键 |
| name | String | 是 | - | name | 企业微信 | 渠道名称 |
| type | ChannelType | 是 | - | type | WECHAT_WORK | 渠道类型 |
| enabled | Boolean | 是 | false | enabled | true/false | 是否启用 |
| config | Json | 否 | - | config | {...} | 配置信息 |
| lastTestedAt | DateTime | 否 | - | last_tested_at | - | 最后测试时间 |
| testStatus | TestStatus | 否 | - | test_status | SUCCESS | 测试状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

---

### NotificationHistory (通知历史)

存储已发送通知的历史记录。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | nh-xxx | 主键 |
| ruleId | String | 否 | - | rule_id | nr-xxx | 规则ID |
| channelType | ChannelType | 是 | - | channel_type | WECHAT_WORK | 渠道类型 |
| recipient | String | 是 | - | recipient | 13800138000 | 接收人 |
| title | String | 是 | - | title | 预警通知 | 标题 |
| content | String | 是 | - | content | 内容... | 内容 |
| status | NotificationStatus | 是 | - | status | SENT | 发送状态 |
| errorMsg | String | 否 | - | error_msg | - | 错误信息 |
| sentAt | DateTime | 是 | now() | sent_at | - | 发送时间 |
| deliveredAt | DateTime | 否 | - | delivered_at | - | 送达时间 |
| readAt | DateTime | 否 | - | read_at | - | 阅读时间 |

**索引**: sentAt, recipient

---

### NotificationRule (通知规则)

存储通知触发规则。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | nr-xxx | 主键 |
| name | String | 是 | - | name | 高风险预警 | 规则名称 |
| enabled | Boolean | 是 | true | enabled | true/false | 是否启用 |
| triggerType | TriggerType | 是 | - | trigger_type | RISK_LEVEL | 触发类型 |
| triggerConfig | Json | 是 | - | trigger_config | {...} | 触发配置 |
| channels | String[] | 是 | - | channels | [WECHAT_WORK, SMS] | 通知渠道 |
| recipients | Json | 是 | - | recipients | {...} | 接收人配置 |
| templateId | String | 否 | - | template_id | nt-xxx | 模板ID |
| silentOverride | Boolean | 是 | false | silent_override | true/false | 静默覆盖 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

---

### NotificationTemplate (通知模板)

存储通知消息模板。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | nt-xxx | 主键 |
| name | String | 是 | - | name | 高风险预警模板 | 模板名称 |
| type | TemplateType | 是 | - | type | WARNING | 模板类型 |
| subject | String | 否 | - | subject | 预警通知 | 邮件主题 |
| content | String | 是 | - | content | 尊敬的老师... | 模板内容 |
| variables | Json | 否 | - | variables | {...} | 变量定义 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |
| updatedBy | String | 否 | - | updated_by | admin | 更新者 |

---

### Post (帖子)

存储学生社区帖子。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | post-xxx | 主键 |
| authorId | String | 是 | - | author_id | stu-xxx | 作者ID |
| content | String | 是 | - | content | 帖子内容... | 内容 |
| images | String[] | 是 | - | images | [url1, url2] | 图片URL数组 |
| location | String | 否 | - | location | 图书馆 | 位置 |
| isAnonymous | Boolean | 是 | false | is_anonymous | true/false | 是否匿名 |
| tags | String[] | 是 | - | tags | [学业, 压力] | 标签数组 |
| likeCount | Int | 是 | 0 | like_count | 0,1,2... | 点赞数 |
| commentCount | Int | 是 | 0 | comment_count | 0,1,2... | 评论数 |
| riskScore | Float | 否 | - | risk_score | 0.75 | 风险分数(0-1) |
| viewCount | Int | 是 | 0 | view_count | 0,1,2... | 浏览量 |
| status | PostStatus | 是 | ACTIVE | status | ACTIVE | 帖子状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: authorId, createdAt  
**外键**: authorId → Student.id

---

### PostCollection (帖子收藏)

存储学生收藏的帖子。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | pc-xxx | 主键 |
| postId | String | 是 | - | post_id | post-xxx | 帖子ID |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| collectedAt | DateTime | 是 | now() | collected_at | - | 收藏时间 |

**索引**: postId, studentId, collectedAt  
**唯一约束**: [postId, studentId]  
**外键**: postId → Post.id (Cascade), studentId → Student.id (Cascade)

---

### PostLike (帖子点赞)

存储帖子点赞记录。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | pl-xxx | 主键 |
| postId | String | 是 | - | post_id | post-xxx | 帖子ID |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |

**索引**: postId, studentId, createdAt  
**唯一约束**: [postId, studentId]  
**外键**: postId → Post.id (Cascade), studentId → Student.id (Cascade)

---

### PsychProfile (心理档案)

存储学生心理评估档案。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | pp-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| adversityQuotient | Int | 是 | - | adversity_quotient | 75 | 逆商(0-100) |
| emotionalStability | Int | 是 | - | emotional_stability | 68 | 情绪稳定性(0-100) |
| socialTendency | Int | 是 | - | social_tendency | 72 | 社交倾向(0-100) |
| stressResistance | Int | 是 | - | stress_resistance | 65 | 压力抵抗力(0-100) |
| selfAwareness | Int | 是 | - | self_awareness | 70 | 自我认知(0-100) |
| empathy | Int | 是 | - | empathy | 78 | 同理心(0-100) |
| willpower | Int | 是 | - | willpower | 72 | 意志力(0-100) |
| adaptability | Int | 是 | - | adaptability | 75 | 适应力(0-100) |
| overallScore | Int | 是 | - | overall_score | 72 | 综合评分(0-100) |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId  
**唯一约束**: studentId  
**外键**: studentId → Student.id (Cascade)

---

### RoomDevice (房间设备关联)

存储咨询室与设备的关联关系。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | rd-xxx | 主键 |
| roomId | String | 是 | - | room_id | room-xxx | 房间ID |
| deviceId | String | 是 | - | device_id | dev-xxx | 设备ID |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: roomId, deviceId  
**唯一约束**: [roomId, deviceId]  
**外键**: roomId → ConsultationRoom.id (Cascade), deviceId → Device.id (Cascade)

---

### Schedule (排班表)

存储咨询师的排班信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | sch-xxx | 主键 |
| teacherId | String | 是 | - | teacher_id | tea-xxx | 教师ID |
| dayOfWeek | Int | 是 | - | day_of_week | 1-7 | 星期几(1=周一) |
| startTime | String | 是 | - | start_time | 09:00 | 开始时间 |
| endTime | String | 是 | - | end_time | 17:00 | 结束时间 |
| isAvailable | Boolean | 是 | true | is_available | true/false | 是否可用 |
| maxAppointments | Int | 是 | 4 | max_appointments | 4 | 最大预约数 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: teacherId, dayOfWeek  
**外键**: teacherId → Teacher.id

---

### SilentHours (静默时段)

存储通知静默时段配置。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | sh-xxx | 主键 |
| enabled | Boolean | 是 | true | enabled | true/false | 是否启用 |
| startTime | String | 是 | - | start_time | 22:00 | 开始时间 |
| endTime | String | 是 | - | end_time | 08:00 | 结束时间 |
| exceptLevel | RiskLevel | 是 | HIGH | except_level | HIGH | 例外等级 |

---

### Student (学生)

存储学生基本信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | stu-chenyuqing | 主键，格式：stu-{姓名拼音} |
| name | String | 是 | - | name | 陈雨晴 | 姓名 |
| studentNo | String | 是 | - | student_no | 2021010001 | 学号 |
| className | String | 是 | - | class_name | 计算机2101班 | 班级名称 |
| facultyId | String | 否 | - | faculty_id | fac-xxx | 院系ID |
| gender | String | 否 | - | gender | 女/男 | 性别 |
| birthDate | DateTime | 否 | - | birth_date | 2002-05-15 | 出生日期 |
| mbti | String | 否 | - | mbti | INFP | MBTI类型 |
| riskLevel | RiskLevel | 是 | LOW | risk_level | MEDIUM | 风险等级 |
| phone | String | 否 | - | phone | 13800138000 | 手机号 |
| passwordHash | String | 否 | - | password_hash | hash... | 密码哈希 |
| avatar | String | 否 | - | avatar | https://... | 头像URL |
| nickname | String | 否 | - | nickname | 小雨 | 昵称 |
| role | String | 是 | student | role | student | 角色 |
| status | StudentStatus | 是 | ACTIVE | status | ACTIVE | 状态 |
| badges | Json | 否 | - | badges | [...] | 徽章数组 |
| stats | Json | 否 | - | stats | {...} | 统计数据 |
| settings | Json | 否 | - | settings | {...} | 设置信息 |
| joinDate | DateTime | 否 | - | join_date | 2021-09-01 | 入学日期 |
| lastLoginAt | DateTime | 否 | - | last_login_at | 2026-03-10T09:00:00Z | 最后登录时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: className, facultyId, riskLevel  
**唯一约束**: studentNo, phone  
**外键**: facultyId → Faculty.id

---

### StudentNotification (学生通知)

存储发送给学生的通知。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | sn-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| type | NotificationType | 是 | - | type | SYSTEM | 通知类型 |
| title | String | 是 | - | title | 预约提醒 | 标题 |
| content | String | 是 | - | content | 内容... | 内容 |
| actionUrl | String | 否 | - | action_url | /appointment/xxx | 跳转链接 |
| isRead | Boolean | 是 | false | is_read | true/false | 是否已读 |
| readAt | DateTime | 否 | - | read_at | - | 阅读时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |

**索引**: studentId, type, isRead, createdAt  
**外键**: studentId → Student.id (Cascade)

---

### SyncLog (同步日志)

存储数据同步任务的执行日志。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | sl-xxx | 主键 |
| taskId | String | 是 | - | task_id | st-xxx | 任务ID |
| startedAt | DateTime | 是 | - | started_at | - | 开始时间 |
| endedAt | DateTime | 否 | - | ended_at | - | 结束时间 |
| status | SyncLogStatus | 是 | - | status | SUCCESS | 执行状态 |
| dataSize | Int | 否 | - | data_size | 1024 | 数据大小(bytes) |
| recordCount | Int | 否 | - | record_count | 100 | 记录数 |
| errorMsg | String | 否 | - | error_msg | - | 错误信息 |

**索引**: [taskId, startedAt]  
**外键**: taskId → SyncTask.id (Cascade)

---

### SyncTask (同步任务)

存储数据同步任务配置。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | st-xxx | 主键 |
| name | String | 是 | - | name | 手环数据同步 | 任务名称 |
| dataSourceId | String | 是 | - | data_source_id | ds-xxx | 数据源ID |
| schedule | String | 是 | - | schedule | 0 */6 * * * | Cron表达式 |
| enabled | Boolean | 是 | true | enabled | true/false | 是否启用 |
| status | SyncTaskStatus | 是 | IDLE | status | IDLE/RUNNING | 任务状态 |
| lastSyncAt | DateTime | 否 | - | last_sync_at | - | 最后同步时间 |
| nextSyncAt | DateTime | 否 | - | next_sync_at | - | 下次同步时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**外键**: dataSourceId → DataSource.id

---

### SystemConfig (系统配置)

存储系统配置参数。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | sc-xxx | 主键 |
| key | String | 是 | - | key | max_login_attempts | 配置键 |
| value | String | 是 | - | value | 5 | 配置值 |
| description | String | 否 | - | description | 最大登录尝试次数 | 描述 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |
| updatedBy | String | 否 | - | updated_by | admin | 更新者 |

**唯一约束**: key

---

### Teacher (教师/咨询师)

存储教师和心理咨询师信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | tea-xxx | 主键 |
| teacherId | String | 是 | - | teacher_id | T2021001 | 教师工号 |
| name | String | 是 | - | name | 张老师 | 姓名 |
| phone | String | 是 | - | phone | 13800138000 | 手机号 |
| passwordHash | String | 是 | - | password_hash | hash... | 密码哈希 |
| avatar | String | 否 | - | avatar | https://... | 头像URL |
| department | String | 是 | - | department | 心理咨询中心 | 部门 |
| title | String | 是 | - | title | 高级心理咨询师 | 职称 |
| qualifications | String[] | 是 | - | qualifications | ["国家二级"] | 资质证书 |
| nickname | String | 否 | - | nickname | 知心姐姐 | 昵称 |
| workStats | Json | 否 | - | work_stats | {...} | 工作统计 |
| badges | Json | 否 | - | badges | [...] | 徽章数组 |
| role | UserRole | 是 | TEACHER | role | COUNSELOR | 角色 |
| status | TeacherStatus | 是 | ACTIVE | status | ACTIVE | 状态 |
| lastLoginAt | DateTime | 否 | - | last_login_at | - | 最后登录时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: role, status  
**唯一约束**: teacherId, phone

---

### TimelineEvent (时间线事件)

存储学生心理健康时间线事件。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | te-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| date | String | 是 | - | date | 2026-03-10 | 事件日期 |
| title | String | 是 | - | title | 初次咨询 | 事件标题 |
| description | String | 是 | - | description | 描述... | 事件描述 |
| status | String | 是 | - | status | completed | 事件状态 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, status  
**外键**: studentId → Student.id (Cascade)

---

### User (系统用户)

存储系统后台用户信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | user-xxx | 主键 |
| email | String | 是 | - | email | admin@psytwin.com | 邮箱 |
| name | String | 是 | - | name | 管理员 | 姓名 |
| passwordHash | String | 是 | - | password_hash | hash... | 密码哈希 |
| avatar | String | 否 | - | avatar | https://... | 头像URL |
| role | UserRole | 是 | TEACHER | role | ADMIN | 角色 |
| status | UserStatus | 是 | ACTIVE | status | ACTIVE | 状态 |
| lastLoginAt | DateTime | 否 | - | last_login_at | - | 最后登录时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: role, status  
**唯一约束**: email

---

### VitalSign (生命体征)

存储学生生命体征监测数据。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | vs-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| timestamp | DateTime | 是 | - | timestamp | 2026-03-10T09:00:00Z | 时间戳 |
| heartRate | Int | 是 | - | heart_rate | 72 | 心率(bpm) |
| hrv | Float | 否 | - | hrv | 65.5 | 心率变异性 |
| gsr | Float | 否 | - | gsr | 0.5 | 皮肤电反应 |
| stressIndex | Int | 否 | - | stress_index | 45 | 压力指数 |
| bloodOxygen | Float | 否 | - | blood_oxygen | 98.5 | 血氧饱和度(%) |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, timestamp, [studentId, timestamp]  
**外键**: studentId → Student.id (Cascade)

---

### VoiceAnalysis (语音分析)

存储学生语音情感分析数据。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | va-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| timestamp | DateTime | 是 | - | timestamp | 2026-03-10T09:00:00Z | 时间戳 |
| sentiment | Sentiment | 是 | - | sentiment | NEGATIVE | 情感倾向 |
| tremorIndex | Float | 是 | - | tremor_index | 0.3 | 颤抖指数(0-1) |
| emotionLabel | String | 是 | - | emotion_label | anxious | 情绪标签 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, timestamp, sentiment, [studentId, timestamp]  
**外键**: studentId → Student.id (Cascade)

---

### VRScene (VR场景)

存储 VR 体验场景信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | scene-xxx | 主键 |
| name | String | 是 | - | name | 放松海滩 | 场景名称 |
| description | String | 否 | - | description | 海浪声... | 场景描述 |
| usageCount | Int | 是 | 0 | usage_count | 150 | 使用次数 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**唯一约束**: name

---

### VRSession (VR会话)

存储学生 VR 体验会话记录。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | vs-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| sceneId | String | 是 | - | scene_id | scene-xxx | 场景ID |
| duration | String | 是 | - | duration | 15分钟 | 体验时长 |
| emotionBefore | String | 是 | - | emotion_before | anxious | 体验前情绪 |
| emotionAfter | String | 是 | - | emotion_after | relaxed | 体验后情绪 |
| result | Sentiment | 是 | - | result | POSITIVE | 效果评估 |
| sessionAt | DateTime | 是 | now() | session_at | - | 体验时间 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, sceneId, sessionAt  
**外键**: studentId → Student.id (Cascade), sceneId → VRScene.id (Cascade)

---

### Warning (预警)

存储学生风险预警信息（与 Alert 区分，Warning 更侧重长期风险）。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | warn-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| riskLevel | RiskLevel | 是 | - | risk_level | HIGH | 风险等级 |
| riskReason | String | 是 | - | risk_reason | 学业压力+家庭因素 | 风险原因 |
| triggerSource | String | 是 | - | trigger_source | AI评估/人工上报 | 触发来源 |
| triggerContent | String | 否 | - | trigger_content | 具体内容... | 触发内容 |
| status | WarningStatus | 是 | PENDING | status | PROCESSING | 处理状态 |
| assignedTo | String | 否 | - | assigned_to | tea-xxx | 指派给 |
| lastAction | Json | 否 | - | last_action | {...} | 最后操作记录 |
| notes | String | 否 | - | notes | 备注... | 备注 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, riskLevel, status, assignedTo  
**外键**: studentId → Student.id, assignedTo → Teacher.id

---

### WorkOrder (工单)

存储心理干预工单信息。

| 字段名 | 类型 | 是否必填 | 默认值 | 数据库字段 | 示例值 | 说明 |
|--------|------|----------|--------|------------|--------|------|
| id | String | 是 | uuid() | id | wo-xxx | 主键 |
| studentId | String | 是 | - | student_id | stu-xxx | 学生ID |
| className | String | 是 | - | class_name | 计算机2101班 | 班级 |
| trigger | String | 是 | - | trigger | 心率异常触发 | 触发条件 |
| riskLevel | RiskLevel | 是 | - | risk_level | HIGH | 风险等级 |
| method | String | 是 | - | method | 个别咨询 | 干预方式 |
| counselor | String | 是 | - | counselor | 张医生 | 负责人 |
| status | WorkOrderStatus | 是 | - | status | IN_PROGRESS | 工单状态 |
| date | DateTime | 是 | - | date | 2026-03-10 | 日期 |
| detail | String | 否 | - | detail | 详细描述... | 详情 |
| summary | String | 否 | - | summary | 总结... | 总结 |
| createdAt | DateTime | 是 | now() | created_at | - | 创建时间 |
| updatedAt | DateTime | 是 | auto | updated_at | - | 更新时间 |

**索引**: studentId, riskLevel, status, date  
**外键**: studentId → Student.id (Cascade)

---

## 附录

### A. 常见数据格式示例

#### 1. 学生ID格式
```
stu-{姓名拼音}
示例: stu-chenyuqing, stu-zhangmingyuan, stu-liusiyuan
```

#### 2. 日期时间格式
```
ISO 8601 格式: 2026-03-10T09:23:47.475Z
日期格式: 2026-03-10
时间格式: 09:00, 14:30
```

#### 3. Json字段示例

**badges (徽章数组)**:
```json
[
  { "id": "first_consultation", "name": "初次咨询", "icon": "🎯" },
  { "id": "active_participant", "name": "积极参与者", "icon": "⭐" }
]
```

**stats (统计数据)**:
```json
{
  "consultationCount": 5,
  "vrSessions": 3,
  "lastActive": "2026-03-10T09:00:00Z"
}
```

**settings (设置信息)**:
```json
{
  "notifications": true,
  "privacy": { "anonymousPosts": true }
}
```

**cbtCard (CBT卡片)**:
```json
{
  "title": "认知重构",
  "situation": "考试压力",
  "automaticThought": "我一定会考砸",
  "evidence": "我已经复习充分",
  "alternativeThought": "我已经尽力了"
}
```

#### 4. 数组字段示例

**images (图片数组)**:
```
["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"]
```

**tags (标签数组)**:
```
["学业", "压力", "睡眠"]
```

**qualifications (资质数组)**:
```
["国家二级心理咨询师", "注册心理师"]
```

**techniquesUsed (技术数组)**:
```
["CBT", "正念", "放松训练"]
```

### B. 数据完整性约束

1. **所有表**必须包含 `created_at` 和 `updated_at` 字段
2. **所有ID**必须唯一，且非空
3. **外键关联**删除时，子表数据默认级联删除 (onDelete: Cascade)
4. **枚举字段**只能取预定义值，不能为 null（除非标记为可选）
5. **时间戳**统一使用 UTC 时区存储

### C. 索引规范

1. **外键字段**自动创建索引
2. **查询频率高**的字段添加索引（如 studentId, status, createdAt）
3. **组合索引**用于多条件查询（如 [studentId, timestamp]）

---

**文档维护**: 当 Schema 发生变更时，请同步更新本文档。
