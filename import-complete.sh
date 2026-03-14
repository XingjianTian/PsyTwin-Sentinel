#!/bin/bash
# 使用 psql 直接导入，忽略已存在对象的错误

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
export PGPASSWORD="Pt5xK9mR2wQ7vN3j"

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="psytwin"
DB_NAME="psytwin_sentinel"
SQL_FILE="/Users/txj/Projects/PsyTwin/PsyTwin-Sentinel/psytwin_backup.sql"

echo "🚀 PsyTwin 数据库导入"
echo "====================="
echo ""

# 步骤 1: 检查当前状态
echo "📊 导入前状态:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 'students: ' || COUNT(*) FROM students
UNION ALL SELECT 'teachers: ' || COUNT(*) FROM teachers
UNION ALL SELECT 'intervention_records: ' || COUNT(*) FROM intervention_records;
"

echo ""
echo "🧹 步骤 1: 清理现有数据..."

# 禁用外键约束，清空所有表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -q << 'EOF'
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 禁用所有触发器
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;
EOF

# 清空所有表数据
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('_prisma_migrations')
        ORDER BY tablename
    LOOP
        BEGIN
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END \$\$;
"

# 重新启用触发器
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -q << 'EOF'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;
EOF

echo "✅ 数据已清空"
echo ""

# 步骤 2: 创建临时 SQL 文件（仅数据部分）
echo "📄 步骤 2: 准备数据导入..."

# 从原始 SQL 文件提取 COPY 命令
# 找到第一个 COPY 命令的位置
TEMP_DATA="/tmp/psytwin_data.sql"

echo "SET CONSTRAINTS ALL DEFERRED;" > $TEMP_DATA
echo "" >> $TEMP_DATA

# 提取所有 COPY 数据块
awk '/^COPY public\./{copy=1} copy{print} /^\\\.$/{copy=0}' "$SQL_FILE" >> $TEMP_DATA

echo "" >> $TEMP_DATA
echo "COMMIT;" >> $TEMP_DATA

echo "✅ 数据文件已准备"
echo ""

# 步骤 3: 导入数据
echo "📥 步骤 3: 导入数据..."

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --single-transaction \
  --set ON_ERROR_STOP=off \
  -f $TEMP_DATA 2>&1 | grep -E "(ERROR|错误|行|row)" | head -20

rm $TEMP_DATA

echo ""
echo "✅ 数据导入完成"
echo ""

# 步骤 4: 验证
echo "📊 步骤 4: 验证导入结果"
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
  'intervention_records with details' as check_item,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END as status
FROM intervention_records ir
JOIN intervention_details id ON ir.id = id.record_id
UNION ALL
SELECT 
  'students with profiles',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END
FROM students s
JOIN psych_profiles p ON s.id = p.student_id
UNION ALL
SELECT 
  'appointments valid',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END
FROM appointments a
JOIN students s ON a.student_id = s.id
JOIN teachers t ON a.teacher_id = t.id;
EOF

echo ""
echo "====================="
echo "✅ 导入流程完成"
