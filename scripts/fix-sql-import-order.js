#!/usr/bin/env node
/**
 * SQL 导入顺序修复脚本
 * 
 * 本脚本修复 psytwin_backup.sql 的数据导入顺序问题，
 * 确保外键约束的父表先于子表导入。
 */

const fs = require('fs');
const path = require('path');

// 定义正确的表导入顺序（基于外键依赖关系）
const TABLE_ORDER = [
  // Level 0: 无依赖的基础表
  '_prisma_migrations',
  'faculties',
  'vr_scenes',
  'devices',
  'consultation_rooms',
  'data_sources',
  'ai_documents',
  'ai_prompt_presets',
  'notification_templates',
  'notification_rules',
  'notification_channels',
  'silent_hours',
  'ip_whitelist',
  'system_config',
  'users',
  
  // Level 1: 依赖基础表
  'students',           // 依赖 faculties
  'teachers',
  'schedules',          // 依赖 teachers
  'sync_tasks',         // 依赖 data_sources
  'audit_logs',         // 依赖 users
  
  // Level 2: 依赖 students/teachers
  'psych_profiles',     // 依赖 students
  'timeline_events',    // 依赖 students
  'alerts',             // 依赖 students
  'intervention_records', // 依赖 students
  'work_orders',        // 依赖 students
  'warnings',           // 依赖 students, teachers
  'appointments',       // 依赖 students, teachers
  'chat_sessions',      // 依赖 students
  'student_notifications', // 依赖 students
  'posts',              // 依赖 students
  'vital_signs',        // 依赖 students
  'voice_analyses',     // 依赖 students
  'expression_data',    // 依赖 students
  'vr_sessions',        // 依赖 students, vr_scenes
  'room_devices',       // 依赖 consultation_rooms, devices
  'document_chunks',    // 依赖 ai_documents
  
  // Level 3: 依赖 Level 2 的表
  'intervention_details', // 依赖 intervention_records
  'post_likes',         // 依赖 posts, students
  'post_collections',   // 依赖 posts, students
  'comments',           // 依赖 posts, students
  'sync_logs',          // 依赖 sync_tasks
  
  // Level 4: 依赖 Level 3 的表
  'chat_messages',      // 依赖 chat_sessions
  'notification_histories', // 依赖 notification_rules
];

// 表依赖关系映射（用于错误检查）
const TABLE_DEPENDENCIES = {
  'students': ['faculties'],
  'schedules': ['teachers'],
  'sync_tasks': ['data_sources'],
  'audit_logs': ['users'],
  'psych_profiles': ['students'],
  'timeline_events': ['students'],
  'alerts': ['students'],
  'intervention_records': ['students'],
  'intervention_details': ['intervention_records'],
  'work_orders': ['students'],
  'warnings': ['students', 'teachers'],
  'appointments': ['students', 'teachers'],
  'chat_sessions': ['students'],
  'student_notifications': ['students'],
  'posts': ['students'],
  'post_likes': ['posts', 'students'],
  'post_collections': ['posts', 'students'],
  'comments': ['posts', 'students'],
  'vital_signs': ['students'],
  'voice_analyses': ['students'],
  'expression_data': ['students'],
  'vr_sessions': ['students', 'vr_scenes'],
  'room_devices': ['consultation_rooms', 'devices'],
  'document_chunks': ['ai_documents'],
  'sync_logs': ['sync_tasks'],
  'chat_messages': ['chat_sessions'],
  'notification_histories': ['notification_rules'],
};

function extractTableData(sql, tableName) {
  const patterns = [
    // COPY ... FROM stdin; 数据块
    new RegExp(`(COPY public\\.${tableName}[^;]+FROM stdin;\\n(?:[^\\n]*\\n)*\\\\.)`, 's'),
    // 表的其他引用（如 COMMENT ON）
    new RegExp(`(--[^\\n]*\\n)*(?:ALTER TABLE|COMMENT ON)[^;]+public\\.${tableName}[^;]+;`, 'gs'),
  ];
  
  const results = [];
  
  for (const pattern of patterns) {
    const matches = sql.match(pattern);
    if (matches) {
      results.push(...matches);
    }
  }
  
  return results.join('\n\n');
}

function generateOrderedSQL() {
  console.log('🔄 正在读取原始 SQL 文件...');
  const inputFile = path.join(__dirname, '..', 'psytwin_backup.sql');
  const outputFile = path.join(__dirname, '..', 'psytwin_backup_fixed.sql');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 错误: 找不到文件 ${inputFile}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(inputFile, 'utf8');
  console.log(`📄 原始文件大小: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
  
  // 提取文件的主要部分
  const headerMatch = sql.match(/^[\s\S]*?(?=CREATE TABLE public\._prisma_migrations)/);
  const header = headerMatch ? headerMatch[0] : '';
  
  const footerMatch = sql.match(/(?:REVOKE USAGE ON SCHEMA public[\s\S]*)$/);
  const footer = footerMatch ? footerMatch[0] : '';
  
  // 构建新的 SQL 文件
  let orderedSQL = header;
  
  console.log('\n📋 按正确顺序提取表数据...');
  
  const extractedTables = new Set();
  
  for (const tableName of TABLE_ORDER) {
    const tableData = extractTableData(sql, tableName);
    if (tableData) {
      orderedSQL += `\n--\n-- Data for Name: ${tableName}; Type: TABLE DATA; Schema: public; Owner: psytwin\n--\n\n`;
      orderedSQL += tableData + '\n';
      extractedTables.add(tableName);
      console.log(`  ✅ ${tableName}`);
    } else {
      console.log(`  ⚠️  ${tableName} (无数据)`);
    }
  }
  
  // 检查是否有遗漏的表
  const allTables = [...sql.matchAll(/COPY public\.(\w+) /g)].map(m => m[1]);
  const uniqueTables = [...new Set(allTables)];
  const missedTables = uniqueTables.filter(t => !extractedTables.has(t));
  
  if (missedTables.length > 0) {
    console.log('\n⚠️  发现未处理的表:');
    for (const table of missedTables) {
      console.log(`  - ${table}`);
    }
  }
  
  // 添加约束和索引（保持原有顺序）
  console.log('\n🔗 提取约束和索引...');
  const constraintsMatch = sql.match(/(-- Name: \w+ \w+_pkey[\s\S]*?)(?=-- Name: SCHEMA public; Type: ACL)/);
  if (constraintsMatch) {
    orderedSQL += '\n\n' + constraintsMatch[1];
  }
  
  // 添加文件尾部
  orderedSQL += '\n' + footer;
  
  // 保存修复后的文件
  fs.writeFileSync(outputFile, orderedSQL);
  console.log(`\n✅ 修复完成!`);
  console.log(`📁 输出文件: ${outputFile}`);
  console.log(`📊 新文件大小: ${(orderedSQL.length / 1024 / 1024).toFixed(2)} MB`);
  
  // 生成导入说明
  generateImportInstructions();
}

function generateImportInstructions() {
  const instructions = `# PsyTwin 数据库导入指南

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
\`\`\`bash
# 清空现有数据库
psql -U psytwin -d psytwin -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 导入修复后的 SQL
psql -U psytwin -d psytwin -f psytwin_backup_fixed.sql
\`\`\`

### 方法 2: 手动按顺序导入（推荐用于部分更新）
\`\`\`bash
# 1. 先导入基础表
psql -U psytwin -d psytwin -c "\\copy faculties FROM 'faculties.csv'"
psql -U psytwin -d psytwin -c "\\copy students FROM 'students.csv'"
# ... 依此类推
\`\`\`

### 方法 3: 使用事务（最安全）
\`\`\`bash
psql -U psytwin -d psytwin << EOF
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
\\i psytwin_backup_fixed.sql
COMMIT;
EOF
\`\`\`

## 验证导入

\`\`\`sql
-- 检查各表记录数
SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'intervention_records', COUNT(*) FROM intervention_records
UNION ALL SELECT 'intervention_details', COUNT(*) FROM intervention_details
ORDER BY table_name;
\`\`\`

## 常见问题

### 问题 1: 外键约束错误
\`\`\`
ERROR: insert or update on table "alerts" violates foreign key constraint "alerts_student_id_fkey"
\`\`\`
**解决**: 确保 students 表先于 alerts 表导入。

### 问题 2: 数据不完整
\`\`\`
ERROR: null value in column "student_id" violates not-null constraint
\`\`\`
**解决**: 检查源数据的完整性，确保外键引用的记录存在。

### 问题 3: 权限错误
\`\`\`
ERROR: permission denied for schema public
\`\`\`
**解决**: 确保执行导入的用户有足够的权限。
\`\`\`bash
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO psytwin;
\`\`\`
`;

  const readmePath = path.join(__dirname, '..', 'IMPORT_GUIDE.md');
  fs.writeFileSync(readmePath, instructions);
  console.log(`📝 导入指南已生成: ${readmePath}`);
}

// 主函数
console.log('🚀 PsyTwin SQL 导入顺序修复工具\n');
generateOrderedSQL();
