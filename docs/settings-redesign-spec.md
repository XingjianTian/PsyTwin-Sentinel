# 系统设置页面重构设计方案

**版本**: v1.0  
**日期**: 2026-03-08  
**状态**: 待实施

---

## 一、设计原则

### 1.1 布局保持
- **左侧导航**: 保留5个Tab的垂直导航列表
- **右侧内容**: 对应内容区域展示
- **布局结构**: `flex gap-4`，左侧固定宽度 `w-56 shrink-0`

### 1.2 风格统一
- 参考干预记录详情和AI配置页面的设计模式
- 使用 `Card` + `CardHeader` + `CardContent` 标准结构
- 使用 `Badge` 展示状态
- 使用 `Table` + `ScrollArea` 展示列表数据

---

## 二、Tab功能详设

### 2.1 基础设置 (Basic Settings)

#### 功能模块
1. **系统状态监控**
   - 平台名称、版本号、运行时间
   - 系统健康状态指示器
   
2. **数据库连接监控**
   - PostgreSQL连接状态
   - Redis缓存状态
   - 最后备份时间
   
3. **系统资源使用**
   - CPU使用率（进度条）
   - 内存使用率（进度条+数值）
   - 磁盘使用率（进度条+数值）
   
4. **缓存管理**
   - 当前缓存大小显示
   - 清理缓存按钮
   - 清空全部按钮
   
5. **日志级别配置**
   - 下拉选择：DEBUG/INFO/WARN/ERROR
   - 导出日志按钮

#### 数据库表需求
无需新增表，使用现有配置存储方式

---

### 2.2 用户管理 (User Management)

#### 当前状态
✅ 已实现，保持现状

#### 功能模块
- 教师/咨询师管理
- 系统用户管理
- 角色权限分配
- 状态管理（启用/禁用）
- 密码重置

---

### 2.3 数据同步 (Data Sync)

#### 功能模块
1. **数据源配置表格**
   - 数据源名称
   - 类型（VR设备/手环/语音/RAG）
   - 启用状态开关
   - 最后同步时间
   - 操作（配置/测试连接）

2. **同步任务列表**
   - 任务名称
   - 状态（运行中/暂停/失败）
   - 最后同步时间
   - 下次同步时间
   - 操作（启动/暂停/编辑/查看日志）

3. **实时同步监控**
   - 今日同步数据量
   - 成功率
   - 失败重试次数

4. **同步历史记录**
   - 时间、任务名、状态、数据量、耗时

#### 数据库表设计

```prisma
// 数据源配置
model DataSource {
  id          String   @id @default(uuid())
  name        String   // 数据源名称
  type        DataSourceType // VR/BAND/AUDIO/RAG
  enabled     Boolean  @default(true)
  config      Json?    // 连接配置（加密存储）
  lastSyncAt  DateTime?
  status      DataSourceStatus @default(DISCONNECTED)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  syncTasks   SyncTask[]
  
  @@map("data_sources")
}

enum DataSourceType {
  VR_DEVICE    // VR设备数据
  BAND         // 手环监测数据
  AUDIO        // 语音数据
  RAG          // RAG知识库
}

enum DataSourceStatus {
  CONNECTED
  DISCONNECTED
  ERROR
}

// 同步任务
model SyncTask {
  id            String   @id @default(uuid())
  name          String   // 任务名称
  dataSourceId  String
  dataSource    DataSource @relation(fields: [dataSourceId], references: [id])
  schedule      String   // cron表达式
  enabled       Boolean  @default(true)
  status        SyncTaskStatus @default(IDLE)
  lastSyncAt    DateTime?
  nextSyncAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  logs          SyncLog[]
  
  @@map("sync_tasks")
}

enum SyncTaskStatus {
  IDLE       // 空闲
  RUNNING    // 运行中
  PAUSED     // 暂停
  ERROR      // 错误
}

// 同步日志
model SyncLog {
  id          String   @id @default(uuid())
  taskId      String
  task        SyncTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  startedAt   DateTime
  endedAt     DateTime?
  status      SyncLogStatus
  dataSize    Int?     // 同步数据量（字节）
  recordCount Int?     // 记录数
  errorMsg    String?
  
  @@index([taskId, startedAt])
  @@map("sync_logs")
}

enum SyncLogStatus {
  SUCCESS
  FAILED
  PARTIAL   // 部分成功
}
```

---

### 2.4 安全策略 (Security)

#### 功能模块
1. **登录安全**
   - 密码复杂度设置（低/中/高）
   - 登录失败次数阈值
   - 账户锁定时间

2. **会话管理**
   - 会话超时时间
   - 最大并发会话数

3. **IP白名单**
   - 表格展示（IP/描述/操作）
   - 添加/删除功能
   - 启用/禁用开关

4. **操作日志审计**
   - 表格展示（时间/用户/操作/IP/结果）
   - 按操作类型筛选
   - 按时间范围筛选
   - 导出日志功能

5. **数据备份策略**
   - 自动备份开关
   - 备份频率（小时/天/周）
   - 保留策略（天数）
   - 手动备份按钮
   - 备份历史列表

#### 数据库表设计

```prisma
// IP白名单
model IPWhitelist {
  id          String   @id @default(uuid())
  ipAddress   String   // IP地址或CIDR
  description String?  // 描述
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  createdBy   String?  // 创建人
  
  @@index([ipAddress])
  @@map("ip_whitelist")
}

// 操作日志
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  userName    String?  // 冗余存储，用户可能已被删除
  action      String   // 操作类型
  resource    String   // 操作对象类型
  resourceId  String?  // 操作对象ID
  details     Json?    // 操作详情
  ipAddress   String   // IP地址
  userAgent   String?  // 浏览器UA
  status      AuditStatus @default(SUCCESS)
  errorMsg    String?
  createdAt   DateTime @default(now())
  
  @@index([createdAt])
  @@index([userId])
  @@index([action])
  @@map("audit_logs")
}

enum AuditStatus {
  SUCCESS
  FAILED
}

// 系统配置（扩展现有或新建）
model SystemConfig {
  id                    String   @id @default(uuid())
  key                   String   @unique
  value                 String
  description           String?
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  // 安全相关配置
  passwordComplexity    String   @default("MEDIUM") // LOW/MEDIUM/HIGH
  maxLoginAttempts      Int      @default(5)
  lockoutDuration       Int      @default(30) // 分钟
  sessionTimeout        Int      @default(30) // 分钟
  maxConcurrentSessions Int      @default(3)
  
  // 备份配置
  autoBackupEnabled     Boolean  @default(true)
  backupFrequency       String   @default("DAILY") // HOURLY/DAILY/WEEKLY
  backupRetentionDays   Int      @default(30)
  
  @@map("system_config")
}
```

---

### 2.5 通知管理 (Notification)

#### 功能模块
1. **通知渠道配置**
   - 企业微信（状态、配置按钮、测试按钮）
   - 短信服务（状态、配置按钮、测试按钮）
   - 邮件服务（状态、配置按钮、测试按钮）
   - App推送（状态、配置按钮、测试按钮）

2. **通知模板管理**
   - 表格展示（模板名称/类型/最后修改/操作）
   - 编辑模板弹窗（富文本编辑器）
   - 预览功能

3. **通知规则配置**
   - 表格展示（规则名/触发条件/接收人/状态/操作）
   - 添加/编辑规则弹窗
   - 启用/禁用开关
   - 删除功能

4. **通知历史记录**
   - 表格展示（时间/接收人/类型/状态/内容预览）
   - 查看详情弹窗
   - 重新发送功能

5. **静默时段设置**
   - 时间范围选择器（23:00 - 07:00）
   - 例外级别选择（仅高危/中高危/全部）
   - 说明文字

#### 数据库表设计

```prisma
// 通知渠道配置
model NotificationChannel {
  id            String   @id @default(uuid())
  name          String   // 渠道名称
  type          ChannelType
  enabled       Boolean  @default(false)
  config        Json?    // 渠道配置（加密）
  lastTestedAt  DateTime?
  testStatus    TestStatus?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("notification_channels")
}

enum ChannelType {
  WECHAT_WORK  // 企业微信
  SMS          // 短信
  EMAIL        // 邮件
  APP_PUSH     // App推送
}

enum TestStatus {
  SUCCESS
  FAILED
}

// 通知模板
model NotificationTemplate {
  id          String   @id @default(uuid())
  name        String   // 模板名称
  type        TemplateType
  subject     String?  // 标题（邮件用）
  content     String   // 模板内容
  variables   Json?    // 可用变量列表
  updatedAt   DateTime @updatedAt
  updatedBy   String?
  
  @@map("notification_templates")
}

enum TemplateType {
  WARNING      // 预警通知
  CRISIS       // 危机干预
  REMINDER     // 提醒
  SYSTEM       // 系统通知
}

// 通知规则
model NotificationRule {
  id            String   @id @default(uuid())
  name          String   // 规则名称
  enabled       Boolean  @default(true)
  triggerType   TriggerType // 触发类型
  triggerConfig Json     // 触发条件配置
  channels      String[] // 通知渠道IDs
  recipients    Json     // 接收人配置
  templateId    String?
  template      NotificationTemplate? @relation(fields: [templateId], references: [id])
  silentOverride Boolean @default(false) // 是否覆盖静默时段
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  histories     NotificationHistory[]
  
  @@map("notification_rules")
}

enum TriggerType {
  RISK_LEVEL      // 风险等级
  HEART_RATE      // 心率异常
  EMOTION_CHANGE  // 情绪变化
  APPOINTMENT     // 预约相关
  SYSTEM_EVENT    // 系统事件
}

// 通知历史
model NotificationHistory {
  id          String   @id @default(uuid())
  ruleId      String?
  rule        NotificationRule? @relation(fields: [ruleId], references: [id])
  channelType ChannelType
  recipient   String   // 接收人
  title       String   // 通知标题
  content     String   // 通知内容
  status      NotificationStatus
  errorMsg    String?
  sentAt      DateTime @default(now())
  deliveredAt DateTime?
  readAt      DateTime?
  
  @@index([sentAt])
  @@index([recipient])
  @@map("notification_histories")
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  READ
  FAILED
}

// 静默时段设置
model SilentHours {
  id            String   @id @default(uuid())
  enabled       Boolean  @default(true)
  startTime     String   // "23:00"
  endTime       String   // "07:00"
  exceptLevel   RiskLevel @default(HIGH) // 例外级别
  
  @@map("silent_hours")
}
```

---

## 三、API设计

### 3.1 基础设置
```typescript
// GET /api/settings/basic - 获取基础设置
// POST /api/settings/basic - 保存基础设置
// POST /api/settings/cache/clear - 清理缓存
// POST /api/settings/logs/export - 导出日志
```

### 3.2 数据同步
```typescript
// GET /api/settings/data-sources - 获取数据源列表
// POST /api/settings/data-sources - 创建数据源
// PUT /api/settings/data-sources/:id - 更新数据源
// DELETE /api/settings/data-sources/:id - 删除数据源
// POST /api/settings/data-sources/:id/test - 测试连接

// GET /api/settings/sync-tasks - 获取同步任务列表
// POST /api/settings/sync-tasks - 创建同步任务
// PUT /api/settings/sync-tasks/:id - 更新任务
// DELETE /api/settings/sync-tasks/:id - 删除任务
// POST /api/settings/sync-tasks/:id/toggle - 启动/暂停任务
// POST /api/settings/sync-tasks/:id/trigger - 手动触发
// GET /api/settings/sync-tasks/:id/logs - 获取任务日志

// GET /api/settings/sync-stats - 获取同步统计
```

### 3.3 安全策略
```typescript
// GET /api/settings/security - 获取安全设置
// POST /api/settings/security - 保存安全设置

// GET /api/settings/ip-whitelist - 获取IP白名单
// POST /api/settings/ip-whitelist - 添加IP
// DELETE /api/settings/ip-whitelist/:id - 删除IP

// GET /api/settings/audit-logs - 获取审计日志
// POST /api/settings/audit-logs/export - 导出审计日志

// POST /api/settings/backup/trigger - 手动触发备份
// GET /api/settings/backup/history - 获取备份历史
```

### 3.4 通知管理
```typescript
// GET /api/settings/notification-channels - 获取渠道列表
// PUT /api/settings/notification-channels/:id - 更新渠道配置
// POST /api/settings/notification-channels/:id/test - 测试渠道

// GET /api/settings/notification-templates - 获取模板列表
// PUT /api/settings/notification-templates/:id - 更新模板

// GET /api/settings/notification-rules - 获取规则列表
// POST /api/settings/notification-rules - 创建规则
// PUT /api/settings/notification-rules/:id - 更新规则
// DELETE /api/settings/notification-rules/:id - 删除规则

// GET /api/settings/notification-histories - 获取历史记录
// POST /api/settings/notifications/:id/resend - 重新发送

// GET /api/settings/silent-hours - 获取静默时段
// PUT /api/settings/silent-hours - 更新静默时段
```

---

## 四、Mock数据结构

详见 `lib/mock-settings.ts`（待创建）

---

## 五、实施计划

### Phase 1: 数据库迁移
1. 创建上述所有表（DataSource, SyncTask, SyncLog, IPWhitelist, AuditLog, SystemConfig, NotificationChannel, NotificationTemplate, NotificationRule, NotificationHistory, SilentHours）
2. 运行 `prisma migrate dev`
3. 创建种子数据

### Phase 2: 后端API
1. 创建 Server Actions（settings.ts）
2. 实现所有CRUD操作
3. 添加权限校验

### Phase 3: 前端组件
1. 创建通用组件（表格、表单、状态卡片）
2. 实现各Tab页面
3. 集成Mock数据

### Phase 4: 联调测试
1. 前后端联调
2. 功能测试
3. 性能优化

---

## 六、注意事项

1. **敏感配置加密**: DataSource.config、NotificationChannel.config 等敏感字段需要加密存储
2. **审计日志性能**: AuditLog 表数据量大，需要定期归档
3. **通知模板变量**: 模板变量需要文档化，方便用户正确使用
4. **权限控制**: 系统设置页面只有ADMIN角色可访问
5. **操作确认**: 危险操作（清理缓存、删除规则等）需要二次确认

---

**设计者**: AI Assistant  
**审核**: 待田老师审核  
**最后更新**: 2026-03-08
