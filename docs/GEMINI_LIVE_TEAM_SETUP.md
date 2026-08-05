# Gemini Live 实时语音对话交接配置指南

本文用于同事在新 Windows 电脑上拉取 PsyTwin-Sentinel 和 clawbody-minimax 后，配置并验收 Gemini Live 实时语音对话。

## 0. 当前推送前置事项

Sentinel 本地提交中发现了 .env.local.bak-2026-08-05T06-52-01-308Z，其中包含非占位的 GEMINI_API_KEY。该提交尚未推送到远端，因此不能直接 push。

维护者推送前必须：

1. 在 Google AI Studio 或 Google Cloud 中撤销旧 Gemini Key，并创建新 Key。
2. 从本地 Git 提交中移除明确的备份文件：

~~~powershell
cd C:\PsyTwin\PsyTwin-Sentinel
git rm --cached --ignore-unmatch .env.local.bak-2026-08-05T06-52-01-308Z
git commit --amend --no-edit
~~~

3. 确认 .env、.env.local、.env*.local 和环境变量备份文件均未被 Git 跟踪。
4. 真实密钥只放在同事电脑的本地环境文件或密码管理器中，不要放入 README、截图、日志、Issue 或浏览器代码。

如果旧 Key 曾经被推送或分享，仅删除文件是不够的，必须先撤销旧 Key。

## 1. 运行拓扑

~~~text
浏览器 → PsyTwin-Sentinel :3000 → Gemini Live
                         ├→ PostgreSQL（对话记录、心宠配置、风险工单）
                         ├→ ClawBody :7860（实体链路）
                         └→ Host Bridge :7861 → Reachy daemon :8000 → USB/COM → Reachy Mini Lite
~~~

Gemini Key 只由 Sentinel 服务端使用。浏览器拿到的是一次性临时令牌，不要创建或使用 NEXT_PUBLIC_GEMINI_API_KEY。

## 2. 前置软件

完整实体链路需要 Windows 10/11、Node.js 20+、Python 3.11、npm、Docker Desktop、Reachy Mini Lite 和数据 USB 线。项目已用 Node.js 24.15.0、reachy-mini==1.8.0 验证。

~~~powershell
node --version
npm --version
py -3.11 --version
docker --version
docker compose version
~~~

完整语音还需要 Google Gemini API Key；ClawBody 原有语音链路还需要阿里云百炼 DashScope Key、百度语音 App ID、API Key 和 Secret Key。

## 3. 拉取包含功能的分支

功能分支尚未合并到 main 前，两边都要使用同一个功能分支。当前分支为 codex/current-reachy-work；合并到 main 后，把下面命令中的分支替换为 main。

~~~powershell
New-Item -ItemType Directory -Path C:\PsyTwin -Force
Set-Location C:\PsyTwin
git clone -b codex/current-reachy-work git@github.com:XingjianTian/PsyTwin-Sentinel.git
git clone -b codex/current-reachy-work git@github.com:XingjianTian/clawbody-minimax.git
~~~

已有仓库使用：

~~~powershell
cd C:\PsyTwin\PsyTwin-Sentinel
git fetch origin
git switch codex/current-reachy-work
git pull --ff-only origin codex/current-reachy-work

cd C:\PsyTwin\clawbody-minimax
git fetch origin
git switch codex/current-reachy-work
git pull --ff-only origin codex/current-reachy-work
~~~

确认：

~~~powershell
git branch --show-current
git log -1 --oneline
git status --short
~~~

## 4. 配置 ClawBody 和 Host Bridge

没有实体设备时可跳过本节。

~~~powershell
cd C:\PsyTwin\clawbody-minimax
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install "reachy-mini==1.8.0"
python -m pip install -e ".[dev,mediapipe_vision]"
Copy-Item .env.example .env
~~~

编辑 clawbody-minimax/.env，至少填写：

~~~dotenv
MINIMAX_API_KEY=你的DashScopeKey
MINIMAX_MODEL=qwen-plus
MINIMAX_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MINIMAX_MAX_TOKENS=80
MINIMAX_ENABLE_THINKING=false
HTTP_TRUST_ENV=false

BAIDU_APP_ID=你的百度应用ID
BAIDU_API_KEY=你的百度APIKey
BAIDU_SECRET_KEY=你的百度SecretKey
BAIDU_TTS_PER=111
BAIDU_TTS_SPD=5
BAIDU_TTS_PIT=5
BAIDU_TTS_VOL=12
BAIDU_ASR_LANGUAGE=zh-CN

SERVICE_HOST=127.0.0.1
SERVICE_PORT=7860
SERVICE_API_KEY=第一组随机长密钥
HOST_BRIDGE_HOST=127.0.0.1
HOST_BRIDGE_PORT=7861
HOST_BRIDGE_API_KEY=第二组随机长密钥
HOST_BRIDGE_DAEMON_URL=http://127.0.0.1:8000
HOST_BRIDGE_CLAWBODY_HEALTH_URL=http://127.0.0.1:7860/health
~~~

生成两组不同的内部密钥：

~~~powershell
py -3.11 -c "import secrets; print(secrets.token_urlsafe(48))"
py -3.11 -c "import secrets; print(secrets.token_urlsafe(48))"
~~~

密钥配对关系必须是：

~~~text
ClawBody SERVICE_API_KEY     = Sentinel CLAWBODY_SERVICE_KEY
ClawBody HOST_BRIDGE_API_KEY = Sentinel HOST_BRIDGE_API_KEY
~~~

关闭 Reachy Mini Control 和手动启动的 daemon 后安装 Host Bridge：

~~~powershell
clawbody-host install
clawbody-host restart
clawbody-host status
Invoke-RestMethod http://127.0.0.1:7861/health
~~~

Host Bridge 必须只监听 127.0.0.1:7861，不要改成 0.0.0.0，不要将 7861 发布到局域网或公网。

## 5. 配置 Sentinel

~~~powershell
cd C:\PsyTwin\PsyTwin-Sentinel
npm ci
Copy-Item .env.example .env
~~~

编辑 PsyTwin-Sentinel/.env，至少确认：

~~~dotenv
POSTGRES_USER=psytwin
POSTGRES_PASSWORD=本地数据库密码
POSTGRES_DB=psytwin_sentinel
POSTGRES_PORT=5432
DATABASE_URL="postgresql://psytwin:本地数据库密码@localhost:5432/psytwin_sentinel?schema=public"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=本地Redis密码
REDIS_DB=0
REDIS_URL="redis://:本地Redis密码@127.0.0.1:6379/0"

DASHSCOPE_API_KEY=你的DashScopeKey
GEMINI_API_KEY=新的GeminiAPIKey
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
GEMINI_LIVE_VOICE=Kore

CLAWBODY_SERVICE_URL=http://127.0.0.1:7860
CLAWBODY_SERVICE_KEY=与ClawBody的SERVICE_API_KEY完全相同
HOST_BRIDGE_URL=http://127.0.0.1:7861
HOST_BRIDGE_API_KEY=与ClawBody的HOST_BRIDGE_API_KEY完全相同
PET_AI_DEMO_STUDENT_ID=stu-test

JWT_SECRET=至少32字节的随机字符串
JWT_ISSUER=psytwin-sentinel
JWT_AUDIENCE=psytwin-sentinel
~~~

如果使用 .env.local 覆盖 .env，Gemini 和内部服务变量也必须保持一致。修改 API Key、模型或 Voice 后必须停止并重新执行 npm run dev，只刷新浏览器不会更新 Node 进程环境变量。

## 6. 初始化数据库并启动

~~~powershell
cd C:\PsyTwin\PsyTwin-Sentinel
docker compose --env-file .env -f docker-compose.dev.yml up -d
npx prisma generate
npx prisma migrate deploy
npm run seed:incremental
npm run dev
~~~

即使没有实体设备，PostgreSQL 也不能省略，因为每轮 Gemini 输入/输出转写、对话记录、心宠配置和风险工单都保存到数据库。

## 7. Gemini Voice 与模型

先在 Google AI Studio 的 Gemini Live/Voice Library 试听，再把官方 Voice 名称写入 GEMINI_LIVE_VOICE。当前默认：

~~~dotenv
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
GEMINI_LIVE_VOICE=Kore
~~~

不要填写自定义中文名称。模型、地区、账号权限变化时，以 Google AI Studio/官方 Gemini API 控制台实际可用项为准。

## 8. 使用和验收

### 8.1 仅浏览器对话

1. 启动 PostgreSQL/Redis 和 Sentinel。
2. 打开 http://localhost:3000/pet-ai-management 并登录。
3. 选择 stu-test，进入“实时联调”。
4. 点击“开始对话”，允许麦克风权限并讲话。

### 8.2 实体心宠对话

1. 启动 Docker ClawBody：进入 clawbody-minimax 后执行 docker compose up -d。
2. 确认 clawbody-host status 正常；必要时执行 clawbody-host restart。
3. 在“心宠调试”扫描并选择正确 COM 口，点击“启动设备”，等待 Ready。
4. 返回“实时联调”，选择 stu-test，点击“开始对话”。
5. 浏览器的麦克风和扬声器选择实体心宠设备。

预期结果：Gemini 语音从实体扬声器播放；连接等待阶段只有耳朵轻幅摆动，头部和身体不接收该动作指令；回答时执行性格配置对应的固定动作；刷新后对话记录仍存在；“我晚上总是睡不好”和带 ASR 空格的“我 买 上 总 是 睡 不 好 。”显示中风险；中高风险出现在待处理工单和“协作过程”中。

结束时先点击“停止”；当天不再使用设备时，再在“心宠调试”点击“关机”。

## 9. 故障排查

| 现象 | 检查顺序 |
| --- | --- |
| 临时令牌创建失败 | 检查服务端 GEMINI_API_KEY、模型、Voice；修改后重启 Next.js；不要把 Key 放到浏览器控制台。 |
| 页面显示 API Key 未配置 | 确认启动 Sentinel 的目录和 .env/.env.local；停止旧 Node 服务后重新 npm run dev。 |
| Host Bridge 返回 401 | 两边 HOST_BRIDGE_API_KEY 必须完全相同；修改后执行 clawbody-host restart，再重启 Sentinel。 |
| ClawBody 离线 | 检查 docker compose ps、http://127.0.0.1:7860/health 以及 SERVICE_API_KEY/CLAWBODY_SERVICE_KEY。 |
| 找不到 COM 口 | 关闭 Reachy Mini Control，检查 USB 数据线、设备管理器和端口，再重新扫描。 |
| 连接后头部晃动 | 确认两边已拉取最新功能分支；执行 clawbody-host restart。最新 processing 请求只发送 antennas 字段。 |
| 声音来自电脑 | 检查浏览器麦克风/扬声器选择，确认输出设备是实体心宠。 |
| 刷新后对话记录为空 | 检查 Sentinel 启动时的 DATABASE_URL，执行 npx prisma migrate deploy，确认没有连接另一套数据库。 |
| “晚上睡不好”没有中风险 | 完整结束一轮对话，检查输入转写；分类器会自动去除 ASR 插入的空格和标点。 |
| 修改配置后仍使用旧值 | 必须停止并重启 Next.js，浏览器刷新本身不会更新 Node 环境。 |

## 10. 交付清单

- [ ] 两个仓库在同一个已推送分支，工作区无未提交代码。
- [ ] Git 历史和当前文件中没有环境文件、备份环境文件或真实 API Key。
- [ ] 旧 Gemini Key 已撤销，新 Key 已通过服务端临时令牌验证。
- [ ] npm ci、npm run lint、npm run build 成功。
- [ ] Sentinel Gemini/设备/风险测试通过。
- [ ] Host Bridge Python 测试通过，任务状态正常。
- [ ] Docker ClawBody 健康检查通过。
- [ ] Gemini Live 能连接、讲话、收到原生语音回答。
- [ ] 对话记录刷新后仍存在，中风险和协作过程可见。
- [ ] 实体验收时头部不晃动，只有耳朵轻微摆动。

