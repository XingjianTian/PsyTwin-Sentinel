# 心宠调试与 Reachy Mini 实时联调完整配置教程

本文档用于指导一台新的 Windows 电脑，从零配置以下完整链路：

- 在 Windows 宿主机上通过 USB 连接 Reachy Mini Lite。
- 不打开 Reachy Mini Control，由 ClawBody Host Bridge 发现、启动和控制设备。
- 使用 Docker 运行 ClawBody 对话服务。
- 使用 PsyTwin Sentinel 的“心宠调试”完成设备启动、动作和音频调试。
- 从“心宠调试”进入“实时联调”，完成百度 ASR、阿里云模型、百度 TTS 和 Reachy 动作联动。

> 本文命令默认在 Windows PowerShell 中执行。除非特别说明，不要使用管理员 PowerShell。

## 1. 最终运行结构

完整链路由三个进程组成：

```text
浏览器
  │
  │ http://localhost:3000
  ▼
PsyTwin Sentinel（Next.js）
  ├── http://127.0.0.1:7861 ──► Windows Host Bridge
  │                                  ├── 发现 USB/COM 设备
  │                                  ├── 启动 Reachy daemon
  │                                  └── 执行动作、姿态、音量和关机命令
  │
  └── http://127.0.0.1:7860 ──► Docker ClawBody 服务
                                     ├── 阿里云 DashScope/Qwen
                                     ├── 百度 ASR
                                     ├── 百度 TTS
                                     └── 双层 AI 对话编排

Windows Host Bridge
  └── http://127.0.0.1:8000 ──► Reachy Mini daemon
                                      └── USB/COM ──► Reachy Mini Lite
```

### 1.1 端口用途

| 端口 | 服务 | 是否应暴露到公网 |
|---|---|---|
| `3000` | Sentinel Web 页面与服务端 API | 按 Sentinel 部署方案决定 |
| `7860` | Docker 中的 ClawBody 服务 | 否，默认只绑定本机 |
| `7861` | Windows Host Bridge | 否，必须保持 `127.0.0.1` |
| `8000` | Reachy Mini daemon | 否，仅供本机和 Docker 访问 |

### 1.2 两组密钥

系统使用两组不同的内部服务密钥：

| 用途 | ClawBody `.env` | Sentinel `.env` |
|---|---|---|
| Sentinel 调用 ClawBody | `SERVICE_API_KEY` | `CLAWBODY_SERVICE_KEY` |
| Sentinel 调用 Host Bridge | `HOST_BRIDGE_API_KEY` | `HOST_BRIDGE_API_KEY` |

必须满足：

```text
ClawBody SERVICE_API_KEY == Sentinel CLAWBODY_SERVICE_KEY
ClawBody HOST_BRIDGE_API_KEY == Sentinel HOST_BRIDGE_API_KEY
```

两组密钥彼此不要相同，也不要使用示例占位值。

## 2. 准备条件

### 2.1 硬件

- Reachy Mini Lite。
- 可传输数据的 USB 线；只支持充电的 USB 线无法发现设备。
- Windows 电脑。
- 机器人电源正常接通。

### 2.2 软件

建议提前安装：

- Windows 10 或 Windows 11。
- Git。
- Python 3.11，建议使用 Python 官方安装器。
- Node.js 20 或项目当前约定的 Node.js 版本。
- npm。
- Docker Desktop。
- PostgreSQL，或者 Sentinel 已有的可用 PostgreSQL 数据库。

检查版本：

```powershell
git --version
py -3.11 --version
node --version
npm --version
docker --version
docker compose version
```

如果 `py -3.11 --version` 找不到 Python，请重新安装 Python 3.11，并在安装器中启用 Python Launcher。

### 2.3 云服务凭据

实时语音对话需要：

- 阿里云百炼 DashScope API Key，用于 Qwen 对话模型。
- 百度智能云语音应用的 App ID、API Key 和 Secret Key，用于 ASR/TTS。

只使用“心宠调试”中的 USB 发现、启动、动作和关机功能时，不需要上述云服务凭据，也不需要 VPN。实时对话需要电脑能够访问阿里云和百度接口；如果所在网络阻止这些接口，才需要按照所在单位的网络要求配置代理或 VPN。

## 3. 拉取功能分支

本文对应两个仓库的 `codex/current-reachy-work` 分支。

如果尚未克隆：

```powershell
cd C:\项目目录

git clone git@github.com:XingjianTian/clawbody-minimax.git
git clone git@github.com:XingjianTian/PsyTwin-Sentinel.git

cd .\clawbody-minimax
git fetch origin
git switch --track origin/codex/current-reachy-work

cd ..\PsyTwin-Sentinel
git fetch origin
git switch --track origin/codex/current-reachy-work
```

如果仓库已经存在且本地已经有该分支：

```powershell
cd C:\项目目录\clawbody-minimax
git switch codex/current-reachy-work
git pull

cd C:\项目目录\PsyTwin-Sentinel
git switch codex/current-reachy-work
git pull
```

## 4. 配置 ClawBody Python 环境

以下命令在 `clawbody-minimax` 根目录执行。

### 4.1 创建虚拟环境

```powershell
cd C:\项目目录\clawbody-minimax
py -3.11 -m venv .venv
```

激活环境：

```powershell
.\.venv\Scripts\Activate.ps1
```

如果 PowerShell 提示禁止运行脚本，只针对当前用户设置合理的执行策略：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

重新打开普通 PowerShell，再激活虚拟环境。

### 4.2 安装依赖

```powershell
python -m pip install --upgrade pip
pip install reachy-mini==1.8.0
pip install -e ".[dev,mediapipe_vision]"
```

验证命令入口：

```powershell
clawbody-host --help
clawbody-host-bridge --help
```

如果命令找不到，可以直接使用虚拟环境内的完整路径：

```powershell
.\.venv\Scripts\clawbody-host.exe --help
```

## 5. 配置 ClawBody `.env`

### 5.1 创建本地配置

```powershell
Copy-Item .env.example .env
```

`.env` 只保存在本机，不要提交到 Git，也不要发到群聊、Issue 或截图中。

### 5.2 生成两组随机密钥

连续执行两次，保存两次不同的输出：

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

例如将第一组用于 `SERVICE_API_KEY`，第二组用于 `HOST_BRIDGE_API_KEY`。不要复制本文中的示例文字作为真实密钥。

### 5.3 推荐配置模板

编辑 `clawbody-minimax\.env`：

```dotenv
# ===== 阿里云 DashScope / Qwen =====
# MINIMAX_* 是项目历史兼容命名，当前实际连接的是 DashScope。
MINIMAX_API_KEY=填写你的DashScope_API_Key
MINIMAX_MODEL=qwen-plus
MINIMAX_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MINIMAX_MAX_TOKENS=80

# ===== 百度 ASR/TTS =====
BAIDU_APP_ID=填写百度语音应用AppID
BAIDU_API_KEY=填写百度语音APIKey
BAIDU_SECRET_KEY=填写百度语音SecretKey
BAIDU_TTS_PER=111
BAIDU_TTS_SPD=5
BAIDU_TTS_PIT=5
BAIDU_TTS_VOL=12
BAIDU_ASR_LANGUAGE=zh-CN

# ===== Docker ClawBody 服务 =====
SERVICE_HOST=127.0.0.1
SERVICE_PORT=7860
SERVICE_API_KEY=第一组随机长密钥

# ===== Windows Host Bridge =====
HOST_BRIDGE_HOST=127.0.0.1
HOST_BRIDGE_PORT=7861
HOST_BRIDGE_API_KEY=第二组随机长密钥
HOST_BRIDGE_DAEMON_URL=http://127.0.0.1:8000
HOST_BRIDGE_CLAWBODY_HEALTH_URL=http://127.0.0.1:7860/health
```

说明：

- `.env` 保持 `SERVICE_HOST=127.0.0.1`；Docker Compose 会在容器内自动覆盖为 `0.0.0.0:7860`，再发布到 Windows 的 `127.0.0.1:7860`，不需要手动修改。
- `HOST_BRIDGE_HOST` 必须保持 `127.0.0.1`。
- Host Bridge 会拒绝空密钥和 `.env.example` 中的占位密钥。
- 如果当前 `.env.example` 还包含其他业务变量，保留它们并按实际部署填写。

## 6. 安装 Windows Host Bridge

Host Bridge 必须运行在 Windows 宿主机，而不是 Docker 容器里，因为它需要访问本机 USB/COM 设备。

### 6.1 安装登录任务

保持 ClawBody 虚拟环境已激活：

```powershell
clawbody-host install
clawbody-host restart
clawbody-host status
```

该命令会创建或更新当前 Windows 用户的计划任务：

```text
PsyTwin ClawBody Host Bridge
```

任务会在当前用户登录 Windows 后自动运行。一般只需要安装一次。

### 6.2 不激活虚拟环境时管理任务

```powershell
C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe status
C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe restart
```

### 6.3 检查公共健康接口

```powershell
Invoke-RestMethod http://127.0.0.1:7861/health
```

只要 Host Bridge 进程正常，该接口就应该返回健康结果。它不会启动机器人，也不会移动机器人。

### 6.4 检查带鉴权的设备接口

```powershell
$hostBridgeKey = Read-Host "HOST_BRIDGE_API_KEY"
$headers = @{"X-Host-Bridge-Key" = $hostBridgeKey}

Invoke-RestMethod http://127.0.0.1:7861/v1/device/status -Headers $headers
Invoke-RestMethod http://127.0.0.1:7861/v1/device/discover -Headers $headers
```

输入的是 ClawBody `.env` 中的 `HOST_BRIDGE_API_KEY`。PowerShell 的 `Read-Host` 可以避免把密钥直接写进命令历史。

### 6.5 前台诊断模式

只有在排查计划任务问题时才使用前台模式。先确保计划任务实例已经停止，避免同时启动两个 Host Bridge：

```powershell
clawbody-host-bridge
```

诊断结束后关闭前台进程，再执行：

```powershell
clawbody-host restart
```

不要长期同时运行计划任务和前台 `clawbody-host-bridge`。

## 7. 启动 Docker ClawBody 服务

### 7.1 启动 Docker Desktop

等待 Docker Desktop 显示 Engine 正常运行，再执行后续命令。

### 7.2 首次构建

在 `clawbody-minimax` 根目录执行：

```powershell
docker compose up -d --build
```

首次构建可能需要下载基础镜像和 Python 依赖。完成后检查：

```powershell
docker compose ps
```

刚启动时健康状态可能短暂显示 `starting`。等待 30 至 60 秒后重新检查。

### 7.3 检查服务健康

浏览器打开：

```text
http://127.0.0.1:7860/health
```

或使用 PowerShell：

```powershell
Invoke-RestMethod http://127.0.0.1:7860/health
```

查看最近日志：

```powershell
docker compose logs --tail 100 clawbody
```

持续跟踪日志：

```powershell
docker compose logs -f clawbody
```

按 `Ctrl+C` 只会结束日志跟踪，不会停止容器。

### 7.4 日常 Docker 命令

```powershell
# 启动已有容器
docker compose up -d

# 查看状态
docker compose ps

# 重启 ClawBody
docker compose restart clawbody

# 停止整套 Compose 服务
docker compose down
```

只有拉取了新代码、依赖或 Dockerfile 有变化时，才需要重新执行：

```powershell
docker compose up -d --build
```

## 8. 配置 Sentinel

以下命令在 `PsyTwin-Sentinel` 根目录执行。

### 8.1 安装依赖

```powershell
cd C:\项目目录\PsyTwin-Sentinel
npm install
```

### 8.2 创建 `.env`

如果本地尚无 `.env`：

```powershell
Copy-Item .env.example .env
```

保留 Sentinel 原有的数据库、登录、JWT 和其他业务配置，并加入或修改以下内容：

```dotenv
# Docker ClawBody
CLAWBODY_SERVICE_URL="http://127.0.0.1:7860"
CLAWBODY_SERVICE_KEY="填写ClawBody的SERVICE_API_KEY"

# Windows Host Bridge
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="填写ClawBody的HOST_BRIDGE_API_KEY"

# 实体 Reachy 联调绑定的测试学生
PET_AI_DEMO_STUDENT_ID="stu-test"
```

禁止写成：

```dotenv
NEXT_PUBLIC_HOST_BRIDGE_API_KEY=...
NEXT_PUBLIC_CLAWBODY_SERVICE_KEY=...
```

这两个密钥只能由 Sentinel 服务端读取，不能发送到浏览器。

### 8.3 数据库准备

先确认 Sentinel `.env` 中的 `DATABASE_URL` 指向正确数据库。

生成 Prisma Client：

```powershell
npx prisma generate
```

全新的本地开发数据库可以按项目原有流程执行：

```powershell
npx prisma migrate dev
npx prisma db seed
```

已有数据或共享环境不要执行 `prisma migrate reset`。部署或共享数据库通常使用：

```powershell
npx prisma migrate deploy
```

是否导入完整种子数据，应按照 Sentinel 的数据库部署文档和当前环境的数据策略决定。不要为了获得测试学生而清空已有数据库。

### 8.4 启动 Sentinel

```powershell
npm run dev
```

访问：

```text
http://localhost:3000
```

使用已有的心理咨询师或具备相应权限的后台账号登录。

## 9. 首次完整验收

首次验收建议严格按照以下顺序执行。

### 9.1 关闭冲突程序

完全退出以下程序或进程：

- Reachy Mini Control。
- 手动启动的 Reachy daemon。
- 手动启动的第二个 Host Bridge。

Reachy Mini Control 和 Host Bridge 不能同时占用同一 USB/COM 设备。仅关闭窗口但程序仍停留在系统托盘时，也需要彻底退出。

### 9.2 连接硬件

1. 接通 Reachy Mini Lite 电源。
2. 使用数据 USB 线连接 Windows 电脑。
3. 打开 Windows 设备管理器。
4. 确认“端口（COM 和 LPT）”中出现新的 COM 设备，例如 `COM5`。

### 9.3 检查四层服务

```powershell
# 1. Host Bridge 任务
C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe status

# 2. Host Bridge HTTP
Invoke-RestMethod http://127.0.0.1:7861/health

# 3. Docker ClawBody
cd C:\项目目录\clawbody-minimax
docker compose ps
Invoke-RestMethod http://127.0.0.1:7860/health

# 4. Sentinel
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

四层全部可访问后再进入页面调试。

## 10. 使用“心宠调试”

### 10.1 进入页面

1. 打开 Sentinel。
2. 在左侧导航栏展开“心图·AI配置”。
3. 点击“心宠AI管理中心”。
4. 点击页面右上角的“心宠调试”。

### 10.2 启动设备

1. 页面会自动扫描 Windows Host Bridge。
2. 在“可用连接”中选择 Reachy Mini Lite 对应的 USB/COM 设备。
3. 确认显示的 COM 端口与 Windows 设备管理器一致。
4. 点击“启动设备”。
5. 等待以下阶段依次完成：

```text
START → CONNECT → HEALTHCHECK → APPS
```

6. 页面显示 `Ready` 后，设备启动完成。

启动过程会在后台执行，可能需要数十秒。不要在启动过程中反复点击按钮，也不要打开 Reachy Mini Control。

### 10.3 Ready 页面功能

设备 Ready 后可以使用：

- 唤醒和休眠动作。
- 头部归中。
- 天线测试。
- 头部俯仰、侧倾、转向和身体转向控制。
- 左右天线位置控制。
- 重置控制器。
- 扬声器输出音量和测试声音。
- 麦克风输入音量。
- 实时日志。
- 顶部关机按钮。
- “返回实时联调”按钮。

动作控制时保持机器人周围没有障碍物，不要用手强行阻挡正在运动的部件。

### 10.4 关机

点击 Ready 状态栏顶部的关机按钮。系统会显示确认提示；确认后会停止设备并关闭由 Host Bridge 管理的 daemon。

如果实时对话仍在进行，先回到“实时联调”点击“停止”，再关机。

## 11. 使用“实时联调”

### 11.1 从心宠调试进入

设备显示 `Ready` 后：

1. 点击“返回实时联调”。
2. 页面自动切换到“心宠管理”。
3. 页面自动打开右侧“实时联调”页签。
4. 在左侧学生列表选择“测试学生”。
5. 确认页面设备状态正常。
6. 点击“开始对话”。

当前版本仅允许 `PET_AI_DEMO_STUDENT_ID` 指定的测试学生启动实体 Reachy 对话。其他学生的“开始对话”按钮不可用属于预期行为。

### 11.2 实时对话链路

会话启动后：

1. 学生对 Reachy 说话。
2. 百度 ASR 将声音转为文字。
3. 第一层心宠 AI 根据学生资料、心宠性格配置和对话上下文生成回答。
4. 若识别到负面情绪，内容进入第二层咨询师 AI。
5. 第二层生成专业建议。
6. 第一层心宠 AI 将建议转述成适合当前心宠人格的表达。
7. 百度 TTS 合成语音。
8. Reachy 播放语音，并按编排执行表情或动作。

页面中的“实时对话”显示学生 ASR 和心宠 TTS 文本；“协作过程”显示风险识别和双层 AI 阶段摘要。

### 11.3 结束会话

1. 点击“停止”。
2. 等待页面显示设备会话已停止。
3. 如果之后仍需调试动作，可以保持设备 Ready。
4. 如果当天不再使用，进入“心宠调试”并点击关机。

## 12. 每天使用的最短流程

首次安装完成后，不需要每天重新创建虚拟环境、安装任务或重建镜像。

```text
1. 接通 Reachy 电源和 USB
2. 完全退出 Reachy Mini Control
3. 启动 Docker Desktop
4. 在 ClawBody 目录执行 docker compose up -d
5. 必要时执行 clawbody-host status
6. 启动 Sentinel：npm run dev
7. 心宠调试 → 选择 USB → 启动设备
8. Ready → 返回实时联调
9. 选择测试学生 → 开始对话
10. 结束时停止对话 → 心宠调试 → 关机
```

## 13. 更新代码后的操作

### 13.1 更新 ClawBody

```powershell
cd C:\项目目录\clawbody-minimax
git pull
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev,mediapipe_vision]"
clawbody-host install
clawbody-host restart
docker compose up -d --build
```

重新执行 `clawbody-host install` 可以让登录任务继续指向当前虚拟环境和当前代码。

### 13.2 更新 Sentinel

```powershell
cd C:\项目目录\PsyTwin-Sentinel
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

本地开发库如果需要生成新迁移，才使用 `npx prisma migrate dev`；部署和共享数据库使用 `npx prisma migrate deploy`。

## 14. 常见故障排查

### 14.1 页面提示“心宠设备控制桥未运行”

执行：

```powershell
C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe status
C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe restart
Invoke-RestMethod http://127.0.0.1:7861/health
```

仍失败时检查：

- ClawBody `.env` 是否存在。
- `HOST_BRIDGE_API_KEY` 是否仍是占位值。
- Windows 当前登录用户是否与安装计划任务的用户相同。
- 7861 端口是否被其他程序占用。
- 是否同时运行了计划任务和前台 Host Bridge。

### 14.2 Host Bridge 返回 `401`

原因通常是两边密钥不一致：

```text
ClawBody HOST_BRIDGE_API_KEY
Sentinel HOST_BRIDGE_API_KEY
```

修改后执行：

```powershell
clawbody-host restart
```

并重启 Sentinel。不要把密钥放在 URL 查询参数或浏览器控制台中。

### 14.3 扫描不到 USB/COM

按顺序检查：

1. Reachy 是否通电。
2. USB 线是否支持数据传输。
3. Windows 设备管理器是否出现 COM 端口。
4. Reachy Mini Control 是否彻底退出。
5. 是否有其他串口工具占用 COM 端口。
6. 点击页面“重新扫描”。
7. 更换 USB 口或数据线。

### 14.4 点击“启动设备”提示命令来源无效

这通常表示 Sentinel、浏览器来源或服务端配置不一致。检查：

- 使用 `http://localhost:3000` 或项目允许的本机地址访问。
- Sentinel 是否已重启并读取最新 `.env`。
- `HOST_BRIDGE_URL` 是否仍为 `http://127.0.0.1:7861`。
- 当前页面是否来自正确的 Sentinel 实例，而不是另一个旧端口或旧容器。

### 14.5 daemon 启动失败或 8000 端口冲突

先完全退出 Reachy Mini Control 和手动 daemon。检查端口：

```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
```

重启 Host Bridge：

```powershell
clawbody-host restart
```

不要随意终止不明系统进程。先在“心宠调试”的实时日志中确认来源。

### 14.6 Docker ClawBody 不健康

```powershell
cd C:\项目目录\clawbody-minimax
docker compose ps
docker compose logs --tail 100 clawbody
Invoke-RestMethod http://127.0.0.1:7860/health
```

常见原因：

- Docker Desktop 未启动。
- `.env` 缺失。
- 云服务凭据错误。
- 7860 端口被占用。
- 更新代码后没有重新构建镜像。

更新后可执行：

```powershell
docker compose up -d --build
```

### 14.7 心宠调试可用，但“开始对话”不可用

检查：

- Docker ClawBody 是否健康。
- Sentinel 的 `CLAWBODY_SERVICE_KEY` 是否等于 ClawBody 的 `SERVICE_API_KEY`。
- 当前是否选择“测试学生”。
- `PET_AI_DEMO_STUDENT_ID` 是否为 `stu-test`。
- 是否已有另一个学生会话正在运行。
- 设备是否已达到 `Ready`。

### 14.8 能开始会话，但 ASR 没有文字

检查：

- 百度语音三个凭据是否正确。
- 百度应用是否开通语音识别权限。
- Windows 麦克风输入设备是否正常。
- 页面中的麦克风输入音量是否过低。
- Docker 日志是否出现百度 token 或 ASR 错误。
- 当前网络是否能够访问百度语音接口。

### 14.9 有文字但没有 TTS 声音

检查：

- 百度 TTS 权限和凭据。
- Ready 页面的扬声器音量。
- 点击“测试声音”能否播放。
- Windows 输出设备是否正确。
- Docker 日志中的 TTS 错误。

### 14.10 模型请求失败

检查：

- `MINIMAX_API_KEY` 是否填入有效的 DashScope Key。
- `MINIMAX_BASE_URL` 是否为 DashScope OpenAI 兼容地址。
- `MINIMAX_MODEL` 是否为账号可用的模型，例如 `qwen-plus`。
- 当前网络是否能够访问阿里云百炼。

变量名中的 `MINIMAX` 是历史兼容命名，不表示当前仍使用 MiniMax 云服务。

### 14.11 页面一直显示旧状态

1. 点击页面刷新状态按钮。
2. 确认没有同时打开两个不同端口的 Sentinel。
3. 重启 Sentinel。
4. 必要时执行 `clawbody-host restart`。
5. 查看 Docker 和页面实时日志。

## 15. 安全注意事项

- 不提交两个仓库的 `.env`。
- 不在截图、Issue、PR、群聊和日志中发送真实密钥。
- 不把密钥命名为 `NEXT_PUBLIC_*`。
- Host Bridge 只监听 `127.0.0.1`，不要改成 `0.0.0.0`。
- 不要把 7860、7861、8000 直接映射到公网。
- Sentinel 设备接口只允许预定义的发现、启动、停止、动作、姿态和音量命令，不应增加任意 Shell 命令入口。
- 操作机器人前清理周围障碍物。
- 修改姿态控制范围时先在无人员靠近的环境测试。
- 不确定进程来源时，不要强制结束系统进程。

## 16. 验证清单

交付给下一位开发者前，可逐项确认：

- [ ] 两个仓库都在正确功能分支或功能已合并到目标分支。
- [ ] Python 3.11 虚拟环境安装成功。
- [ ] `reachy-mini==1.8.0` 安装成功。
- [ ] ClawBody `.env` 已配置且未提交。
- [ ] 两组内部密钥不同且不是占位值。
- [ ] Sentinel 与 ClawBody 的对应密钥完全一致。
- [ ] `clawbody-host status` 正常。
- [ ] `http://127.0.0.1:7861/health` 正常。
- [ ] `docker compose ps` 显示 ClawBody 健康。
- [ ] `http://127.0.0.1:7860/health` 正常。
- [ ] Sentinel 可以打开并登录。
- [ ] “心宠调试”可以发现正确 COM 端口。
- [ ] “启动设备”最终显示 `Ready`。
- [ ] 唤醒、休眠、归中和天线测试正常。
- [ ] 扬声器测试和麦克风音量正常。
- [ ] “返回实时联调”会自动打开“实时联调”页签。
- [ ] 测试学生可以点击“开始对话”。
- [ ] 页面能显示 ASR 转写。
- [ ] Reachy 能播放 TTS 回复。
- [ ] “停止”可以结束会话。
- [ ] “关机”可以安全停止 daemon。

## 17. 卸载 Host Bridge 自启动任务

只有确认该电脑不再需要 Host Bridge 时才执行：

```powershell
cd C:\项目目录\clawbody-minimax
.\.venv\Scripts\Activate.ps1
clawbody-host uninstall --yes
```

这只移除当前用户的 Host Bridge 登录任务，不会删除仓库、虚拟环境、Docker 镜像或 Sentinel 数据。

## 18. 获取排障信息

需要向开发者反馈问题时，建议提供以下非敏感信息：

```powershell
py -3.11 --version
node --version
docker compose version

C:\项目目录\clawbody-minimax\.venv\Scripts\clawbody-host.exe status
Invoke-RestMethod http://127.0.0.1:7861/health

cd C:\项目目录\clawbody-minimax
docker compose ps
docker compose logs --tail 100 clawbody
```

同时提供：

- Windows 版本。
- Reachy 型号。
- 设备管理器显示的 COM 端口。
- 页面报错原文。
- 出错发生在发现、启动、健康检查、动作、ASR、模型还是 TTS 阶段。

提交日志前必须删除 API Key、内部服务密钥、Cookie、JWT、学生隐私信息和其他凭据。
