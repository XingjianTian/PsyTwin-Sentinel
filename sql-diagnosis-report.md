# SQL 数据完整性诊断报告

生成时间: 3/12/2026, 4:44:49 AM

## 数据表统计

| 表名 | 记录数 | 依赖表 |
|------|--------|--------|
| timeline_events | 135 | students |
| vital_signs | 60 | students |
| voice_analyses | 60 | students |
| expression_data | 60 | students |
| schedules | 33 | teachers |
| student_notifications | 32 | students |
| students | 27 | faculties |
| psych_profiles | 27 | students |
| devices | 26 | - |
| room_devices | 26 | consultation_rooms, devices |
| intervention_records | 20 | students |
| intervention_details | 20 | intervention_records |
| document_chunks | 19 | ai_documents |
| work_orders | 14 | students |
| appointments | 11 | students, teachers |
| post_likes | 11 | posts, students |
| consultation_rooms | 10 | - |
| alerts | 10 | students |
| vr_sessions | 10 | students, vr_scenes |
| posts | 8 | students |
| faculties | 6 | - |
| ai_documents | 6 | - |
| warnings | 6 | students, teachers |
| post_collections | 5 | posts, students |
| vr_scenes | 4 | - |
| ai_prompt_presets | 4 | - |
| comments | 4 | posts, students |
| teachers | 3 | - |
| chat_messages | 3 | chat_sessions |
| _prisma_migrations | 2 | - |
| chat_sessions | 2 | students |
| users | 1 | - |
| data_sources | 0 | - |
| notification_templates | 0 | - |
| notification_rules | 0 | - |
| notification_channels | 0 | - |
| silent_hours | 0 | - |
| ip_whitelist | 0 | - |
| system_config | 0 | - |
| sync_tasks | 0 | data_sources |
| audit_logs | 0 | users |
| sync_logs | 0 | sync_tasks |
| notification_histories | 0 | notification_rules |

## 发现的问题


### 1. [警告] 空表

- **描述**: 以下表没有任何数据记录
- **涉及表**: data_sources, notification_templates, notification_rules, notification_channels, silent_hours, ip_whitelist, system_config, sync_tasks, audit_logs, sync_logs, notification_histories



## 修复建议

1. 使用延迟约束导入：
   ```sql
   BEGIN;
   SET CONSTRAINTS ALL DEFERRED;
   \i psytwin_backup.sql
   COMMIT;
   ```

2. 补充缺失的数据表运行 seed 脚本

3. 验证外键引用完整性
