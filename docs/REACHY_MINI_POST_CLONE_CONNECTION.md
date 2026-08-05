# 心宠（Reachy Mini）拉取项目后仍无法连接：Windows 本机配置与排障手册

适用于：项目已拉取，网页能发现 USB 串口（例如 `COM5`），但仍显示设备离线、点击“启动设备”失败，或实时联调不可用。

本文只写 Git **不会**同步的内容：本机 `.env` 密钥、Python 虚拟环境、Windows 登录任务、Docker 运行状态、USB 驱动/线缆和进程占用。

## 0. 先判断问题在哪一层

网页看到 `COM5` 只说明 Windows 找到了 USB 串口，**不等于设备已连接**。启动还会经过以下链路：

```text
Sentinel :3000
  ├─ Host Bridge :7861 → Reachy daemon :8000 → USB/COM → 心宠
  └─ ClawBody Docker :7860
```

| 层级 | 本机项目外配置 | 失败表现 |
| --- | --- | --- |
| USB / COM | 数据线、驱动、供电 | 页面没有 COM，或启动时掉线 |
| Host Bridge `7861` | Python venv、登录任务、Bridge 密钥 | “心宠设备控制桥未运行”、503 |
| daemon `8000` | 由 Bridge 启动，可能被别的软件占用 | 在连接/健康检查阶段失败 |
| ClawBody `7860` | Docker、服务密钥、云端凭证 | 基础启动可用，实时对话不可用 |

## 1. 开始前：必须满足的条件

1. Sentinel、ClawBody、Host Bridge 和 USB 心宠必须在**同一台 Windows 电脑**上。`127.0.0.1` 是本机，不能改为另一台电脑 IP。
2. 完全退出 Reachy Mini Control、手工启动的 Reachy daemon，以及第二个 `clawbody-host-bridge`。它们会占用 USB/COM 或 `8000`。
3. 使用能传数据的 USB 线；仅充电线可能供电但不会出现 COM 端口。
4. `7861`、`8000` 必须只监听本机，不要暴露到局域网或公网。
5. 命令在普通 PowerShell 执行；以下 `C:\项目目录` 请替换成同事电脑的实际路径。

## 2. 首次在同事电脑完成的配置

### 2.1 Python 虚拟环境与 Host Bridge

Host Bridge 必须安装在接着 USB 心宠的 Windows 宿主机，不能放在 Docker 容器内。

```powershell
py -3.11 --version
cd C:\项目目录\clawbody-minimax
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install reachy-mini==1.8.0
pip install -e ".[dev,mediapipe_vision]"
```

若 `py -3.11` 不存在，请安装 Python 3.11 并启用 Python Launcher。若激活脚本被拦截，仅对当前用户执行一次：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

关闭并重新打开普通 PowerShell 后继续。

### 2.2 两组本机密钥：生成、填写、配对

密钥不会也不应该通过 Git 同步。执行两次并保存两个不同结果：

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

分别称为 `SERVICE_KEY` 和 `BRIDGE_KEY`。不得提交、截图或发送密钥；也不要使用 `NEXT_PUBLIC_` 前缀。

编辑 `C:\项目目录\clawbody-minimax\.env`，保留其他既有变量，确保有：

```dotenv
SERVICE_HOST=127.0.0.1
SERVICE_PORT=7860
SERVICE_API_KEY=SERVICE_KEY
HOST_BRIDGE_HOST=127.0.0.1
HOST_BRIDGE_PORT=7861
HOST_BRIDGE_API_KEY=BRIDGE_KEY
HOST_BRIDGE_DAEMON_URL=http://127.0.0.1:8000
HOST_BRIDGE_CLAWBODY_HEALTH_URL=http://127.0.0.1:7860/health
```

编辑或新建 `C:\项目目录\PsyTwin-Sentinel\.env.local`：

```dotenv
CLAWBODY_SERVICE_URL="http://127.0.0.1:7860"
CLAWBODY_SERVICE_KEY="SERVICE_KEY"
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="BRIDGE_KEY"
PET_AI_DEMO_STUDENT_ID="stu-test"
```

配对关系必须完全一致：

```text
ClawBody SERVICE_API_KEY     = Sentinel CLAWBODY_SERVICE_KEY
ClawBody HOST_BRIDGE_API_KEY = Sentinel HOST_BRIDGE_API_KEY
```

修改 Sentinel 环境变量后必须重启 `npm run dev`；修改 ClawBody `.env` 后重启 Host Bridge 和 Docker。

### 2.3 安装当前 Windows 用户的登录任务

在 ClawBody 目录执行：

```powershell
.\.venv\Scripts\clawbody-host.exe install
.\.venv\Scripts\clawbody-host.exe restart
.\.venv\Scripts\clawbody-host.exe status
```

它会创建任务 `PsyTwin ClawBody Host Bridge`，并在当前用户登录后启动。不要让该任务和手工运行的 `clawbody-host-bridge` 同时存在。

## 3. 每次使用前的检查顺序

### 第一步：确认 USB / COM

接通心宠电源和数据 USB 线，在“设备管理器 → 端口（COM 和 LPT）”记录 COM 号。也可运行：

```powershell
Get-CimInstance Win32_SerialPort | Select-Object DeviceID, Name, PNPDeviceID
```

没有 COM 时，先换数据线/USB 口并确认供电，暂时不要在网页反复扫描。

### 第二步：确认 Host Bridge（截图场景的首要检查项）

```powershell
cd C:\项目目录\clawbody-minimax
.\.venv\Scripts\clawbody-host.exe status
Invoke-RestMethod http://127.0.0.1:7861/health
```

如果健康检查失败：

```powershell
.\.venv\Scripts\clawbody-host.exe restart
Invoke-RestMethod http://127.0.0.1:7861/health
```

健康检查成功后，用不回显密钥的方式验证 Bridge 能发现设备：

```powershell
$hostBridgeKey = Read-Host "HOST_BRIDGE_API_KEY"
$headers = @{ "X-Host-Bridge-Key" = $hostBridgeKey }
Invoke-RestMethod http://127.0.0.1:7861/v1/device/status -Headers $headers
Invoke-RestMethod http://127.0.0.1:7861/v1/device/discover -Headers $headers
```

预期：`discover` 返回实际 COM，例如 `COM5`。`/health` 成功但带密钥请求返回 401，说明 ClawBody `.env` 的 `HOST_BRIDGE_API_KEY` 不匹配。

### 第三步：确认 Docker ClawBody

```powershell
cd C:\项目目录\clawbody-minimax
docker compose up -d
docker compose ps
Invoke-RestMethod http://127.0.0.1:7860/health
```

失败时查看日志：

```powershell
docker compose logs --tail 100 clawbody
```

只有首次构建或镜像相关文件变更后才运行 `docker compose up -d --build`。

### 第四步：重启 Sentinel 后再启动设备

```powershell
cd C:\项目目录\PsyTwin-Sentinel
npm run dev
```

登录后打开“心图 · AI 配置 → 心宠 AI 管理中心 → 心宠调试”，选择与设备管理器相同的 COM，点击“启动设备”。等待阶段完成，不要连点，也不要打开 Reachy Mini Control。

## 4. 截图中的 COM5 已出现：最短恢复路径

这说明先不排查 USB 驱动，依序执行：

```powershell
cd C:\项目目录\clawbody-minimax
.\.venv\Scripts\clawbody-host.exe restart
Invoke-RestMethod http://127.0.0.1:7861/health

$hostBridgeKey = Read-Host "HOST_BRIDGE_API_KEY"
$headers = @{ "X-Host-Bridge-Key" = $hostBridgeKey }
Invoke-RestMethod http://127.0.0.1:7861/v1/device/discover -Headers $headers

docker compose up -d
Invoke-RestMethod http://127.0.0.1:7860/health
```

- `7861/health` 不通：先修 Host Bridge/登录任务，不能靠改 Sentinel 解决。
- `discover` 没有 `COM5`：退出抢占设备的软件，重新插拔数据线。
- `discover` 有 `COM5`、网页仍失败：核对两端 `HOST_BRIDGE_API_KEY`，再重启 Host Bridge 和 Sentinel。
- 能启动设备、实时对话不可用：核对 `SERVICE_API_KEY` 和 `CLAWBODY_SERVICE_KEY`，检查 `7860/health`。

## 5. 表情、动作与声音的独立验收

设备显示 `Ready` 仅代表设备启动完成；还必须实际触发一次表情，才能确认电机和媒体资源链路正常。按以下步骤验收：

1. 在“心宠调试”的 `Ready` 页面找到“表情与动作”。
2. 保证周围没有障碍物，先在“表情”页选择一个动作幅度较小的表情，例如“喜爱”（内部名称 `loving1`）或“平静”。
3. 观察心宠是否完成对应动作，并确认是否有声音；一次动作结束后再测第二个表情，不要连续点击多个。
4. 再选择一个“舞蹈”动作，确认较长动作也可完整执行。

页面有表情列表但点击无反应时，先读取“心宠调试”实时日志；不要直接猜测或手工向 `8000` 发控制命令。按现象处理：

| 表情验收现象 | 优先处理 |
| --- | --- |
| 表情/舞蹈按钮被禁用 | 设备尚未 `Ready` 或电机未启用；先完成第 3 节四步检查并重新启动设备 |
| 有动作但没有声音 | 更新代码后重新构建并启动 ClawBody：`docker compose up -d --build`；当前资源使用 `.ogg` 音频，旧容器/旧 Python 依赖可能仍只按 `.wav` 查找 |
| 点击后页面报“设备控制请求失败” | 回到第 3 节第二步，检查 `7861` 和 `HOST_BRIDGE_API_KEY`，再查看心宠调试实时日志 |
| 动作中途停止或启动失败 | 检查 USB 连接、电源与是否存在 Reachy Mini Control/手工 daemon 占用；退出冲突程序后重启 Host Bridge |
| 表情正常、实时对话时不触发表情 | 表情库与语音会话是两条链路；先确认第 3 节第三步的 ClawBody 健康检查、云端语音凭证和实时联调日志 |

首次或拉取到包含表情资源更新的版本后，建议在 ClawBody 项目中各执行一次，确保本机 Python 可编辑安装和 Docker 镜像都使用当前代码：

```powershell
cd C:\项目目录\clawbody-minimax
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev,mediapipe_vision]"
docker compose up -d --build
```

完成后重新执行 Host Bridge 重启、`7861/health` 和 `7860/health` 检查，再回网页测试表情。通过标准是：至少一个表情和一个舞蹈均可从网页发起并完整执行；如该表情设计带声音，声音也应正常输出。

## 6. 现象对照表

| 现象 | 处理 |
| --- | --- |
| 没有 USB 设备 | 换数据线/USB 口，确认设备管理器有 COM |
| 有 COM 但“设备离线” | 运行 `clawbody-host.exe status`、`restart`，验证 `7861/health` |
| “心宠设备控制桥未运行” | 在任务计划程序检查 `PsyTwin ClawBody Host Bridge`，重启 Host Bridge |
| “设备控制请求失败”或 401 | 两端 `HOST_BRIDGE_API_KEY` 完全配对后重启 |
| 启动在连接/健康检查失败 | 完全退出 Reachy Mini Control、手工 daemon 和重复 Bridge，避免占用 COM/8000 |
| 能启动但实时联调离线 | 检查 Docker `7860/health` 与 `SERVICE_API_KEY` 配对 |
| 电脑重启后失效 | 重新执行 `clawbody-host.exe install`、`restart`，确认是实际登录用户的任务 |

## 7. 无法恢复时提交的信息（严禁包含密钥）

```powershell
cd C:\项目目录\clawbody-minimax
.\.venv\Scripts\clawbody-host.exe status
Invoke-RestMethod http://127.0.0.1:7861/health
docker compose ps
docker compose logs --tail 100 clawbody
Get-CimInstance Win32_SerialPort | Select-Object DeviceID, Name
Get-NetTCPConnection -LocalPort 7860,7861,8000 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, State, OwningProcess
```

同时描述页面报错、设备管理器的 COM 号、是否运行过 Reachy Mini Control，并只说明两组密钥“已核对一致/尚未核对”，不要发送其值。

成功标准：`7861/health` 可访问、Bridge 的 `discover` 返回实际 COM、`7860/health` 可访问，且网页选择同一 COM 后显示 `Ready`。结束时先停止实时对话，再使用网页的关机按钮；不要通过批量结束 Node 进程或启动多个控制程序“重置”设备。
