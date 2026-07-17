# PsyTwin-Sentinel 数据注入指南

本文用于在开发、联调或测试环境中初始化 PsyTwin-Sentinel 的 PostgreSQL 数据，重点解决微信小程序（PsyTwin-Pocket）和 Sentinel 管理看板显示为空的问题。

> 适用项目：`PsyTwin-Sentinel`
>
> 适用数据库：PostgreSQL + Prisma
>
> 重要提醒：本文中的种子数据是开发/测试数据，不是真实学生心理健康数据。不要把测试数据注入生产库，也不要把包含真实个人信息的数据库备份提交到 Git 仓库。

## 1. 先理解“代码已上传”和“数据库有数据”的区别

仓库中保存的是数据库模型、迁移文件和种子脚本；这些文件被 Git 上传，并不代表每一台电脑、每个 Docker 容器或每个云数据库都已经执行过注入命令。

如果同事的看板为空，通常是以下原因之一：

1. `.env` 连接到了一个新建的空数据库。
2. 只执行了 `prisma migrate deploy`，只创建了表，没有插入业务数据。
3. 忘记执行完整种子或增量种子。
4. 启动应用时使用的 `DATABASE_URL` 与执行种子时使用的不是同一个地址。
5. 数据库有数据，但请求的是错误的接口、用户或环境。

当前相关文件：

- `prisma/schema.prisma`：数据库模型
- `prisma/migrations/`：数据库迁移
- `prisma/seed.ts`：完整开发测试种子
- `prisma/seed/incremental-core-data.ts`：增量核心种子
- `prisma/seed-pet-diary-templates.ts`：心宠日记模板种子
- `app/api/pocket/`：微信小程序接口
- `docs/api_contract.md`：Pocket API 契约

## 2. 开始前的环境检查

### 2.1 进入正确的项目目录

Windows PowerShell：

```powershell
cd C:\Users\<用户名>\Desktop\PsyTwin\PsyTwin-Sentinel
Test-Path prisma/schema.prisma
```

返回 `True` 才表示路径正确。macOS/Linux：

```bash
cd ~/Desktop/PsyTwin/PsyTwin-Sentinel
test -f prisma/schema.prisma && echo OK
```

### 2.2 安装依赖

```bash
npm install
node --version
npm --version
```

建议使用 Node.js 20 LTS 或更高版本。

### 2.3 配置数据库连接

在项目根目录创建 `.env`。该文件已被 `.gitignore` 忽略，不要提交：

```env
DATABASE_URL="postgresql://psytwin:your_password@localhost:5432/psytwin_sentinel?schema=public"
```

远程数据库需要把 `localhost`、端口、数据库名、用户名和密码替换成实际值。

PowerShell 临时设置环境变量：

```powershell
$env:DATABASE_URL = "postgresql://psytwin:your_password@localhost:5432/psytwin_sentinel?schema=public"
```

不要使用下面这种容易失效的写法：

```powershell
set DATABASE_URL=...
```

### 2.4 检查数据库是否可访问

```bash
npx prisma migrate status
```

如果本机安装了 PostgreSQL 客户端，也可以查询连接信息：

PowerShell：

```powershell
psql "$env:DATABASE_URL" -c "select current_database(), current_user;"
```

macOS/Linux：

```bash
psql "$DATABASE_URL" -c "select current_database(), current_user;"
```

### Docker 启动方式（推荐）

刚 clone 的环境还没有 PostgreSQL 和 Redis 数据服务。推荐使用仓库中的 `docker-compose.mac.yml`；虽然文件名保留了历史命名，但 Windows Docker Desktop、macOS 和 Linux 都可以运行。

这个 Compose 文件使用 `pgvector/pgvector:pg15`。项目的第一条迁移会执行 `CREATE EXTENSION vector`，所以不能用不带 pgvector 的普通 PostgreSQL 镜像替代。

在项目根目录 `.env` 中配置与 `docker-compose.mac.yml` 一致的值：

```env
POSTGRES_USER=psytwin
POSTGRES_PASSWORD=<与 docker-compose.mac.yml 中一致>
POSTGRES_DB=psytwin_sentinel
POSTGRES_PORT=5432
DATABASE_URL="postgresql://psytwin:<同上密码>@localhost:5432/psytwin_sentinel?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<与 docker-compose.mac.yml 中一致>
REDIS_URL="redis://:<同上密码>@localhost:6379"
```

启动服务：

```bash
docker compose -f docker-compose.mac.yml up -d
docker compose -f docker-compose.mac.yml ps
```

等待 PostgreSQL 和 Redis 健康检查通过后，再执行 Prisma 命令。

停止服务但保留数据：

```bash
docker compose -f docker-compose.mac.yml stop
```

重新启动：

```bash
docker compose -f docker-compose.mac.yml start
```

删除容器但保留数据卷：

```bash
docker compose -f docker-compose.mac.yml down
```

### 如果要求数据库内容逐条完全一致

Docker、迁移和种子脚本只能保证表结构和功能测试数据一致。当前 `prisma/seed.ts` 使用了 `Math.random()` 和 `Date.now()`，所以随机坐标、性别、点赞、收藏、通知时间等不会逐条相同。

如果必须复制你当前电脑的完整数据库，请在你这边导出快照，再通过安全渠道交给对方；不要把包含真实数据的快照提交到公共 Git 仓库。

PowerShell 导出：

```powershell
pg_dump --format=custom --file=psytwin-local.dump "$env:DATABASE_URL"
```

对方启动同版本 Docker 数据库后，在确认目标库可以被覆盖的前提下恢复：

```powershell
pg_restore --clean --if-exists --no-owner --dbname "$env:DATABASE_URL" psytwin-local.dump
```

快照恢复和 `npx prisma db seed` 是两种互斥的初始化方式。不要先恢复快照，再无理由执行完整种子。

不要同时启动 `docker-compose.mac.yml` 和 `docker-compose.dev.yml`，两者使用相同的容器名和默认端口，容易冲突。`docker-compose.dev.yml` 使用普通 `postgres:15-alpine`，当前项目不建议用它执行完整迁移，除非已自行安装并验证 pgvector。

如果 5432 或 6379 已被占用，可以修改 Compose 左侧端口，例如 `15432:5432`；修改后 `.env` 的 `DATABASE_URL` 也必须改成 `15432`。

> Docker + migration + seed 可以复现相同的表结构和功能测试数据，但当前 `prisma/seed.ts` 使用了随机值和 `Date.now()`，所以不能保证每一条随机记录与另一台电脑逐条一致。需要完全一致时，应使用 `pg_dump` 导出的数据库快照，不要把包含真实数据的快照提交到公共仓库。

## 3. 推荐的数据注入流程

对一个全新的开发数据库，按顺序执行以下命令，每一步成功后再执行下一步。

### 第一步：生成 Prisma Client

```bash
npx prisma generate
```

看到 `Generated Prisma Client` 即表示成功。

### 第二步：应用数据库迁移

```bash
npx prisma migrate deploy
```

该命令只创建或更新表结构，不会自动插入业务测试数据。

### 第三步：执行完整测试种子

```bash
npx prisma db seed
```

该命令会执行 `prisma/seed.ts`，注入开发看板和 Pocket 联调需要的基础数据，包括学生、教师、心理档案、风险评估、干预记录、心墙帖子、评论、点赞、收藏、咨询室、预约、通知、聊天会话、VR 场景等。

特别注意：项目没有定义 `npm run seed` 脚本。执行：

```bash
npm run seed
```

会报：

```text
npm error Missing script: "seed"
```

正确命令是：

```bash
npx prisma db seed
```

### 第四步：执行增量核心种子

```bash
npm run seed:incremental
```

该命令补充 OpenClaw Agents 和心宠日记模板，使用 `upsert`，适合已有业务数据的开发库。

### 第五步：单独补充心宠日记模板（可选）

```bash
npm run seed:pet-diary
```

如果需要生成某个日期的具体日记条目，应通过应用接口完成，接口和参数以 `docs/api_contract.md` 为准，不要反复导入数据库快照。

## 4. 只想补齐 Pocket 看板数据

全新开发库仍然建议执行完整流程：

```bash
npx prisma migrate deploy
npx prisma db seed
npm run seed:incremental
npm run seed:pet-diary
```

如果数据库已经有正式业务数据，不建议直接执行完整种子。先备份，再用 Prisma Studio 确认缺少哪些模型：

```bash
npx prisma studio
```

重点检查：`Student`、`Post`、`Comment`、`PostLike`、`PostCollection`、`Appointment`、`StudentNotification`、`ChatSession`、`ChatMessage`、`PetDiaryTemplate`、`PetDiaryEntry`。

`prisma/backups/seeds/` 中的 Pocket 脚本是历史兼容脚本，不是当前默认入口。若旧脚本出现字段、枚举或表不存在错误，应回到当前的 `prisma/seed.ts` 和增量种子流程，不要盲目修改旧脚本。

## 5. 注入完成后的验证

### 5.1 检查迁移状态

```bash
npx prisma migrate status
```

确认没有待应用迁移，也没有 failed migration。

### 5.2 使用 Prisma Studio 检查数据

```bash
npx prisma studio
```

如果 Studio 中有数据但应用为空，优先比较同事执行命令和启动应用时的 `DATABASE_URL`，尤其是 host、端口和数据库名。

### 5.3 验证 Pocket 首页动态接口

启动 Sentinel：

```bash
npm run dev
```

另开终端执行。Windows PowerShell：

```powershell
curl.exe "http://localhost:3000/api/pocket/student/home/feed?page=1^&limit=20" -H "Authorization: Bearer stu001"
```

macOS/Linux：

```bash
curl "http://localhost:3000/api/pocket/student/home/feed?page=1&limit=20" \
  -H "Authorization: Bearer stu001"
```

正常响应应包含 `code: 0`，并且 `data` 中的 `follow`、`square` 或 `secret` 至少有数据。

### 5.4 验证前端页面

打开：

```text
http://localhost:3000/dashboard
http://localhost:3000/pocket-records
```

如果接口有数据但页面为空，应检查浏览器 Network 请求、登录身份、字段映射和缓存，而不是重复注入数据库。

## 6. 常见报错与处理方法

### `Missing script: "seed"`

项目没有 `npm run seed`，改用：

```bash
npx prisma db seed
```

### `P1001: Can't reach database server`

通常是 PostgreSQL 未启动、host/port 错误、防火墙阻断或远程安全组未放行。检查 `.env`，确认数据库服务和 Docker 端口映射，再执行：

```bash
npx prisma migrate status
```

### `P1003: Database does not exist`

连接字符串中的数据库尚未创建。用 PostgreSQL 管理员创建数据库：

```sql
CREATE DATABASE psytwin_sentinel;
```

然后重试：

```bash
npx prisma migrate deploy
npx prisma db seed
```

### `P1010: User was denied access`

用户名、密码或数据库权限不正确。确认用户拥有连接、建表和写入权限。不要把真实密码发送到群聊或提交到 Git。

### `P3005: The database schema is not empty`

目标数据库已有表或历史数据。测试库确认可以清空时才考虑：

```bash
npx prisma migrate reset
```

该命令会删除数据；已有业务库或生产库禁止使用，改用 `npx prisma migrate deploy`。

### `P3006` 或迁移执行失败

先查看：

```bash
npx prisma migrate status
```

常见原因是数据库版本过旧、迁移被手动执行、字段或枚举被人工修改。不要删除 `prisma/migrations/`，也不要在生产库执行 `migrate dev`。

### `Unique constraint failed`

固定 ID、邮箱、手机号或 slug 已存在。先用 Prisma Studio 查看冲突记录；测试环境确认后再处理，生产环境不要自行删除记录。不要混用多个历史 Pocket seed 脚本。

### `The table ... does not exist`

迁移没有执行，或当前连接到了另一套数据库：

```bash
npx prisma migrate deploy
npx prisma generate
```

同时重新检查 `.env`。

### `Unknown field`、枚举值错误或 Prisma Client 类型不匹配

代码、迁移和 Prisma Client 版本不一致，或使用了旧脚本：

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

优先使用当前 `prisma/seed.ts`，不要优先使用 `prisma/backups/seeds/` 的历史文件。

### PowerShell 把 `&` 当成特殊字符

调用带查询参数的 URL 时使用 `curl.exe`，并把 URL 放在双引号中；必要时将 `&` 写成 `^&`：

```powershell
curl.exe "http://localhost:3000/api/pocket/student/home/feed?page=1^&limit=20" -H "Authorization: Bearer stu001"
```

### 页面仍为空，但数据库有数据

按顺序检查：

1. 页面访问的 Sentinel 地址是否正确。
2. 开发服务器启动时读取的 `.env` 是否正确。
3. Network 中 API URL、状态码和响应体。
4. API 是否返回 `code: 0`。
5. Authorization token 是否正确。
6. 重启开发服务器并硬刷新页面。
7. Pocket 的 Base URL 是否指向同一个 Sentinel 服务。

## 7. 生产环境注意事项

生产环境禁止直接执行：

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db push --force-reset
```

生产环境推荐只执行：

```bash
npx prisma generate
npx prisma migrate deploy
```

如果需要导入业务数据，必须先备份数据库，并在测试环境演练。不要把开发测试账号、测试帖子或虚构心理评估导入真实业务库。

## 8. 全新开发库的最短流程

确认 `.env` 正确后执行：

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run seed:incremental
npm run seed:pet-diary
npx prisma migrate status
npx prisma studio
```

之后启动：

```bash
npm run dev
```

访问 `http://localhost:3000/dashboard`，并按本文第 5.3 节验证 Pocket API。

## 9. 提交问题时应附带的信息

不要发送密码或完整 `DATABASE_URL`。请提供：

- 操作系统和 Node.js 版本
- 执行的命令
- 完整报错文本
- `npx prisma migrate status` 输出
- 数据库 host、端口、数据库名（隐藏用户名密码）
- Prisma Studio 中相关模型的记录数量
- 浏览器 Network 中对应 API 的状态码和响应摘要
