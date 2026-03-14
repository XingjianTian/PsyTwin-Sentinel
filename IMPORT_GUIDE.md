# PsyTwin 数据库导入指南

## 修复内容

修复了 SQL 文件中的表导入顺序问题，确保外键约束的父表先于子表导入。

## 正确的导入顺序

### Level 0 - 基础表（无依赖）
- faculties, vr_scenes, devices, consultation_rooms
- data_sources, ai_documents, ai_prompt_presets
- notification_templates, notification_rules, notification_channels
- silent_hours, ip_whitelist, system_config, users

### Level 1 - 依赖基础表
- students (→ faculties)
- teachers
- schedules (→ teachers)
- sync_tasks (→ data_sources)
- audit_logs (→ users)

### Level 2 - 依赖 students/teachers
- psych_profiles, timeline_events, alerts, intervention_records
- work_orders, warnings, appointments
- chat_sessions, student_notifications, posts
- vital_signs, voice_analyses, expression_data
- vr_sessions (→ vr_scenes), room_devices (→ consultation_rooms, devices)
- document_chunks (→ ai_documents)

### Level 3 - 依赖 Level 2
- intervention_details (→ intervention_records)
- post_likes, post_collections, comments (→ posts)
- sync_logs (→ sync_tasks)

### Level 4 - 依赖 Level 3
- chat_messages (→ chat_sessions)
- notification_histories (→ notification_rules)

## 导入命令

### 方法 1: 使用修复后的 SQL 文件
```bash
# 清空现有数据库
psql -U psytwin -d psytwin -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 导入修复后的 SQL
psql -U psytwin -d psytwin -f psytwin_backup_fixed.sql
```

### 方法 2: 手动按顺序导入（推荐用于部分更新）
```bash
# 1. 先导入基础表
psql -U psytwin -d psytwin -c "\copy faculties FROM 'faculties.csv'"
psql -U psytwin -d psytwin -c "\copy students FROM 'students.csv'"
# ... 依此类推
```

### 方法 3: 使用事务（最安全）
```bash
psql -U psytwin -d psytwin << EOF
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
\i psytwin_backup_fixed.sql
COMMIT;
EOF
```

## 验证导入

```sql
-- 检查各表记录数
SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'intervention_records', COUNT(*) FROM intervention_records
UNION ALL SELECT 'intervention_details', COUNT(*) FROM intervention_details
ORDER BY table_name;
```

## 常见问题

### 问题 1: 外键约束错误
```
ERROR: insert or update on table "alerts" violates foreign key constraint "alerts_student_id_fkey"
```
**解决**: 确保 students 表先于 alerts 表导入。

### 问题 2: 数据不完整
```
ERROR: null value in column "student_id" violates not-null constraint
```
**解决**: 检查源数据的完整性，确保外键引用的记录存在。

### 问题 3: 权限错误
```
ERROR: permission denied for schema public
```
**解决**: 确保执行导入的用户有足够的权限。
```bash
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO psytwin;
```
