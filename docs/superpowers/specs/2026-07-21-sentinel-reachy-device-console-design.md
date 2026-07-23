# Sentinel 心宠调试与 Reachy 设备控制台设计

## 目标

在 Sentinel 的“心宠 AI 管理中心”内增加页面级“心宠管理 / 心宠调试”切换，并在“心宠调试”中提供接近 Reachy Mini Control 的设备生命周期与调试能力。设备启动不再依赖 Reachy Mini Control，也不依赖 VPN。

日常目标流程为：

```text
启动 Docker → 打开 Sentinel → 心宠调试 → 启动设备
```

## 已确认的产品边界

第一期实现本地实体 Reachy Mini Lite 的完整调试闭环：

- USB 发现与串口识别。
- `reachy-mini-daemon` 启动、复用、重启和停止。
- 分阶段连接反馈与健康检查。
- 唤醒、休眠、头部归中、天线测试和基础设备控制。
- 表情动作库与手动控制器入口。
- 摄像头、麦克风、扬声器状态和测试。
- USB、daemon、电机、媒体与 Docker 连接日志。
- ClawBody 应用状态、启动入口和当前学生会话状态。

第一期不实现以下依赖外部服务的功能：

- Hugging Face 应用发现与应用商店。
- Hugging Face 账户登录。
- Wi-Fi 首次配置。
- Reachy Control 或 daemon 自动更新。

已安装应用的读取与启动接口可以保留，为后续扩展留出兼容边界。模拟器和 Wi-Fi 设备可以出现在发现界面，但第一期只保证 USB Lite 链路通过验收。

## 视觉与信息架构

### 页面级切换

将“心宠 AI 管理中心”页头右侧现有的 Reachy 状态徽标替换为分段切换器：

```text
[ 心宠管理 ] [ 心宠调试 ]
```

- “心宠管理”保留当前学生列表、心宠画像、对话记录、实时联调和性格配置。
- “心宠调试”替换主内容区域，但不创建新的侧边栏菜单或 URL。
- 两个面板共享同一设备与会话状态。切换面板不会停止机器人、daemon 或学生会话。

### 视觉方向

功能结构参考 Reachy Mini Control，视觉样式服从 Sentinel：

- 使用 Sentinel 的浅灰页面背景、白色卡片、细边框和圆角。
- 紫色用于主操作、选中状态和关键入口。
- 绿色用于设备健康、连接成功和 Ready 状态。
- 危险操作使用克制的红色，并要求确认。
- 不复制 Reachy Mini Control 的黑色背景和橙色主题。

已确认的高保真原型保留以下 Reachy Control 结构：机器人主视图、USB/daemon 状态、连接阶段、应用卡片、快捷动作、音频卡片和实时日志。

## 页面状态

### 1. 设备发现

进入“心宠调试”后，页面通过 Sentinel 服务端查询 Windows Host Bridge：

- 显示检测到的 Reachy Mini Lite 和串口，例如 `Reachy Mini Lite · COM5`。
- 保留 Wi-Fi、模拟器和手动 IP 的视觉入口，但未实现的入口明确标记状态。
- 没有检测到 USB 时显示电源、数据线和 Windows 设备管理器排查指引。
- 找到多个候选串口时要求用户选择，不自动猜测。

### 2. 设备启动

点击“启动设备”后展示四阶段进度：

```text
启动 daemon → 连接机器人 → 健康检查 → 加载应用
```

每个阶段具有 `pending`、`running`、`success` 和 `error` 状态。错误固定在失败阶段，并提供简短原因、重试按钮和展开日志入口。启动成功后自动进入设备主页。

### 3. 设备主页

设备主页使用两列主布局：

- 左侧：机器人主视图、电源、设置、Ready 状态、摄像头小窗、设备名称、USB/串口、版本信息。
- 右侧：ClawBody 应用、表情动作库、机器人控制器和设备操作。
- 底部：扬声器、麦克风和实时日志。

设备操作包括：

- 唤醒。
- 休眠。
- 头部归中。
- 天线测试。
- 重启 daemon。
- 停止设备。

当前有学生会话时，应用卡片显示学生、运行状态和“返回实时联调”入口。

## 系统架构

### 组件边界

#### Sentinel 浏览器页面

- 渲染页面切换、设备发现、启动进度、设备主页和错误反馈。
- 只访问 Sentinel 同源 API。
- 不直接访问 Host Bridge、ClawBody 或 Reachy daemon。

#### Sentinel 服务端 API

- 校验用户输入并代理预定义设备操作。
- 使用 `127.0.0.1` 访问 Windows Host Bridge。
- 使用现有 `CLAWBODY_SERVICE_URL` 访问 Docker ClawBody 服务。
- 聚合 Host Bridge、daemon 和 ClawBody 状态，返回给浏览器。
- 不接受任意命令、可执行文件路径或 shell 参数。

#### ClawBody Host Bridge

Host Bridge 是 Windows 宿主机上的轻量 Python 服务，随当前用户登录自动隐藏运行，只监听 `127.0.0.1`。

职责：

- 枚举 Reachy USB 串口。
- 管理唯一的 `reachy-mini-daemon.exe` 子进程。
- 保存结构化状态和受限长度日志。
- 检查 `localhost:8000` daemon API。
- 执行预定义唤醒、休眠、媒体检查与基础控制操作。
- 对日志中的密钥、令牌和敏感环境变量进行脱敏。

Host Bridge 不负责 LLM、ASR/TTS、学生身份和对话数据。

#### Reachy daemon

- 在 Windows 宿主机管理 USB、电机、摄像头和音频。
- 默认监听 `localhost:8000`。
- 由 Host Bridge 管理生命周期，不再由 Reachy Mini Control 管理。

#### Docker ClawBody

- 继续运行唯一的 `clawbody-service` 容器。
- 继续通过 `host.docker.internal:8000` 连接宿主机 daemon。
- 负责学生会话、ASR、LLM、TTS、动作编排和实时记录。

### 控制链路

```text
Sentinel 页面
  → Sentinel 同源 API
  → 127.0.0.1 Host Bridge
  → reachy-mini-daemon.exe
  → localhost:8000
  → Docker ClawBody via host.docker.internal:8000
  → Reachy Mini Lite
```

Host Bridge 需要一次性安装为当前用户登录后的隐藏启动任务。Docker Compose 不尝试从 Linux 容器启动 Windows 可执行文件，也不直接映射 Windows COM/USB。

## 状态模型

统一设备状态为：

```text
offline
  → discovering
  → starting
  → connecting
  → healthchecking
  → loading_apps
  → ready
  → stopping
  → offline
```

任一活动状态都可以进入 `error`。错误状态保留失败阶段、稳定错误码、用户可读消息和脱敏日志摘要。

状态要求：

- 启动、停止和重启操作幂等。
- 同一时间只允许一个生命周期操作。
- 重复启动复用已有任务或已运行 daemon，不创建第二个进程。
- 发现 `8000` 已监听时先验证 daemon 身份；确认是兼容 Reachy daemon 后复用，否则报告端口冲突。
- 页面刷新后能从 Host Bridge 恢复真实状态，不依赖浏览器内存。

## 会话与设备停止语义

- “心宠管理”中的“停止”只结束学生对话，daemon 保持 Ready。
- “心宠调试”中的“休眠”让机器人休眠，但 daemon 保持运行。
- “心宠调试”中的“停止设备”关闭 daemon。
- 有学生会话时停止设备必须二次确认，并按顺序停止 ClawBody 会话、让机器人休眠、关闭 daemon。
- 任一步失败都继续执行安全收尾，并将未完成步骤显示在结果中。

## 错误处理

### USB 未检测到

显示电源、数据线、串口驱动和设备管理器检查提示。USB 数据线不被描述为电机电源替代品。

### daemon 启动失败

显示退出码、稳定错误码和末尾脱敏日志；提供重试和复制诊断信息，不自动无限重启。

### 端口冲突

验证 `8000` 服务是否为 Reachy daemon。兼容实例被复用；其他进程占用时不强制终止进程。

### 电机异常

页面允许进入诊断状态并查看日志，但禁用动作、控制器和唤醒操作。

### 媒体异常

电机控制继续可用；摄像头、麦克风或扬声器分别显示降级状态，不把整个设备标记为离线。

### Docker 或 ClawBody 不可用

设备启动与基础硬件调试继续可用；ClawBody 应用卡片显示未连接，学生会话入口禁用。

## 安全约束

- Host Bridge 只监听 `127.0.0.1`。
- Sentinel 服务端与 Host Bridge 使用独立服务密钥。
- 浏览器不接触服务密钥。
- API 使用固定动作枚举，不接收 shell 命令。
- 可执行文件路径来自安装配置，不来自请求。
- 日志限制条数和单条长度，并脱敏 API key、token、authorization header 和环境变量值。
- 停止操作只针对 Host Bridge 启动并记录的 daemon PID；不会按进程名批量终止。

## 测试策略

### 自动测试

- Host Bridge 状态机、幂等启动、幂等停止和并发锁。
- USB 零设备、单设备和多设备选择。
- 已有兼容 daemon 复用和非 Reachy 端口冲突。
- 子进程异常退出、启动超时和健康检查失败。
- 日志长度限制与敏感信息脱敏。
- Sentinel API 鉴权、参数校验、代理和错误映射。
- 前端页面切换、设备状态、连接进度和危险操作确认。
- ClawBody 与 Sentinel 现有测试和生产构建。

### 无硬件集成测试

使用假的 daemon 进程模拟成功、超时、端口冲突、电机失败、媒体降级和日志输出，不依赖实体机器人。

### 实体设备验收

1. 关闭 VPN并完全退出 Reachy Mini Control。
2. 启动 Docker 与 Sentinel。
3. 进入“心宠调试”，确认识别 USB。
4. 点击启动并完成四阶段进度。
5. 验证唤醒、休眠、归中、天线、表情、控制器、扬声器、麦克风和摄像头。
6. 切换到“心宠管理”并启动测试学生对话。
7. 停止对话，确认 daemon 保持 Ready。
8. 返回“心宠调试”停止设备，确认机器人休眠且 `8000` 不再监听。

## 安装、配置与运维

提供以下一次性能力：

- 安装 Host Bridge 当前用户登录启动任务。
- 检查 Host Bridge 状态。
- 重启 Host Bridge。
- 卸载 Host Bridge 登录启动任务。

安装过程不得修改 Reachy Mini Control，也不删除其文件。Reachy Mini Control 与 Host Bridge 不应同时管理同一 USB 设备；页面检测到冲突时必须提示用户退出 Reachy Mini Control。

## 交付范围

### ClawBody 仓库

- Windows Host Bridge 入口、进程管理、状态机和受保护 API。
- 安装、状态检查、重启和卸载命令。
- 假 daemon 测试与实体设备操作文档。
- Docker ClawBody 状态与 Host Bridge 的兼容配置。

### Sentinel 仓库

- 页面级“心宠管理 / 心宠调试”切换。
- 设备发现、连接进度和设备主页。
- Sentinel 服务端 Host Bridge 客户端与设备 API。
- 状态聚合、错误映射和自动测试。
- OpenSpecs/PRD 状态同步。

## 验收标准

- [ ] 关闭 VPN 和 Reachy Mini Control 后，Sentinel 能发现 USB Reachy Mini Lite。
- [ ] 点击“启动设备”只启动一个 daemon，并正确展示四阶段进度。
- [ ] 设备主页能展示 daemon、USB、电机、媒体和 Docker/ClawBody 状态。
- [x] 基础设备控制、媒体测试、完整表情动作库和控制器已完成代码接通。*(已于 2026-07-23 接入 81 个表情、20 个官方舞蹈和 14 个音乐舞蹈，并通过 Sentinel/Host Bridge 双层白名单与无硬件回归测试；实体动作仍需人工连机验收)*
- [ ] 心宠管理与心宠调试切换不会破坏设备或会话状态。
- [ ] 测试学生能够启动和停止 ClawBody 实体对话。
- [ ] 停止对话不关闭 daemon；停止设备会安全休眠并关闭 daemon。
- [ ] 设备启动链路不访问 Hugging Face、GitHub 或 OpenAI。
- [ ] 自动测试、Sentinel 生产构建和实体设备验收全部通过。

### 2026-07-21 验证记录

- [x] 代码与无硬件自动验证：最终重跑的 Sentinel Reachy 聚焦测试命令通过 63 项，独立的 Reachy 队列/状态测试命令通过 9 项，122 项 ClawBody 回归测试通过；Reachy 目标 TypeScript 严格检查通过；ESLint 退出码为 `0`（全仓保留 238 条既有 warning）；Next.js 生产构建退出码为 `0`。
- [x] 安全只读联调：ClawBody `http://127.0.0.1:7860/health` 返回健康；Sentinel 在 `127.0.0.1:3000` 响应请求。本次未发送设备启停、动作、音频或摄像头请求，也未创建或修改 Windows 计划任务。
- [ ] 全仓 TypeScript 验证：`npx tsc --noEmit --incremental false` 在任务前已存在的 `prisma/backups/seeds/seed-pocket-data-test.ts:1309` 遇到 `TS1128`；生产构建另外明确输出 `Skipping validation of types`。
- [ ] 浏览器视觉验收与截图：本次没有可复用的已登录 Sentinel 会话，因此未在 1367×614 和 1440×900 下验证四种设备状态，也未保存计划中的三张截图。
- [ ] 实体设备八步验收：Host Bridge 当前未安装或不可查询，`127.0.0.1:7861` 也未监听，所以未执行 USB 识别、四阶段启动、电机/音频/摄像头、学生会话、仅停止对话或完整停止设备验收。

### 2026-07-23 表情与动作库验证记录

- [x] 心宠调试左栏的重复设备概览已替换为“表情与动作”，支持表情/舞蹈分类、完整动作库展开与执行状态反馈；重复的快捷动作卡已移除。
- [x] Sentinel 仅接受固定类型与动作白名单，Host Bridge 再次校验并映射到固定 daemon recorded-move dataset；路径穿越、跨类型动作和额外命令字段均被拒绝。
- [x] Sentinel 聚焦测试 58 项、Host Bridge 聚焦测试 61 项、Python Ruff/Mypy 和 Next.js 生产构建通过；未触发实体心宠动作。
- [x] 已在登录态浏览器中验证 Ready 控制台：表情 81 项、舞蹈 34 项、分类切换、“常规操控”布局和页面控制台均正常；验收过程未点击任何实体动作。
- [x] Host Bridge 重启后复用已运行 daemon 时会恢复完整电机与媒体快照，不再出现设备实际为 `enabled`、页面却显示“未知”的状态漂移。*(已于 2026-07-23 通过 111 项 Host Bridge 回归测试与实时只读状态检查)*
- [x] Sentinel 服务端固定 Host Bridge 路径白名单已纳入 `/v1/device/choreography`，网页表情请求不再被代理层提前拒绝。*(已于 2026-07-23 通过真实浏览器“喜爱”表情链路复测，页面无失败提示、控制台无错误；48 项 Sentinel 聚焦测试与生产构建通过)*
- [x] 表情动作兼容当前数据集的 `.ogg` 音频：Host Bridge 在播放动作后从固定本地数据集解析同名音频并同步交给 daemon 扬声器，补偿 daemon 1.8.0 仅识别 `.wav` 的兼容缺口。*(已于 2026-07-23 通过 112 项 Host Bridge 回归测试；官方舞蹈数据集本身不含音频)*
- [x] Ready 控制台移除重复“常规操控”卡，重排为左侧主表情动作区、右侧姿态控制与音频联调区，并统一列宽、卡片密度和音量控件层级。*(已于 2026-07-23 通过聚焦测试、生产构建及 1367×614 浏览器验收，控制台无错误)*
- [x] 表情与动作列表使用固定高度纵向滑动条浏览全部项目，移除展开/收起按钮，避免动作库切换时改变整页高度。*(已于 2026-07-23 通过聚焦测试、生产构建与浏览器滚动验收，控制台无错误)*
- [x] 音频控制区移除重复标题说明，左侧表情动作卡纵向撑满并与右侧音频控制卡底部对齐。*(已于 2026-07-23 通过浏览器边界测量，双栏底部偏差为 0px，动作列表保持内部滚动；生产构建与控制台检查通过)*
- [ ] 实体心宠表情与舞蹈连机验收。*(需要重启 Host Bridge 载入新路由后，由用户在设备旁逐项验证)*
