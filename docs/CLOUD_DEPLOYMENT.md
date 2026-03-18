# PsyTwin 云上部署指南

## 📁 目录结构

```
prisma/
├── schema.prisma              # 完整的数据库模型定义
├── migrations/                # 迁移文件（Prisma 自动生成）
│   ├── 20260305124333_init    # 初始迁移
│   └── migration_lock.toml    # 迁移锁定文件
└── seed/                      # 数据种子（按顺序执行）
    ├── 01-agents.ts           # OpenClaw Agents（必需）
    ├── 02-faculties.ts        # 院系数据（可选）
    ├── 03-users.ts            # 系统用户（可选）
    └── 04-students.ts         # 学生数据（可选，开发用）

scripts/
└── deploy-to-cloud.sh         # 一键部署脚本
```

## 🚀 快速部署（推荐）

### 1. 准备云数据库

在云服务商（阿里云 RDS / AWS RDS / 腾讯云）创建 PostgreSQL 实例：

```bash
# 获取连接字符串，格式如下：
export DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### 2. 执行部署

```bash
# 基础部署（仅创建表结构和核心配置）
./scripts/deploy-to-cloud.sh production

# 包含测试数据的部署
export SEED_TEST_DATA=true
./scripts/deploy-to-cloud.sh production
```

## 📝 手动部署步骤

如果你需要更细粒度的控制，可以按以下步骤手动执行：

### Step 1: 设置环境变量

```bash
export DATABASE_URL="postgresql://username:password@host:port/psytwin_sentinel?schema=public"
```

### Step 2: 创建表结构

```bash
npx prisma migrate deploy
```

这会读取 `prisma/migrations/` 中的所有迁移文件并依次执行。

### Step 3: 生成 Prisma Client

```bash
npx prisma generate
```

### Step 4: 插入基础数据（必需）

```bash
npx tsx prisma/seed/01-agents.ts
```

这会在 `openclaw_agents` 表中创建 6 个核心 Agent：
- `main`: 首席数据官
- `Collector`: 采集员
- `Therapist`: 咨询师
- `Relayer`: 中继工程师
- `DBA`: 数据哨兵
- `Analyst`: 分析师

### Step 5: 插入业务数据（可选）

```bash
# 院系数据
npx tsx prisma/seed/02-faculties.ts

# 系统用户（管理员、咨询师）
npx tsx prisma/seed/03-users.ts

# 学生数据（开发测试用）
npx tsx prisma/seed/04-students.ts
```

## 🔧 迁移管理

### 查看迁移状态

```bash
npx prisma migrate status
```

### 创建新迁移（开发时）

当你修改了 `schema.prisma` 后：

```bash
npx prisma migrate dev --name add_new_feature
```

### 重置迁移（⚠️ 危险，会删除数据）

```bash
npx prisma migrate reset
```

## 📊 数据验证

部署完成后，验证数据是否正确：

```bash
# 打开 Prisma Studio 查看数据
npx prisma studio

# 或者在代码中查询
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.openClawAgent.count();
  console.log('OpenClaw Agents:', count);
  const agents = await prisma.openClawAgent.findMany();
  console.log(agents.map(a => a.id));
  await prisma.\$disconnect();
}
main();
"
```

## 🔄 数据迁移（从本地到云端）

如果你需要把本地数据迁移到云端：

### 方式 1: 使用 pg_dump / pg_restore（推荐）

```bash
# 1. 导出本地数据
pg_dump -h localhost -U postgres psytwin_sentinel > backup.sql

# 2. 导入到云端
psql $DATABASE_URL < backup.sql
```

### 方式 2: 使用 Prisma Seed

如果数据量不大，可以编写 seed 脚本：

```bash
# 1. 先在本地导出数据为 JSON
npx tsx scripts/export-data.ts

# 2. 在云端导入
npx tsx prisma/seed/05-import-production.ts
```

## 🛠️ 故障排查

### 问题 1: 迁移失败

```bash
# 查看具体错误
npx prisma migrate status

# 如果是开发环境，可以重置
npx prisma migrate reset

# 如果是生产环境，手动标记迁移已应用
npx prisma migrate resolve --applied "20260305124333_init"
```

### 问题 2: 连接超时

检查 `DATABASE_URL` 中的 host 和 port 是否正确，以及安全组是否开放访问。

### 问题 3: 权限不足

确保数据库用户有创建表和扩展的权限：

```sql
GRANT ALL PRIVILEGES ON DATABASE psytwin_sentinel TO your_user;
```

## 📋 部署检查清单

- [ ] 云数据库实例已创建
- [ ] 数据库用户有足够权限
- [ ] `DATABASE_URL` 环境变量已设置
- [ ] 安全组允许应用服务器访问数据库
- [ ] Prisma Migrate 成功执行
- [ ] OpenClaw Agents 数据已插入
- [ ] 应用可以正常连接数据库

## 🆘 紧急回滚

如果部署出现问题：

```bash
# 1. 备份当前数据
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 回滚到上一版本（如果有之前的备份）
psql $DATABASE_URL < previous_backup.sql

# 3. 或者清空数据库重新开始
npx prisma migrate reset --force
```

## 💡 最佳实践

1. **总是先备份**：在生产环境执行任何操作前，先备份数据
2. **分步执行**：不要一次性执行所有 seed，按顺序逐个验证
3. **使用事务**：重要的数据迁移应该使用数据库事务
4. **测试环境**：先在测试环境验证整个流程，再操作生产环境
5. **监控日志**：部署时关注控制台输出，及时发现错误

## 📞 需要帮助？

- Prisma 文档：https://www.prisma.io/docs
- 数据库问题：检查 PostgreSQL 日志
- 迁移问题：运行 `npx prisma migrate status` 查看状态
