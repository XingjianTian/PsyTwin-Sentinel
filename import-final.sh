#!/bin/bash
# 数据库导入脚本

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
export PGPASSWORD="Pt5xK9mR2wQ7vN3j"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="psytwin"
DB_NAME="psytwin_sentinel"
SQL_FILE="/Users/txj/Projects/PsyTwin/PsyTwin-Sentinel/psytwin_backup.sql"

echo "🚀 PsyTwin 数据库导入"
echo "======================"
echo ""

# 检查当前数据
echo "📊 导入前数据检查:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 'students: ' || COUNT(*) FROM students
UNION ALL
SELECT 'teachers: ' || COUNT(*) FROM teachers
UNION ALL
SELECT 'intervention_records: ' || COUNT(*) FROM intervention_records
UNION ALL
SELECT 'intervention_details: ' || COUNT(*) FROM intervention_details;
"

echo ""
echo "⚠️  即将清空数据库并重新导入..."
echo ""

# 1. 清空所有表（按依赖顺序）
echo "🗑️  清空现有数据..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- 禁用外键约束检查
SET CONSTRAINTS ALL DEFERRED;

-- 清空所有表（按照依赖顺序）
TRUNCATE TABLE 
  chat_messages,
  notification_histories,
  sync_logs,
  post_collections,
  post_likes,
  comments,
  intervention_details,
  room_devices,
  document_chunks,
  expression_data,
  voice_analyses,
  vital_signs,
  vr_sessions,
  alerts,
  appointments,
  audit_logs,
  chat_sessions,
  intervention_records,
  post_collections,
  posts,
  psych_profiles,
  room_devices,
  schedule,
  student_notifications,
  sync_tasks,
  teachers,
  timeline_events,
  users,
  work_orders,
  ai_documents,
  ai_prompt_presets,
  data_sources,
  devices,
  faculties,
  consultation_rooms,
  room_devices,
  students,
  warnings,
  _prisma_migrations
RESTART IDENTITY CASCADE;
" 2>&1 | grep -v "NOTICE:" | head -5

echo "✅ 数据已清空"
echo ""

# 2. 导入 SQL 文件（关键：使用单行事务模式）
echo "📥 开始导入 SQL 文件..."
echo "   文件: $SQL_FILE"
echo "   大小: $(ls -lh $SQL_FILE | awk '{print $5}')"
echo ""

# 使用 psql 导入，启用事务
time psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --single-transaction \
  --set ON_ERROR_STOP=on \
  -f $SQL_FILE 2>&1 | tail -20

IMPORT_STATUS=$?

echo ""
echo "======================"

if [ $IMPORT_STATUS -eq 0 ]; then
  echo "✅ 导入成功！"
else
  echo "❌ 导入失败（错误码: $IMPORT_STATUS）"
fi

echo ""
echo "📊 导入后数据检查:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 'students: ' || COUNT(*) FROM students
UNION ALL
SELECT 'teachers: ' || COUNT(*) FROM teachers
UNION ALL
SELECT 'intervention_records: ' || COUNT(*) FROM intervention_records
UNION ALL
SELECT 'intervention_details: ' || COUNT(*) FROM intervention_details
UNION ALL
SELECT 'appointments: ' || COUNT(*) FROM appointments
UNION ALL
SELECT 'posts: ' || COUNT(*) FROM posts
UNION ALL
SELECT 'warnings: ' || COUNT(*) FROM warnings
UNION ALL
SELECT 'timeline_events: ' || COUNT(*) FROM timeline_events;
"

echo ""
echo "🔍 外键完整性检查:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
  'orphan alerts: ' || COUNT(*) FILTER (WHERE s.id IS NULL)
FROM alerts a
LEFT JOIN students s ON a.student_id = s.id
UNION ALL
SELECT 
  'orphan appointments: ' || COUNT(*) FILTER (WHERE s.id IS NULL)
FROM appointments apt
LEFT JOIN students s ON apt.student_id = s.id
UNION ALL
SELECT 
  'orphan intervention_records: ' || COUNT(*) FILTER (WHERE s.id IS NULL)
FROM intervention_records ir
LEFT JOIN students s ON ir.student_id = s.id;
"

echo ""
echo "✅ 导入流程完成"
