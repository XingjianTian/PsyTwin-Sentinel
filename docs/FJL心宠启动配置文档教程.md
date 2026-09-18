# FJL 心宠启动配置文档教程

> **编写日期**: 2026-07-29
> **适用场景**: Reachy Mini（心宠）通过 Windows Host Bridge + ClawBody Docker + Sentinel 网页全链路启动与故障恢复
> **核心目标**: 记录所有已踩坑的修复方案，下次出问题时直接按文档恢复

---

## 目录

1. [系统架构概览](#1-系统架构概览)
2. [服务端口清单](#2-服务端口清单)
3. [关键文件配置](#3-关键文件配置)
4. [开机自启清单](#4-开机自启清单)
5. [常见问题与修复](#5-常见问题与修复)
6. [故障排查口诀](#6-故障排查口诀)
7. [附录：修改记录](#7-附录修改记录)

---

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    同一台 Windows 电脑                         │
│                                                              │
│   浏览器访问 :3000                                           │
│        │                                                     │
│        ▼                                                     │
│   ┌────────────────┐                                         │
│   │   Sentinel      │  Next.js :3000                         │
│   │   (管理后台)     │  C:\psytwin\PsyTwin-Sentinel\          │
│   └───┬────────────┘                                         │
│       │ REST API                                             │
│       ▼                                                      │
│   ┌────────────────┐                                         │
│   │   ClawBody      │  Docker :7860                           │
│   │   (编排服务)     │  D:\psytwin\clawbody-minimax\           │
│   └───┬────────────┘                                         │
│       │ REST API                                             │
│       ▼                                                      │
│   ┌────────────────────────────┐                             │
│   │   Host Bridge              │  .venv\Scripts\pythonw.exe  │
│   │   (设备控制桥)               │  Windows 计划任务 :7861       │
│   │   manager.py 管理 daemon    │                             │
│   └───┬────────────────────────┘                             │
│       │ 启动/管理                                             │
│       ▼                                                      │
│   ┌────────────────────────────┐                             │
│   │   Reachy Mini daemon       │  Python 子进程 :8000          │
│   │   (马达/传感器/表情)         │  USB COM 连接心宠硬件         │
│   └────────────────────────────┘                             │
│                                                              │
│   USB 线 → 心宠硬件 (Reachy Mini)                             │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
Sentinel 网页点击"启动设备"
  → Host Bridge (:7861) 收到请求
    → manager.py 启动 daemon 子进程 (从 .venv 的 Python)
      → daemon 初始化马达 (~30-45秒)
        → daemon Uvicorn 监听 :8000
          → Host Bridge 检测到 daemon 就绪
            → 返回"设备已启动"给 Sentinel
```

---

## 2. 服务端口清单

| 服务 | 端口 | 进程/容器 | 健康检查地址 |
|------|------|-----------|-------------|
| Host Bridge | `7861` | `.venv\Scripts\pythonw.exe`（Windows 计划任务） | `http://127.0.0.1:7861/health` |
| ClawBody Docker | `7860` | Docker 容器 `clawbody-service` | `http://127.0.0.1:7860/health` |
| Reachy daemon | `8000` | 由 Host Bridge 启动的 Python 子进程 | 由 Host Bridge 自动检测 |
| Sentinel | `3000` | `npm run dev` / npm start | `http://localhost:3000` |

---

## 3. 关键文件配置

### 3.1 Host Bridge manager.py（核心修复文件）

**路径**: `D:\psytwin\clawbody-minimax\src\reachy_mini_openclaw\host_bridge\manager.py`

此文件是 **唯一需要手工修改代码** 的文件。所有对 daemon 进程的管理逻辑都在这里。

#### 3.1.1 硬编码 .venv Python 路径

```python
# 文件顶部，import 区域
import os
from pathlib import Path

# 约第 25 行附近，与其他常量放在一起
_VENV_PYTHON = (
    Path(__file__).resolve().parent.parent.parent
    / ".venv"
    / "Scripts"
    / "python.exe"
)
_VENV_DOTENV = (
    Path(__file__).resolve().parent.parent.parent
    / ".env"
)
```

**为什么需要这样做？**
- Python 3.11+ 的 `sys.executable` 在不同环境中可能指向系统 Python 而非 `.venv` 的 Python
- 如果 daemon 用系统 Python 启动，会找不到 `.venv` 中安装的 `reachy-mini` 包
- 硬编码 `.venv/Scripts/python.exe` 确保 daemon 始终在正确的虚拟环境中运行

**恢复时检查要点**:
- 确认 `_VENV_PYTHON` 路径的父级结构正确（三层 `parent` → 项目根目录）
- 确认 `_VENV_DOTENV` 指向项目根目录下的 `.env` 文件
- 确认 `Path` 和 `os` 已导入

#### 3.1.2 环境变量注入函数

```python
# 约与上面常量放在一起的位置
def _load_daemon_env():
    """Load .env file and return environment variables for the daemon process."""
    env = os.environ.copy()
    dotenv_path = _VENV_DOTENV
    if dotenv_path.exists():
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip("\"'")
                if key:
                    env[key] = value
    return env
```

**为什么需要这样做？**
- `python-dotenv` 包可能未安装或不在 daemon 进程的 Python 路径中
- 手工解析 `.env` 是最可靠的注入方式，不依赖任何第三方包
- daemon 进程需要 `REACHY_ROBOT_URI`、`REACHY_ROBOT_LEFT_ARM`、`REACHY_ROBOT_RIGHT_ARM` 等环境变量

#### 3.1.3 超时配置（重要！）

```python
# 约与其他配置常量一起
DAEMON_LISTEN_TIMEOUT_SECONDS = 90.0  # ← 从 45.0 改为 90.0
```

**为什么需要 90 秒？**
- Reachy Mini 的马达初始化时间因 USB 时序差异而波动
- 首次启动时马达初始化约 30 秒，刚好通过
- 第二次启动时马达初始化约 45 秒，刚好卡在旧超时边界上
- **45 秒超时问题**：计时从 daemon 进程启动开始，马达初始化用掉了几乎全部时间，Uvicorn HTTP 服务还没来得及监听就已超时
- **90 秒** 给予充足余量

**恢复时检查要点**:
- 确认 `DAEMON_LISTEN_TIMEOUT_SECONDS = 90.0`
- 确认下方 `wait_until_ready` 也使用了这个变量，而不是硬编码 `45.0`

#### 3.1.4 `wait_until_ready` 调用修正

```python
# 错误（旧代码）：
# wait_until_ready(timeout=45.0)

# 正确（新代码）：
wait_until_ready(timeout=DAEMON_LISTEN_TIMEOUT_SECONDS)
```

**为什么重要**：
- 旧代码中超时常量改了但 `wait_until_ready` 仍然硬编码 45.0，导致 90 秒超时无效
- 必须保证两者一致

#### 3.1.5 `_run_start` 方法修改

```python
async def _run_start(self, ...):
    # ... 其他代码 ...
    
    # 使用 _VENV_PYTHON 而不是 sys.executable
    process = await asyncio.create_subprocess_exec(
        str(_VENV_PYTHON),  # ← 改这里
        "-m", "reachy_mini.daemon",
        "--host", "127.0.0.1",
        "--port", "8000",
        env=_load_daemon_env(),  # ← 改这里：传入环境变量
        ...
    )
```

#### 3.1.6 `_default_process_factory` 修改

```python
# 旧签名
def _default_process_factory(self, ...):

# 新签名
def _default_process_factory(self, ..., env=None):
```

新增 `env=None` 参数，让调用方（`_run_start`）可以传入环境变量。

### 3.2 Host Bridge .env 配置

**路径**: `D:\psytwin\clawbody-minimax\.env`

```dotenv
SERVICE_HOST=127.0.0.1
SERVICE_PORT=7860
SERVICE_API_KEY=<与 Sentinel 的 CLAWBODY_SERVICE_KEY 一致>
HOST_BRIDGE_HOST=127.0.0.1
HOST_BRIDGE_PORT=7861
HOST_BRIDGE_API_KEY=<与 Sentinel 的 HOST_BRIDGE_API_KEY 一致>
HOST_BRIDGE_DAEMON_URL=http://127.0.0.1:8000
HOST_BRIDGE_CLAWBODY_HEALTH_URL=http://127.0.0.1:7860/health
```

### 3.3 Sentinel .env.local 配置

**路径**: `D:\psytwin\PsyTwin-Sentinel\.env.local`

```dotenv
CLAWBODY_SERVICE_URL="http://127.0.0.1:7860"
CLAWBODY_SERVICE_KEY="<与 ClawBody 的 SERVICE_API_KEY 一致>"
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="<与 ClawBody 的 HOST_BRIDGE_API_KEY 一致>"
PET_AI_DEMO_STUDENT_ID="stu-test"
```

### 3.4 Sentinel layout.tsx 修复 hydration 问题

**路径**: `D:\psytwin\PsyTwin-Sentinel\app\layout.tsx`

**修改**: 在第 36 行 `className` 前面添加 `suppressHydrationWarning`

```tsx
<body
  suppressHydrationWarning           // ← 新增此行
  className={`${notoSansSC.variable} ${geistMono.variable} font-sans antialiased`}
>
```

**原因**: Lenovo 浏览器翻译扩展会自动向 `<body>` 注入 `ai-translate-version`、`ai-translate-type` 等属性。Next.js 服务端渲染的 HTML 没有这些属性，客户端 hydrate 时发现不匹配，报 hydration error。

### 3.5 ClawBody Dockerfile 健康检查修复

**路径**: `D:\psytwin\clawbody-minimax\Dockerfile`

**文件末尾约第 82-83 行**：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:7860/health || exit 1
```

**注意**: 健康检查地址是 `/health`，不是根路径 `/`。容器标记 `unhealthy` 通常是因为：

1. ∟ 当前运行的容器是用旧的 Dockerfile 构建的
2. ∟ 旧 Dockerfile 的健康检查访问 `/`（返回 404）
3. ∟ 需要重建容器才能生效

---

## 4. 开机自启清单

### 4.1 Docker Desktop

- **检查方式**: 打开任务管理器 → 启动应用 → 查看 Docker Desktop 是否"已启用"
- **恢复方法**: Docker Desktop 设置 → General → "Start Docker Desktop when you sign in to your computer"

### 4.2 Host Bridge 计划任务

- **任务名称**: `PsyTwin ClawBody Host Bridge`
- **触发器**: 用户登录时 (LogonTrigger)
- **操作**: `.\venv\Scripts\clawbody-host.exe` 启动 Host Bridge
- **检查方式**:

```powershell
# 查看任务是否存在和状态
.\venv\Scripts\clawbody-host.exe status

# 或通过计划任务管理器
Get-ScheduledTask -TaskName "PsyTwin*" | Format-List *
```

- **恢复方法**:

```powershell
cd D:\psytwin\clawbody-minimax
.\venv\Scripts\clawbody-host.exe install
.\venv\Scripts\clawbody-host.exe restart
```

- **确认运行**:

```powershell
# 查看进程
Get-Process -Name "pythonw" -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, CommandLine

# 查看端口监听
Get-NetTCPConnection -LocalPort 7861 -ErrorAction SilentlyContinue

# 健康检查
Invoke-RestMethod http://127.0.0.1:7861/health
```

### 4.3 Sentinel 开机启动

- **快捷方式路径**: 
  ```
  C:\Users\Fiona\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\PsyTwin Sentinel.lnk
  ```
- **目标**: `npm start`（在 `D:\psytwin\PsyTwin-Sentinel\` 目录下）
- **检查方式**: 打开 `shell:startup` 查看是否有 `PsyTwin Sentinel.lnk`
- **恢复方法**: 如果丢失，重新创建快捷方式：
  1. 打开 `shell:startup`
  2. 右键 → 新建快捷方式
  3. 位置: `C:\Program Files\nodejs\npm.cmd start`
  4. 起始位置: `D:\psytwin\PsyTwin-Sentinel\`
  5. 名称: `PsyTwin Sentinel`

---

## 5. 常见问题与修复

### 5.1 启动设备一直转圈不成功（最常见）

**现象**: 在 Sentinel 心宠调试页面点击"启动设备"，日志滚动，但最终超时失败

**根因**: 马达初始化超时

**修复步骤**:

```powershell
# 1. 检查 Host Bridge 是否在用 .venv 的 Python
Get-CimInstance Win32_Process -Filter "ProcessId = $(Get-NetTCPConnection -LocalPort 7861 | Select-Object -First 1 -ExpandProperty OwningProcess)" | Select-Object CommandLine

# 输出应包含 .venv\Scripts\pythonw.exe，而不是系统 Python

# 2. 检查 manager.py 超时配置
#    打开 D:\psytwin\clawbody-minimax\src\reachy_mini_openclaw\host_bridge\manager.py
#    确认 DAEMON_LISTEN_TIMEOUT_SECONDS = 90.0
#    确认 wait_until_ready(timeout=DAEMON_LISTEN_TIMEOUT_SECONDS)

# 3. 如果代码正确但问题依旧，重启 Host Bridge
cd D:\psytwin\clawbody-minimax
.\venv\Scripts\clawbody-host.exe restart

# 4. 确认重启后 :7861 恢复
Invoke-RestMethod http://127.0.0.1:7861/health
```

**需要修改的代码**（如果被 git reset 覆盖或新部署时需要重新修改）：

打开 `manager.py`，做以下四处修改：

**修改 1** — 导入区域添加：
```python
import os
from pathlib import Path
```

**修改 2** — 在常量区（约 25 行）添加：
```python
_VENV_PYTHON = (
    Path(__file__).resolve().parent.parent.parent
    / ".venv"
    / "Scripts"
    / "python.exe"
)
_VENV_DOTENV = (
    Path(__file__).resolve().parent.parent.parent
    / ".env"
)

def _load_daemon_env():
    env = os.environ.copy()
    dotenv_path = _VENV_DOTENV
    if dotenv_path.exists():
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip("\"'")
                if key:
                    env[key] = value
    return env
```

**修改 3** — 找到 `DAEMON_LISTEN_TIMEOUT_SECONDS = 45.0`，改为 `90.0`：
```python
DAEMON_LISTEN_TIMEOUT_SECONDS = 90.0
```

**修改 4** — 找到 `wait_until_ready(timeout=45.0)`，改为：
```python
wait_until_ready(timeout=DAEMON_LISTEN_TIMEOUT_SECONDS)
```

**修改 5** — 在 `_run_start` 中，将 `sys.executable` 替换为 `str(_VENV_PYTHEN)`，并在 `create_subprocess_exec` 参数中增加 `env=_load_daemon_env()`

**修改 6** — 在 `_default_process_factory` 的定义中添加 `env=None` 参数

### 5.2 Host Bridge 启动后 401 Unauthorized

**现象**: Sentinel 页面显示"设备控制请求失败"

**根因**: 两端 API Key 不匹配

**检查**:

```powershell
# 从 ClawBody .env 读取 HOST_BRIDGE_API_KEY
cd D:\psytwin\clawbody-minimax
Get-Content .env | Select-String "HOST_BRIDGE_API_KEY"

# 从 Sentinel .env.local 读取 HOST_BRIDGE_API_KEY
cd D:\psytwin\PsyTwin-Sentinel
Get-Content .env.local | Select-String "HOST_BRIDGE_API_KEY"
```

**修复**: 确保两个文件中的值完全一致。修改后重启 Host Bridge。

### 5.3 Host Bridge 未运行

**现象**: Sentinel 页面显示"心宠设备控制桥未运行"

**检查**:

```powershell
cd D:\psytwin\clawbody-minimax
.\venv\Scripts\clawbody-host.exe status
Invoke-RestMethod http://127.0.0.1:7861/health
```

**修复**:

```powershell
cd D:\psytwin\clawbody-minimax
.\venv\Scripts\clawbody-host.exe restart
# 等待 5 秒
Invoke-RestMethod http://127.0.0.1:7861/health
```

如果 `health` 仍不通，确认没有端口冲突：

```powershell
Get-NetTCPConnection -LocalPort 7861 -ErrorAction SilentlyContinue
```

如果端口被其他进程占用，可以杀掉：

```powershell
# 注意：不要杀掉 Node 进程！
$pid = (Get-NetTCPConnection -LocalPort 7861).OwningProcess
Stop-Process -Id $pid -Force
# 然后重新 restart
```

### 5.4 Sentinel 页面报 hydration 错误

**现象**: 浏览器控制台报 `Text content does not match server-rendered HTML`，或 `Hydration failed because the initial UI does not match what was rendered on the server`

**根因**: 浏览器翻译/插件扩展向 `<body>` 注入额外属性

**修复**: 确认 `D:\psytwin\PsyTwin-Sentinel\app\layout.tsx` 中 `<body>` 标签包含 `suppressHydrationWarning`。

### 5.5 ClawBody Docker 容器 unhealthy

**现象**: 

```powershell
docker compose ps
# 显示 clawbody 的 Status 为 "unhealthy"
```

**修复**:

```powershell
cd D:\psytwin\clawbody-minimax
docker compose up -d --build
```

**注意**: 首次构建可能需要较长时间（依赖 PyPI 下载），如果网络慢可以尝试配置国内 PyPI 镜像后再构建。

### 5.6 电脑重启后设备不工作

**恢复顺序**:

```powershell
# 1. 确认 Docker Desktop 已启动
# 2. 确认 Docker 容器运行
cd D:\psytwin\clawbody-minimax
docker compose up -d

# 3. 确认 Host Bridge 任务已启动
.\venv\Scripts\clawbody-host.exe status
# 如果未启动：
.\venv\Scripts\clawbody-host.exe restart

# 4. 确认 Sentinel 已启动
# 检查 :3000 是否可访问

# 5. 打开浏览器访问 http://localhost:3000
# 6. 进入心宠调试页面，选择 COM 口，点击启动设备

# 7. 如果启动超时：
#   - 等待 90 秒（超时已改为 90 秒）
#   - 如果仍失败，看 manager.py 是否被重置
```

---

## 6. 故障排查口诀

```
启动失败不用慌，四步排查记心上：

第一步 看桥通不通  :7861/health
第二步 看密钥对不对 两端 API Key 要一致
第三步 看超时够不够  45 秒要改 90 秒
第四步 看路径对不对  .venv 的 Python 要硬编码

电脑重启怎么办：
Docker → Host Bridge → Sentinel → 启动设备
```

### 快检命令（一条挨一条执行）

```powershell
# 1. 端口是否在监听
Write-Host "=== 端口状态 ==="
Get-NetTCPConnection -LocalPort 7860,7861,8000,3000 -ErrorAction SilentlyContinue | Select-Object LocalPort, State, @{N="PID";E={$_.OwningProcess}}

# 2. Host Bridge 健康
Write-Host "=== Host Bridge ==="
try { Invoke-RestMethod http://127.0.0.1:7861/health -ErrorAction Stop } catch { Write-Host "✗ 不通" }

# 3. Docker 状态
Write-Host "=== Docker ==="
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# 4. ClawBody 健康
Write-Host "=== ClawBody ==="
try { Invoke-RestMethod http://127.0.0.1:7860/health -ErrorAction Stop } catch { Write-Host "✗ 不通" }

# 5. manager.py 超时配置
Write-Host "=== 超时配置 ==="
Select-String -Path "D:\psytwin\clawbody-minimax\src\reachy_mini_openclaw\host_bridge\manager.py" -Pattern "DAEMON_LISTEN_TIMEOUT|wait_until_ready"
```

---

## 7. 附录：修改记录

| 日期 | 文件 | 修改内容 | 原因 |
|------|------|---------|------|
| 2026-07-29 | `clawbody-minimax/.../manager.py` | 添加 `import os`, `from pathlib import Path` | 需要文件路径和环境变量操作 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | 添加 `_VENV_PYTHON`、`_VENV_DOTENV` 常量 | 硬编码 `.venv` Python 路径，避免系统 Python 冲突 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | 添加 `_load_daemon_env()` 函数 | 手工解析 `.env` 注入 daemon 环境变量 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | `DAEMON_LISTEN_TIMEOUT_SECONDS` 45→90 秒 | 马达初始化超时达 45 秒，超过旧超时限制 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | `wait_until_ready(timeout=45.0)` → `wait_until_ready(timeout=DAEMON_LISTEN_TIMEOUT_SECONDS)` | 使超时配置实际生效 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | `_run_start` 使用 `str(_VENV_PYTHON)` 替代 `sys.executable` | 确保 daemon 走 `.venv` 的 Python |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | `_run_start` 传入 `env=_load_daemon_env()` | 确保 daemon 进程加载 `.env` 环境变量 |
| 2026-07-29 | `clawbody-minimax/.../manager.py` | `_default_process_factory` 增加 `env=None` 参数 | 使调用方可传入环境变量 |
| 2026-07-29 | `PsyTwin-Sentinel/app/layout.tsx` | 添加 `suppressHydrationWarning` | 浏览器翻译扩展注入属性导致 hydration 不匹配 |
| 2026-07-29 | `clawbody-minimax/Dockerfile` | 健康检查改回 `/health`（已修改待重建） | Docker 健康检查 404 导致容器 unhealthy |

### Git 恢复指南

如果代码被 git reset 或新部署覆盖，需要重新修改 `manager.py`：

```bash
# 查看文件的 git 历史
cd D:\psytwin\clawbody-minimax
git log --oneline -- src/reachy_mini_openclaw/host_bridge/manager.py

# 查看某个提交的 diff
git show <commit-hash> -- src/reachy_mini_openclaw/host_bridge/manager.py

# 如果文件被重置，重新按 5.1 节的四处修改逐一恢复
```

或者直接在这个文档的 [5.1](#51-启动设备一直转圈不成功最常见) 节找到所有需要修改的代码片段，依次复制进去即可。
