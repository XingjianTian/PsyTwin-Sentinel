#!/bin/bash
# PsyTwin 数据库导入脚本
# 使用方法: ./import-database.sh [数据库名] [用户名]

set -e  # 遇到错误立即退出

DB_NAME=${1:-psytwin}
DB_USER=${2:-psytwin}
SQL_FILE=${3:-psytwin_backup.sql}

echo "🚀 PsyTwin 数据库导入工具"
echo "=========================="
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "SQL文件: $SQL_FILE"
echo ""

# 检查文件
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: 找不到 SQL 文件 $SQL_FILE"
    exit 1
fi

# 确认操作
echo "⚠️  警告: 这将清空数据库 $DB_NAME 中的所有数据！"
read -p "是否继续? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "📦 步骤 1/4: 清空现有数据库..."
dropdb --if-exists "$DB_NAME"
createdb -O "$DB_USER" "$DB_NAME"
echo "✅ 数据库已重建"

echo ""
echo "📥 步骤 2/4: 导入数据（使用延迟约束检查）..."
psql -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- 开始事务
BEGIN;

-- 设置延迟约束（关键！这样即使导入顺序有问题也能成功）
SET CONSTRAINTS ALL DEFERRED;

-- 导入 SQL 文件
\i psytwin_backup.sql

-- 提交事务
COMMIT;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 数据导入成功"
else
    echo "❌ 数据导入失败"
    exit 1
fi

echo ""
echo "🔍 步骤 3/4: 验证数据完整性..."
psql -U "$DB_USER" -d "$DB_NAME" << 'EOF'
\echo ''
\echo '数据表统计:'
\echo '=========================='
SELECT 
  'students' as "表名", 
  COUNT(*) as "记录数"
FROM students
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'faculties', COUNT(*) FROM faculties
UNION ALL SELECT 'intervention_records', COUNT(*) FROM intervention_records
UNION ALL SELECT 'intervention_details', COUNT(*) FROM intervention_details
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'warnings', COUNT(*) FROM warnings
UNION ALL SELECT 'timeline_events', COUNT(*) FROM timeline_events
UNION ALL SELECT 'vr_sessions', COUNT(*) FROM vr_sessions
ORDER BY "表名";

\echo ''
\echo '检查外键引用完整性:'
\echo '=========================='
SELECT 
  'alerts' as "表名",
  COUNT(*) FILTER (WHERE s.id IS NULL) as "孤儿记录数",
  COUNT(*) as "总记录数"
FROM alerts a
LEFT JOIN students s ON a.student_id = s.id
UNION ALL
SELECT 'appointments', 
  COUNT(*) FILTER (WHERE s.id IS NULL),
  COUNT(*)
FROM appointments a
LEFT JOIN students s ON a.student_id = s.id
UNION ALL
SELECT 'intervention_records',
  COUNT(*) FILTER (WHERE s.id IS NULL),
  COUNT(*)
FROM intervention_records ir
LEFT JOIN students s ON ir.student_id = s.id
UNION ALL
SELECT 'posts',
  COUNT(*) FILTER (WHERE s.id IS NULL),
  COUNT(*)
FROM posts p
LEFT JOIN students s ON p.author_id = s.id;

\echo ''
\echo '空表列表（需要补充数据）:'
\echo '=========================='
SELECT 'data_sources' as "表名" WHERE NOT EXISTS (SELECT 1 FROM data_sources)
UNION ALL
SELECT 'notification_templates' WHERE NOT EXISTS (SELECT 1 FROM notification_templates)
UNION ALL
SELECT 'notification_rules' WHERE NOT EXISTS (SELECT 1 FROM notification_rules)
UNION ALL
SELECT 'notification_channels' WHERE NOT EXISTS (SELECT 1 FROM notification_channels)
UNION ALL
SELECT 'sync_tasks' WHERE NOT EXISTS (SELECT 1 FROM sync_tasks)
UNION ALL
SELECT 'system_config' WHERE NOT EXISTS (SELECT 1 FROM system_config)
UNION ALL
SELECT 'audit_logs' WHERE NOT EXISTS (SELECT 1 FROM audit_logs);
EOF

echo ""
echo "📝 步骤 4/4: 生成补充数据建议..."

# 检查哪些空表需要运行 seed 脚本
psql -U "$DB_USER" -d "$DB_NAME" -tc "SELECT COUNT(*) FROM data_sources" | grep -q "^\\s*0\\s*$" && NEED_SEED=1

if [ "$NEED_SEED" = "1" ]; then
    echo ""
    echo "⚠️  以下系统表为空，建议运行 seed 脚本补充数据:"
    echo "  - data_sources (数据源配置)"
    echo "  - notification_templates (通知模板)"
    echo "  - notification_rules (通知规则)"
    echo "  - system_config (系统配置)"
    echo ""
    echo "运行命令:"
    echo "  npx prisma db seed"
fi

echo ""
echo "✅ 导入完成！"
echo ""
echo "后续建议:"
echo "  1. 验证应用程序连接是否正常"
echo "  2. 运行 seed 脚本补充系统配置数据"
echo "  3. 检查日志确认无错误"
echo ""
echo "查看详细诊断报告:"
echo "  cat sql-diagnosis-report.md"
