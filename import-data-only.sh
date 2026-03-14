#!/bin/bash
# 只导入数据（跳过 CREATE 语句）

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
export PGPASSWORD="Pt5xK9mR2wQ7vN3j"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="psytwin"
DB_NAME="psytwin_sentinel"
SQL_FILE="/Users/txj/Projects/PsyTwin/PsyTwin-Sentinel/psytwin_backup.sql"

echo "🚀 PsyTwin 数据导入（仅数据）"
echo "=============================="
echo ""

# 步骤 1: 清空所有表数据
echo "🗑️  步骤 1: 清空所有表数据..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -q << 'EOF'
-- 禁用触发器以避免外键约束问题
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
    END LOOP;
END $$;

-- 清空所有表
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
  posts,
  psych_profiles,
  schedules,
  student_notifications,
  sync_tasks,
  teachers,
  timeline_events,
  users,
  work_orders,
  warnings,
  room_devices,
  students,
  ai_documents,
  ai_prompt_presets,
  data_sources,
  devices,
  faculties,
  consultation_rooms,
  vr_scenes,
  document_chunks,
  notification_templates,
  notification_rules,
  notification_channels,
  silent_hours,
  ip_whitelist,
  system_config,
  _prisma_migrations
RESTART IDENTITY;

-- 重新启用触发器
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL';
    END LOOP;
END $$;
EOF

echo "✅ 数据已清空"
echo ""

# 步骤 2: 提取并导入数据
echo "📥 步骤 2: 导入数据..."

# 创建临时文件，提取 COPY 数据
TEMP_SQL=$(mktemp)

echo "SET CONSTRAINTS ALL DEFERRED;" > $TEMP_SQL
echo "" >> $TEMP_SQL

# 提取 COPY 命令块
grep -A 1000 "^COPY public" "$SQL_FILE" | grep -B 1000 "^\\\\." >> $TEMP_SQL

echo "" >> $TEMP_SQL
echo "COMMIT;" >> $TEMP_SQL

# 执行导入
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --single-transaction \
  -f $TEMP_SQL 2>&1 | tail -10

rm $TEMP_SQL

echo ""
echo "✅ 数据导入完成"
echo ""

# 步骤 3: 验证
echo "📊 步骤 3: 验证导入结果"
echo ""

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
\echo ''
\echo '数据表统计:'
\echo '========================'
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
UNION ALL SELECT 'psych_profiles', COUNT(*) FROM psych_profiles
UNION ALL SELECT 'alerts', COUNT(*) FROM alerts
ORDER BY "表名";

\echo ''
\echo '关键数据检查:'
\echo '========================'
SELECT 
  'students with faculty' as "检查项",
  COUNT(*) as "数量"
FROM students s
JOIN faculties f ON s.faculty_id = f.id
UNION ALL
SELECT 
  'intervention_records with details',
  COUNT(*)
FROM intervention_records ir
JOIN intervention_details id ON ir.id = id.record_id
UNION ALL
SELECT 
  'appointments with students',
  COUNT(*)
FROM appointments a
JOIN students s ON a.student_id = s.id;
EOF

echo ""
echo "=============================="
echo "✅ 导入流程完成"
