#!/bin/bash
#
# PsyTwin 云上部署脚本
# 用法: ./deploy-to-cloud.sh [环境]
# 示例: ./deploy-to-cloud.sh production
#

set -e

ENV=${1:-production}
echo "🚀 开始部署到 ${ENV} 环境..."

# 检查必要的环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "❌ 错误: DATABASE_URL 未设置"
  exit 1
fi

# 1. 验证数据库连接
echo "📡 检查数据库连接..."
npx prisma db execute --url "$DATABASE_URL" --stdin <<EOF
SELECT 1;
EOF

# 2. 执行数据库迁移（创建表结构）
echo "🗄️  执行数据库迁移..."
npx prisma migrate deploy

# 3. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate

# 4. 插入基础配置数据（Agents 等）
echo "🌱 插入基础配置数据..."
npx tsx prisma/seed/01-agents.ts

# 5. 可选：插入业务测试数据
if [ "$SEED_TEST_DATA" = "true" ]; then
  echo "🧪 插入业务测试数据..."
  npx tsx prisma/seed/02-faculties.ts
  npx tsx prisma/seed/03-users.ts
  npx tsx prisma/seed/04-students.ts
fi

echo "✅ 部署完成！"
echo ""
echo "📊 验证命令:"
echo "  npx prisma studio        # 打开数据库管理界面"
echo "  npx prisma migrate status # 查看迁移状态"
