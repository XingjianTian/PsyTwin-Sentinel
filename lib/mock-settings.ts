/**
 * 系统设置页面 Mock 数据
 */

// ========== 基础设置 ==========
export const mockSystemStatus = {
  platformName: "心图PsyTwin-校园心理健康数字孪生管理平台",
  version: "v0.2.0",
  uptime: "15天3小时24分钟",
  status: "normal", // normal, warning, error
}

export const mockDatabaseStatus = {
  postgresql: {
    status: "connected", // connected, disconnected, error
    responseTime: 12,
    lastBackup: "2026-03-08 02:00:00",
  },
  redis: {
    status: "connected",
    hitRate: 98.5,
  },
}

export const mockSystemResources = {
  cpu: {
    usage: 78,
    cores: 8,
  },
  memory: {
    used: 4.2,
    total: 6.8,
    usage: 62,
  },
  disk: {
    used: 120,
    total: 350,
    usage: 35,
  },
}

export const mockCacheInfo = {
  size: 256 * 1024 * 1024, // 256MB
  logLevel: "INFO", // DEBUG, INFO, WARN, ERROR
}

// ========== 数据同步 ==========
export const mockDataSources = [
  {
    id: "ds-1",
    name: "VR设备数据",
    type: "VR_DEVICE" as const,
    enabled: true,
    lastSyncAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: "CONNECTED" as const,
  },
  {
    id: "ds-2",
    name: "手环监测数据",
    type: "BAND" as const,
    enabled: true,
    lastSyncAt: new Date(Date.now() - 30 * 1000).toISOString(),
    status: "CONNECTED" as const,
  },
  {
    id: "ds-3",
    name: "语音数据",
    type: "AUDIO" as const,
    enabled: true,
    lastSyncAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "CONNECTED" as const,
  },
  {
    id: "ds-4",
    name: "RAG知识库",
    type: "RAG" as const,
    enabled: true,
    lastSyncAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: "CONNECTED" as const,
  },
]

export const mockSyncTasks = [
  {
    id: "task-1",
    name: "VR数据实时同步",
    dataSourceId: "ds-1",
    schedule: "*/5 * * * *",
    enabled: true,
    status: "RUNNING" as const,
    lastSyncAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    nextSyncAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  },
  {
    id: "task-2",
    name: "手环数据批量同步",
    dataSourceId: "ds-2",
    schedule: "0 */1 * * *",
    enabled: true,
    status: "IDLE" as const,
    lastSyncAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    nextSyncAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
  },
  {
    id: "task-3",
    name: "语音数据分析",
    dataSourceId: "ds-3",
    schedule: "0 2 * * *",
    enabled: false,
    status: "PAUSED" as const,
    lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nextSyncAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-4",
    name: "RAG知识库更新",
    dataSourceId: "ds-4",
    schedule: "0 */6 * * *",
    enabled: true,
    status: "ERROR" as const,
    lastSyncAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    nextSyncAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
]

export const mockSyncStats = {
  todayDataSize: 12.5 * 1024 * 1024 * 1024, // 12.5GB
  successRate: 99.2,
  retryCount: 3,
}

export const mockSyncLogs = [
  {
    id: "log-1",
    taskId: "task-1",
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1.5 * 60 * 1000).toISOString(),
    status: "SUCCESS" as const,
    dataSize: 128 * 1024 * 1024, // 128MB
    recordCount: 1523,
  },
  {
    id: "log-2",
    taskId: "task-2",
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 24.5 * 60 * 1000).toISOString(),
    status: "SUCCESS" as const,
    dataSize: 256 * 1024 * 1024,
    recordCount: 3421,
  },
  {
    id: "log-3",
    taskId: "task-4",
    startedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 6.9 * 60 * 60 * 1000).toISOString(),
    status: "FAILED" as const,
    errorMsg: "连接超时，无法连接到Milvus向量数据库",
  },
]

// ========== 安全策略 ==========
export const mockSecuritySettings = {
  passwordComplexity: "MEDIUM",
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 30,
  maxConcurrentSessions: 3,
}

export const mockIPWhitelist = [
  {
    id: "ip-1",
    ipAddress: "127.0.0.1",
    description: "本地开发环境",
    enabled: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ip-2",
    ipAddress: "10.0.0.0/8",
    description: "校园内网",
    enabled: true,
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "ip-3",
    ipAddress: "192.168.1.0/24",
    description: "心理中心办公网",
    enabled: false,
    createdAt: "2026-02-01T00:00:00Z",
  },
]

export const mockAuditLogs = [
  {
    id: "audit-1",
    userId: "user-1",
    userName: "张医生",
    action: "LOGIN",
    resource: "SYSTEM",
    resourceId: null,
    details: { ip: "10.0.1.23" },
    ipAddress: "10.0.1.23",
    status: "SUCCESS" as const,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-2",
    userId: "user-2",
    userName: "李咨询师",
    action: "UPDATE",
    resource: "STUDENT",
    resourceId: "stu-123",
    details: { field: "riskLevel", oldValue: "MEDIUM", newValue: "HIGH" },
    ipAddress: "10.0.1.45",
    status: "SUCCESS" as const,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-3",
    userId: "user-3",
    userName: "王管理员",
    action: "DELETE",
    resource: "USER",
    resourceId: "user-old",
    details: { reason: "离职" },
    ipAddress: "10.0.1.10",
    status: "SUCCESS" as const,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-4",
    userId: "user-4",
    userName: "未知用户",
    action: "LOGIN",
    resource: "SYSTEM",
    resourceId: null,
    details: { ip: "172.16.0.99" },
    ipAddress: "172.16.0.99",
    status: "FAILED" as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockBackupSettings = {
  autoBackupEnabled: true,
  backupFrequency: "DAILY",
  backupRetentionDays: 30,
}

export const mockBackupHistory = [
  {
    id: "backup-1",
    startedAt: "2026-03-08T02:00:00Z",
    endedAt: "2026-03-08T02:15:23Z",
    status: "SUCCESS" as const,
    size: 2.5 * 1024 * 1024 * 1024,
    type: "AUTOMATIC" as const,
  },
  {
    id: "backup-2",
    startedAt: "2026-03-07T02:00:00Z",
    endedAt: "2026-03-07T02:14:15Z",
    status: "SUCCESS" as const,
    size: 2.4 * 1024 * 1024 * 1024,
    type: "AUTOMATIC" as const,
  },
  {
    id: "backup-3",
    startedAt: "2026-03-06T14:30:00Z",
    endedAt: "2026-03-06T14:35:00Z",
    status: "SUCCESS" as const,
    size: 2.4 * 1024 * 1024 * 1024,
    type: "MANUAL" as const,
  },
]

// ========== 通知管理 ==========
export const mockNotificationChannels = [
  {
    id: "channel-1",
    name: "企业微信",
    type: "WECHAT_WORK" as const,
    enabled: true,
    lastTestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    testStatus: "SUCCESS" as const,
  },
  {
    id: "channel-2",
    name: "短信服务",
    type: "SMS" as const,
    enabled: true,
    lastTestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    testStatus: "SUCCESS" as const,
  },
  {
    id: "channel-3",
    name: "邮件服务",
    type: "EMAIL" as const,
    enabled: false,
    lastTestedAt: null,
    testStatus: null,
  },
  {
    id: "channel-4",
    name: "App推送",
    type: "APP_PUSH" as const,
    enabled: true,
    lastTestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    testStatus: "SUCCESS" as const,
  },
]

export const mockNotificationTemplates = [
  {
    id: "template-1",
    name: "高危预警通知",
    type: "WARNING" as const,
    subject: "【心图预警】{{studentName}} 风险等级提升至高危",
    content: "学生 {{studentName}}（{{studentId}}）的风险等级已提升至高危，请及时关注。\n\n预警详情：\n- 风险等级：{{riskLevel}}\n- 触发时间：{{triggerTime}}\n- 建议措施：{{suggestion}}",
    variables: ["studentName", "studentId", "riskLevel", "triggerTime", "suggestion"],
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "template-2",
    name: "危机干预提醒",
    type: "CRISIS" as const,
    subject: "【紧急】{{studentName}} 需要立即干预",
    content: "学生 {{studentName}} 触发危机预警，请立即采取行动！\n\n联系方式：{{phone}}\n位置：{{location}}",
    variables: ["studentName", "phone", "location"],
    updatedAt: "2026-03-05T14:30:00Z",
  },
  {
    id: "template-3",
    name: "预约提醒",
    type: "REMINDER" as const,
    subject: "预约提醒 - {{appointmentTime}}",
    content: "您有一个预约将在 {{appointmentTime}} 开始。\n学生：{{studentName}}\n地点：{{location}}",
    variables: ["appointmentTime", "studentName", "location"],
    updatedAt: "2026-02-20T09:00:00Z",
  },
]

export const mockNotificationRules = [
  {
    id: "rule-1",
    name: "高危预警自动通知",
    enabled: true,
    triggerType: "RISK_LEVEL" as const,
    triggerConfig: { riskLevel: "HIGH" },
    channels: ["channel-1", "channel-2", "channel-4"],
    recipients: ["心理中心负责人", "值班咨询师"],
    silentOverride: true,
    templateId: "template-1",
  },
  {
    id: "rule-2",
    name: "心率异常告警",
    enabled: true,
    triggerType: "HEART_RATE" as const,
    triggerConfig: { min: 100, max: 160 },
    channels: ["channel-1"],
    recipients: ["值班咨询师"],
    silentOverride: false,
    templateId: null,
  },
  {
    id: "rule-3",
    name: "预约前30分钟提醒",
    enabled: false,
    triggerType: "APPOINTMENT" as const,
    triggerConfig: { beforeMinutes: 30 },
    channels: ["channel-4"],
    recipients: ["咨询师", "学生"],
    silentOverride: false,
    templateId: "template-3",
  },
]

export const mockNotificationHistories = [
  {
    id: "history-1",
    ruleId: "rule-1",
    channelType: "WECHAT_WORK" as const,
    recipient: "张医生",
    title: "【心图预警】张三 风险等级提升至高危",
    content: "学生 张三（2023001）的风险等级已提升至高危...",
    status: "READ" as const,
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "history-2",
    ruleId: "rule-1",
    channelType: "SMS" as const,
    recipient: "李咨询师",
    title: "【心图预警】李四 风险等级提升至高危",
    content: "学生 李四（2023002）的风险等级已提升至高危...",
    status: "DELIVERED" as const,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
    readAt: null,
  },
  {
    id: "history-3",
    ruleId: "rule-2",
    channelType: "WECHAT_WORK" as const,
    recipient: "王管理员",
    title: "心率异常告警",
    content: "学生 王五 心率异常（120 BPM），请查看。",
    status: "FAILED" as const,
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deliveredAt: null,
    readAt: null,
  },
]

export const mockSilentHours = {
  enabled: true,
  startTime: "23:00",
  endTime: "07:00",
  exceptLevel: "HIGH",
}
