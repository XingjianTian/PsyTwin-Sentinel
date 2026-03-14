#!/bin/bash
# 使用清理后的 SQL 文件导入数据

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
export PGPASSWORD="Pt5xK9mR2wQ7vN3j"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="psytwin"
DB_NAME="psytwin_sentinel"
SQL_FILE="/Users/txj/Projects/PsyTwin/PsyTwin-Sentinel/psytwin_backup_clean.sql"

echo "🚀 PsyTwin 数据库导入（使用清理后的 SQL）"
echo "=========================================="
echo ""

# 检查文件
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: 找不到 SQL 文件"
    exit 1
fi

echo "📄 SQL 文件: $SQL_FILE"
echo "📊 文件大小: $(ls -lh $SQL_FILE | awk '{print $5}')"
echo ""

# 步骤 1: 导入数据
echo "📥 开始导入数据..."
echo "   （使用单行事务模式，跳过已存在对象错误）"
echo ""

# 使用 psql 导入，关键参数：
# --single-transaction: 所有操作在一个事务中
# --set ON_ERROR_STOP=off: 遇到错误不停止，继续执行
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --single-transaction \
  --set ON_ERROR_STOP=off \
  -f $SQL_FILE 2>&1 | grep -E "(ERROR|错误|COPY|SET|ALTER)" | head -30

IMPORT_STATUS=$?

echo ""
echo "=========================================="

if [ $IMPORT_STATUS -eq 0 ]; then
  echo "✅ 导入命令执行完成"
else
  echo "⚠️  导入过程中有一些错误（通常是因为对象已存在）"
fi

echo ""
echo "📊 验证导入结果:"
echo ""

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
\echo '表名                          记录数'
\echo '----------------------------------------'
SELECT 
  'students' as table_name, 
  COUNT(*) as count
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
UNION ALL SELECT 'psych_profiles', COUNT(*) FROM psych_profiles
UNION ALL SELECT 'alerts', COUNT(*) FROM alerts
UNION ALL SELECT 'chat_sessions', COUNT(*) FROM chat_sessions
UNION ALL SELECT 'devices', COUNT(*) FROM devices
ORDER BY table_name;

\echo ''
\echo '关键关联检查:'
\echo '----------------------------------------'
SELECT 
  'intervention_records ↔ details' as check_item,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END as status
FROM intervention_records ir
JOIN intervention_details id ON ir.id = id.record_id
UNION ALL
SELECT 
  'students ↔ psych_profiles',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM students s
JOIN psych_profiles p ON s.id = p.student_id
UNION ALL
SELECT 
  'appointments ↔ students+teachers',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM appointments a
JOIN students s ON a.student_id = s.id
JOIN teachers t ON a.teacher_id = t.id
UNION ALL
SELECT 
  'posts ↔ students',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM posts p
JOIN students s ON p.author_id = s.id;
EOF

echo ""
echo "=========================================="
echo "✅ 导入流程完成！"
echo "=========================================="
