# 🤝 PsyTwin 跨端 API 契约 (OpenSpecs)

> **核心原则**：本文档是 Sentinel 后端与 Pocket 小程序端通信的**唯一事实真相**。两端的 AI 智能体在进行网络层开发时，必须严格以此文档为准。

## 1. 全局规范
- **Base URL (开发环境)**: `http://localhost:3000`
- **数据返回统一信封格式**:
  ```json
  {
    "success": true,        // 业务是否成功
    "message": "操作成功",  // 提示信息
    "data": {}              // 实际业务数据载荷
  }

## 2. 数据模型契约

### 2.1 Appointment（预约咨询）

#### 数据库模型
```prisma
model Appointment {
  id              String            // UUID
  studentId       String            // 学生ID
  teacherId       String?           // 咨询师ID（可选）
  roomId          String?           // 咨询室ID（可选）
  type            AppointmentType   // COUNSELING | VR | GROUP
  date            DateTime          // 预约日期
  timeSlot        String            // 时段，格式 "HH:mm-HH:mm"，如 "09:00-09:50"
  status          AppointmentStatus // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
  reason          String?           // 咨询主题/备注
  cancelReason    String?           // 取消原因
  meetingLink     String?           // 线上会议链接（视频咨询）
  feedbackScore   Int?              // 评价分数（1-5）
  feedbackContent String?           // 评价内容
  createdAt       DateTime          // 创建时间
  updatedAt       DateTime          // 更新时间
}
```

#### 时段格式转换方案

**数据库层**: 使用 `time_slot` 字段存储字符串，格式 `"09:00-10:00"`
**API 层**: 自动转换为 `startTime` / `endTime` 返回给前端

**API 响应示例**:
```json
{
  "id": "apt-xxx",
  "studentId": "stu-xxx",
  "teacherId": "teacher-xxx",
  "type": "COUNSELING",
  "date": "2026-03-15",
  "startTime": "09:00",           // 从 timeSlot 解析
  "endTime": "09:50",             // 从 timeSlot 解析
  "status": "CONFIRMED",
  "reason": "焦虑情绪咨询",
  "meetingLink": null,
  "feedbackScore": null,
  "feedbackContent": null,
  "createdAt": "2026-03-10T08:30:00Z"
}
```

**创建/更新请求示例**:
```json
{
  "teacherId": "teacher-xxx",
  "type": "COUNSELING",
  "date": "2026-03-15",
  "startTime": "09:00",
  "endTime": "09:50",
  "reason": "焦虑情绪咨询"
}
// API 层转换：startTime + endTime → timeSlot = "09:00-09:50"
```

#### 枚举定义

**AppointmentType**:
- `COUNSELING` - 心理咨询
- `VR` - VR体验
- `GROUP` - 团体辅导

**AppointmentStatus**:
- `PENDING` - 待确认
- `CONFIRMED` - 已确认
- `COMPLETED` - 已完成
- `CANCELLED` - 已取消
- `NO_SHOW` - 未到场

## 3. API 端点

### 3.1 预约管理

#### GET /api/pocket/appointments
获取当前学生的预约列表

**Query Parameters**:
```typescript
{
  status?: string;      // 按状态筛选
  page?: number;        // 页码，默认 1
  limit?: number;       // 每页数量，默认 20
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    appointments: Array<AppointmentDTO>,
    total: number,
    page: number,
    totalPages: number
  }
}
```

#### GET /api/pocket/appointments/:id
获取预约详情

**Response**:
```typescript
{
  success: true,
  data: AppointmentDTO
}
```

#### POST /api/pocket/appointments
创建预约

**Request Body**:
```typescript
{
  teacherId: string;      // 咨询师ID
  type: AppointmentType;  // 预约类型
  date: string;           // 日期，格式 YYYY-MM-DD
  startTime: string;      // 开始时间，格式 HH:mm
  endTime: string;        // 结束时间，格式 HH:mm
  reason?: string;        // 咨询主题
  roomId?: string;        // 咨询室ID（可选）
}
```

**Response**:
```typescript
{
  success: true,
  message: "预约创建成功",
  data: AppointmentDTO
}
```

#### PATCH /api/pocket/appointments/:id
更新预约（取消、修改等）

**Request Body**（部分字段）:
```typescript
{
  status?: AppointmentStatus;    // 修改状态
  cancelReason?: string;         // 取消原因
  meetingLink?: string;          // 线上会议链接
  feedbackScore?: number;        // 评价分数
  feedbackContent?: string;      // 评价内容
}
```

## 4. 字段映射表

| API 字段 | 数据库字段 | 说明 |
|----------|-----------|------|
| `startTime` | `time_slot` (解析前半部分) | API 层转换 |
| `endTime` | `time_slot` (解析后半部分) | API 层转换 |
| `meetingLink` | `meeting_link` | 直接映射 |
| `feedbackScore` | `feedback_score` | 直接映射 |
| `feedbackContent` | `feedback_content` | 直接映射 |

---

*文档版本: v1.0 | 更新日期: 2026-03-06*