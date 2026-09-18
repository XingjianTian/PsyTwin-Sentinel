# Sentinel `demo_pet` 实时同步设计

**日期：** 2026-07-22
**状态：** 已实施并完成本地核心联调

## 目标

在学生 `stu-test` 的“Ta 的心宠”页面固定观察本地心宠服务中的 `demo_pet`，实时展示小程序与 Unity 共用的心宠状态。页面同步心情、能量、社交、当前活动和所在场景，并使用与小程序一致的心宠动画帧及场景背景。

## 范围

- 仅将 Sentinel 的 `stu-test` 心宠页面固定映射到 `demo_pet`，不设计通用学生与心宠账号绑定机制。
- 读取 PsyTwin-Pocket 本地服务已经发布的 `pet_status`，不新增或修改 Pocket、Unity 的写入协议。
- “心宠位置”表示当前 `sceneId` 及其对应背景。现有 F9 演示不发送场景内 `x/y`，因此本期不展示伪造的坐标同步。
- 本地服务默认地址为 `ws://127.0.0.1:13002/ws/pet`，允许通过公开环境变量覆盖。
- 非 `stu-test` 学生继续展示 Sentinel 数据库快照，不连接 `demo_pet`。

## 现有链路

PsyTwin-Pocket 本地服务已经维护 `demo_pet` 的权威实时状态，并在 WebSocket 建连后立即发送一次 `pet_status`。之后每次状态变化都会广播同类型消息。

F9 演示会执行以下场景序列：

1. 将 `demo_pet` 切换到 `picnic_lawn`。
2. 约 3 秒后切换到 `psychological_room`。
3. 每次切换都会增加 `stateVersion`、更新 `updatedAt` 并广播 `pet_status`。

## 方案选择

采用浏览器直接连接本地 WebSocket：

```text
PsyTwin-Pocket local server :13002
              │ pet_status
              ▼
Sentinel stu-test pet page :3000
              │
              ├─ mood / energy / social
              ├─ sceneId / activity
              └─ scene background / pet animation
```

未采用轮询，因为它会引入额外延迟、请求开销和 HTTP 跨域配置。未采用 Sentinel 服务端代理，因为远程或容器化的 Sentinel 服务端无法可靠访问用户电脑上的 `127.0.0.1`。

## 客户端结构

### 实时状态适配器

新增纯函数模块，负责：

- 校验 WebSocket 消息形状。
- 将 Pocket 的 `social` 映射为页面的 `sociability`。
- 将数值限制在 `0..100`。
- 只接受比当前 `stateVersion` 更新或相等的初始状态，避免乱序消息覆盖新状态。
- 将 `sceneId` 映射为中文场景名、背景资源和合理的展示位置。

纯函数独立测试，不依赖 React 或真实 WebSocket。

### WebSocket Hook

新增客户端 Hook：

- 仅在启用时建立连接。
- 连接 URL 固定携带 `userId=demo_pet&clientType=sentinel`。
- 接收建连后的首个 `pet_status` 和后续广播。
- 定时发送 `heartbeat`。
- 异常断开后指数退避重连，并在卸载时清理 socket、心跳和重连计时器。
- 暴露 `connecting`、`live`、`reconnecting`、`offline` 四种连接状态和最后更新时间。

### 页面合并策略

- 页面仍先读取数据库中的 `StudentPetSnapshot`，保证首屏和降级状态可用。
- `stu-test` 收到实时状态后，只覆盖 mood、energy、sociability、activity、scene、实时场景 ID 和服务端活动日志，不写回 Sentinel 数据库。
- 服务端 `activityLog` 按时间重建场景上下文，最近 6 条场景切换、行为事件和状态变化以倒序展示；事件缺少显式场景时沿用它之前最近一次 `scene_change` 的地点。
- 日志列表参考“微信小程序看板”的动态信息流方式：服务端产生新日志时，新项从顶部进入，既有日志整体向下让位，最旧项从底部退出；最新项突出显示，系统启用 `prefers-reduced-motion` 时取消位移动画。
- 其他外观文本继续来自数据库快照；服务端未返回有效日志时保留原有日志作为降级内容。
- 本地服务断开时保留最后一次成功状态，并显示离线提示；首次连接失败时使用数据库值。

## 视觉与资源

- 将小程序实际使用的 45 张主心宠动画采样帧复制到 Sentinel 静态资源目录，并以相同的 1000ms 帧间隔循环。
- 将小程序 `static/scenes` 中的场景背景复制到 Sentinel，按 `sceneId` 选择背景。
- 背景使用 `object-cover`，心宠使用透明 PNG、像素化渲染和绝对定位；背景改变时心宠保持在卡片内可见区域。
- 场景名称徽标随 `sceneId` 更新。
- 在“只读观察”附近显示精简同步状态，不改变页面现有信息架构、URL、导航或品牌样式。
- 尊重 `prefers-reduced-motion`：开启减少动态效果时停在第一帧并禁用浮动动画。

## 配置

新增仅需维护 IP 的环境变量：

```dotenv
NEXT_PUBLIC_PET_SYNC_HOST="192.168.0.105"
```

代码固定拼接端口 `13002` 与路径 `/ws/pet`，未配置时回退到 `127.0.0.1`。若 Sentinel 页面通过 HTTPS 打开，必须改用高级覆盖项 `NEXT_PUBLIC_PET_SYNC_WS_URL` 配置完整的 `wss://` 地址，避免浏览器阻止混合内容。

## 错误处理

- 无效 JSON、非 `pet_status` 消息或字段不完整的状态不会覆盖当前页面。
- 单个字段无效时保留上一份有效值。
- 背景资源缺失时回退到默认 `bedroom` 场景背景。
- WebSocket 断开不会清空数据；UI 显示重连或离线状态。
- 页面卸载后不再重连，不遗留定时器。

## 测试与验收

- [x] 纯函数测试覆盖状态解析、`social` 映射、数值限制、版本防乱序、场景回退和带地点的活动日志转换。*(已于 2026-07-22 通过 8 项 Sentinel 自动化测试)*
- [x] `npm run build` 构建通过。*(已于 2026-07-22 验证)*
- [ ] 全仓 `npx tsc --noEmit` 无错误。*(现被既有文件 `prisma/backups/seeds/seed-pocket-data-test.ts:1309` 的语法错误阻断，与本次改动无关)*
- [x] 未启动本地心宠服务时，页面仍显示数据库快照并提示连接状态。*(已于 2026-07-22 验证数据库数值 64/70/70 正常保留)*
- [x] 启动本地服务后，页面自动进入实时同步状态。*(已于 2026-07-22 本地联调通过)*
- [x] `demo_pet` 的 mood、energy、social 变化能更新三条指标。*(已于 2026-07-22 观察到服务端 18/22/49 后页面持续更新为 16/22/51)*
- [x] 按 F9 后，页面消费相同 `pet_status` 场景广播；既有 F9 序列先到“野餐草坪”，约 3 秒后到“心理咨询室”。*(已于 2026-07-22 通过 Pocket 20 项同步与 F9 自动化测试)*
- [x] 页面展示的小宠物与小程序使用同一组动画帧。*(已于 2026-07-22 校验 45 张原始 PNG 帧)*
- [x] 页面日志与服务端 `activityLog` 对应，能显示心宠到达的场景、发生的行为和三项状态变化。*(已于 2026-07-22 完成解析测试与浏览器联调)*
- [x] 心宠日志按实时信息流方向运动，新项顶部进入、旧项向下移动，最新动态突出显示。*(已于 2026-07-22 完成浏览器动效验证并保存 `screenshots/demo-pet-live-feed-2026-07-22.png`)*
- [ ] 断开并恢复本地服务后，页面自动重连并获取最新状态。
- [x] Playwright 截图确认背景裁切、心宠位置、状态条和同步提示正常。*(已于 2026-07-22 保存 `screenshots/demo-pet-live-sync-2026-07-22.png`)*
- [x] 浏览器控制台无关键错误。*(已于 2026-07-22 验证)*

## 非目标

- 不修改 F9 演示逻辑。
- 不向 Pocket 服务写入状态。
- 不将实时状态持久化到 Sentinel 数据库。
- 不实现通用账号绑定、鉴权或生产环境中继服务。
- 不模拟当前协议没有提供的场景内 `x/y` 坐标。
