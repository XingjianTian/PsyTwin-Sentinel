# Prisma 数据库迁移说明

## 📁 新目录结构

```
prisma/
├── schema.prisma                 # 主模型定义（49个表）
├── migrations/                   # 迁移历史
│   ├── 20260305124333_init/      # 初始迁移
│   ├── 20250308000000_add_pgvector/  # pgvector 扩展
│   └── migration_lock.toml       # 迁移锁定
└── seed/                         # 数据种子（按顺序编号）
    ├── 01-agents.ts              # ✅ OpenClaw Agents（必需）
    ├── 02-faculties.ts           # 院系数据（可选）
    ├── 03-users.ts               # 系统用户（可选）
    └── deprecated/               # 旧种子备份
        ├── seed.ts
        ├── seed-agents.ts
        └── seed-pocket*.ts
```

## 🚀 上云部署流程

### 快速部署

```bash
# 设置云数据库连接
export DATABASE_URL="postgresql://user:pass@host:port/db"

# 一键部署
./scripts/deploy-to-cloud.sh
```

### 手动步骤

```bash
# 1. 迁移表结构
npx prisma migrate deploy

# 2. 生成 Client
npx prisma generate

# 3. 插入基础数据（必需）
npx tsx prisma/seed/01-agents.ts

# 4. 可选：插入测试数据
npx tsx prisma/seed/02-faculties.ts
npx tsx prisma/seed/03-users.ts
```

## 📊 当前状态

- ✅ 迁移状态正常
- ✅ 6 个 OpenClaw Agents 已配置
- ✅ 49 个数据库表
- ✅ 构建通过

## 📝 详细文档

见 [docs/CLOUD_DEPLOYMENT.md](../docs/CLOUD_DEPLOYMENT.md)

## Safe incremental seed

For a fresh database, run migrations first and then inject required core data:

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed:incremental
```

`npm run seed:incremental` is idempotent and does not clear existing data. It uses stable unique keys with Prisma `upsert` for OpenClaw agents and pet diary templates, so teammates can run it after pulling new database updates without losing local records.

Use `npm run seed:incremental -- --dry-run` to preview the record groups without writing to the database.
