# 本地一致性配置指南

本文用于让同事拉取最新代码后，按同一套服务拓扑配置 PsyTwin-Sentinel。仓库不会提交真实密钥；请从项目负责人或团队密码管理器获取密钥，并填入本机 `.env`。

## 1. 本地基线

当前已验证的开发环境：

| 组件 | 版本或地址 |
| --- | --- |
| Node.js | 24.15.0 |
| npm | 11.12.1 |
| PostgreSQL | 15（Docker） |
| Redis | 7（Docker） |
| Sentinel | `http://localhost:3000` |
| LightRAG | `http://42.121.14.189:9621` |
| OpenClaw Gateway | `ws://127.0.0.1:18789` |
| ClawBody | `http://127.0.0.1:7860` |
| Host Bridge | `http://127.0.0.1:7861` |

建议使用与上述相同的 Node.js 主版本。需要 Docker Desktop 来运行本地 PostgreSQL 和 Redis。

## 2. 拉取与安装

```powershell
git pull
npm ci
Copy-Item .env.example .env
```

不要提交 `.env` 或 `.env.local`。这两个文件已被 Git 忽略。

## 3. 环境变量

编辑 `.env`。`.env.example` 已列出完整模板，至少需要确认以下配置。

### 必需：数据库、Redis 与认证

```env
POSTGRES_USER=psytwin
POSTGRES_PASSWORD=<团队约定的本地数据库密码>
POSTGRES_DB=psytwin_sentinel
POSTGRES_PORT=5432
DATABASE_URL="postgresql://psytwin:<URL编码后的密码>@localhost:5432/psytwin_sentinel?schema=public"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=<团队约定的本地Redis密码>
REDIS_DB=0
REDIS_URL="redis://:<URL编码后的密码>@127.0.0.1:6379/0"

JWT_SECRET=<至少32字节的随机字符串>
JWT_ISSUER=psytwin-sentinel
JWT_AUDIENCE=psytwin-sentinel
```

密码含有 `@`、`:`、`/` 等字符时，必须在连接 URL 中进行百分号编码。JWT 密钥可用以下命令生成：

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 完整 AI 功能

```env
DASHSCOPE_API_KEY=<阿里云百炼密钥>
OPENAI_API_KEY=<如需OpenAI向量能力则填写>

NEXT_PUBLIC_LIGHTRAG_WEBUI_URL=http://42.121.14.189:9621
LIGHTRAG_API_URL=http://42.121.14.189:9621
LIGHTRAG_API_KEY=<与LightRAG服务端一致的密钥>
NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT=<给开发人员看的提示，不放真实生产密钥>
LIGHTRAG_QUERY_MODE=hybrid
LIGHTRAG_MAX_CONTEXT_TOKENS=6000
```

`LIGHTRAG_API_KEY` 只能使用服务端变量名，不能添加 `NEXT_PUBLIC_` 前缀。浏览器访问云端 LightRAG 时，还需确保所在网络可以连接 TCP 9621。

### OpenClaw 与实体心宠联调

```env
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=<Gateway令牌>

CLAWBODY_SERVICE_URL=http://127.0.0.1:7860
CLAWBODY_SERVICE_KEY=<与ClawBody一致的服务密钥>
HOST_BRIDGE_URL=http://127.0.0.1:7861
HOST_BRIDGE_API_KEY=<与Host Bridge一致的服务密钥>
PET_AI_DEMO_STUDENT_ID=stu-test
```

没有实体设备时可以保留这些地址，相关页面会显示服务未连接，不影响普通后台功能。实体联调的 Windows 服务安装、端口与安全要求见 [REACHY_MINI_SETUP_GUIDE.md](./REACHY_MINI_SETUP_GUIDE.md)。

## 4. 启动基础设施和初始化数据

```powershell
docker compose --env-file .env -f docker-compose.dev.yml up -d
npx prisma migrate deploy
npx prisma generate
npm run seed:incremental
```

`seed:incremental` 使用 `upsert`，不会清空已有业务数据。首次启动或拉取到新迁移后都可以安全执行。

如需先预览将写入的数据：

```powershell
npm run seed:incremental -- --dry-run
```

## 5. 启动与验收

```powershell
npm run dev
```

依次检查：

- 打开 `http://localhost:3000` 并正常登录。
- 打开 `http://localhost:3000/ai-config?tab=rag`，确认知识库页面可加载。
- 打开固定测试学生 `stu-test` 的心宠页面，确认演示配置存在。
- 若进行实体联调，确认本机 7860、7861 和 18789 服务分别可达。

提交代码前执行：

```powershell
npm run build
npm run lint
```

## 6. 常见不一致排查

- 数据库提示表不存在：重新执行 `npx prisma migrate deploy` 和 `npx prisma generate`。
- RAG 页面 401/空白：核对 `LIGHTRAG_API_KEY`，重新登录 Sentinel，并确认 9621 端口可达。
- Redis 认证失败：确保 `REDIS_PASSWORD` 与 `REDIS_URL` 中的密码一致。
- 心宠联调显示离线：这是 7860/7861/18789 中至少一个本地服务未启动，不要通过击杀全部 Node 进程释放端口。
- 环境变量修改后未生效：停止当前开发服务器后重新执行 `npm run dev`。

## 7. 密钥交接清单

以下值不能进入 Git，需通过团队密码管理器单独交接：

- `DASHSCOPE_API_KEY`
- `OPENAI_API_KEY`（如使用）
- `JWT_SECRET`
- `LIGHTRAG_API_KEY`
- `OPENCLAW_GATEWAY_TOKEN`
- `CLAWBODY_SERVICE_KEY`
- `HOST_BRIDGE_API_KEY`
- PostgreSQL 与 Redis 密码

完成交接后，同事只需复制 `.env.example`、填入上述密钥，并执行第 4、5 节命令即可获得与当前本地相同的服务拓扑。
