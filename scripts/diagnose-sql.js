#!/usr/bin/env node
/**
 * SQL 数据完整性诊断脚本
 * 
 * 分析 psytwin_backup.sql 文件中的数据完整性问题
 * 检查外键引用、空表、数据缺失等问题
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'psytwin_backup.sql');

if (!fs.existsSync(inputFile)) {
  console.error(`❌ 错误: 找不到文件 ${inputFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(inputFile, 'utf8');

console.log('🔍 PsyTwin SQL 数据完整性诊断\n');
console.log('=' .repeat(60));

// 提取所有表的数据块
function extractTableDataBlock(tableName) {
  const pattern = new RegExp(
    `COPY public\\.${tableName}[^;]+FROM stdin;\\n([\\s\\S]*?)(?=^\\\\.$)`,
    'm'
  );
  const match = sql.match(pattern);
  return match ? match[1].trim() : null;
}

function countDataRows(tableName) {
  const data = extractTableDataBlock(tableName);
  if (!data) return 0;
  // 统计非空行数
  return data.split('\n').filter(line => line.trim() && !line.startsWith('--')).length;
}

// 表依赖关系
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

// 所有表
const ALL_TABLES = [
  '_prisma_migrations', 'faculties', 'vr_scenes', 'devices', 'consultation_rooms',
  'data_sources', 'ai_documents', 'ai_prompt_presets', 'notification_templates',
  'notification_rules', 'notification_channels', 'silent_hours', 'ip_whitelist',
  'system_config', 'users', 'students', 'teachers', 'schedules', 'sync_tasks',
  'audit_logs', 'psych_profiles', 'timeline_events', 'alerts', 'intervention_records',
  'intervention_details', 'work_orders', 'warnings', 'appointments', 'chat_sessions',
  'student_notifications', 'posts', 'vital_signs', 'voice_analyses', 'expression_data',
  'vr_sessions', 'room_devices', 'document_chunks', 'post_likes', 'post_collections',
  'comments', 'sync_logs', 'chat_messages', 'notification_histories'
];

console.log('\n📊 数据表统计\n');

const stats = [];
for (const table of ALL_TABLES) {
  const count = countDataRows(table);
  const deps = TABLE_DEPENDENCIES[table] || [];
  stats.push({ table, count, deps });
}

// 按数据量排序
stats.sort((a, b) => b.count - a.count);

console.log('表名                          记录数    依赖表');
console.log('-'.repeat(60));

for (const { table, count, deps } of stats) {
  const tablePadded = table.padEnd(28);
  const countStr = count.toString().padStart(6);
  const depsStr = deps.length > 0 ? deps.join(', ') : '-';
  const status = count === 0 ? '⚠️ ' : '✅';
  console.log(`${status} ${tablePadded} ${countStr}    ${depsStr}`);
}

// 检查具体问题
console.log('\n\n🚨 发现的问题\n');
console.log('='.repeat(60));

const issues = [];

// 1. 检查空表
const emptyTables = stats.filter(s => s.count === 0).map(s => s.table);
if (emptyTables.length > 0) {
  issues.push({
    type: '空表',
    severity: '警告',
    tables: emptyTables,
    description: '以下表没有任何数据记录'
  });
}

// 2. 检查关键业务表
const criticalTables = ['students', 'teachers', 'intervention_records', 'posts', 'appointments'];
const missingCritical = criticalTables.filter(t => countDataRows(t) === 0);
if (missingCritical.length > 0) {
  issues.push({
    type: '关键表缺失',
    severity: '错误',
    tables: missingCritical,
    description: '关键业务表没有数据'
  });
}

// 3. 检查孤儿数据风险（子表有数据但父表可能缺失）
const orphanRisks = [];
for (const [childTable, parentTables] of Object.entries(TABLE_DEPENDENCIES)) {
  const childCount = countDataRows(childTable);
  if (childCount > 0) {
    for (const parentTable of parentTables) {
      const parentCount = countDataRows(parentTable);
      if (parentCount === 0) {
        orphanRisks.push(`${childTable} → ${parentTable}`);
      }
    }
  }
}
if (orphanRisks.length > 0) {
  issues.push({
    type: '孤儿数据风险',
    severity: '错误',
    details: orphanRisks,
    description: '子表有数据但父表为空，可能导致外键约束错误'
  });
}

// 4. 检查 intervention_details 和 intervention_records 的关系
const irCount = countDataRows('intervention_records');
const idCount = countDataRows('intervention_details');
if (irCount > 0 && idCount === 0) {
  issues.push({
    type: '数据缺失',
    severity: '警告',
    tables: ['intervention_details'],
    description: `intervention_records 有 ${irCount} 条记录，但 intervention_details 为空`
  });
}

// 输出问题
for (let i = 0; i < issues.length; i++) {
  const issue = issues[i];
  console.log(`\n${i + 1}. [${issue.severity}] ${issue.type}`);
  console.log(`   描述: ${issue.description}`);
  if (issue.tables) {
    console.log(`   涉及表: ${issue.tables.join(', ')}`);
  }
  if (issue.details) {
    console.log(`   详情:`);
    for (const detail of issue.details) {
      console.log(`     - ${detail}`);
    }
  }
}

// 5. 检查导入顺序问题
console.log('\n\n📝 导入顺序分析\n');
console.log('='.repeat(60));

// 提取 SQL 文件中实际的 COPY 顺序
const copyOrder = [...sql.matchAll(/^COPY public\.(\w+) /gm)].map(m => ({
  table: m[1],
  position: m.index
}));

copyOrder.sort((a, b) => a.position - b.position);

console.log('SQL 文件中的实际导入顺序（前20个）：\n');
for (let i = 0; i < Math.min(20, copyOrder.length); i++) {
  const { table } = copyOrder[i];
  const deps = TABLE_DEPENDENCIES[table] || [];
  const depsBefore = deps.filter(dep => {
    const depIndex = copyOrder.findIndex(c => c.table === dep);
    const tableIndex = copyOrder.findIndex(c => c.table === table);
    return depIndex > tableIndex; // 依赖在之后导入
  });
  
  const status = depsBefore.length > 0 ? '⚠️ ' : '✅';
  const depsStr = depsBefore.length > 0 ? ` (依赖 ${depsBefore.join(', ')} 在后)` : '';
  console.log(`  ${status} ${i + 1}. ${table}${depsStr}`);
}

// 生成修复建议
console.log('\n\n💡 修复建议\n');
console.log('='.repeat(60));

console.log(`
1. 空表处理
   以下表在 SQL 文件中没有任何数据，需要在导入后补充：
   ${emptyTables.join(', ')}

2. 导入顺序修复方案
   PostgreSQL 支持延迟约束检查，可以使用以下方法：
   
   方法 A - 使用延迟约束（推荐）：
   BEGIN;
   SET CONSTRAINTS ALL DEFERRED;
   \\i psytwin_backup.sql
   COMMIT;
   
   方法 B - 临时禁用触发器：
   ALTER TABLE alerts DISABLE TRIGGER ALL;
   -- 导入数据
   ALTER TABLE alerts ENABLE TRIGGER ALL;

3. 数据补充脚本
   对于 intervention_details 等缺失的数据表，建议运行 seed 脚本补充。
`);

// 生成验证查询
console.log('\n🔍 导入后验证查询\n');
console.log('='.repeat(60));
console.log(`
-- 检查各表记录数
SELECT 
  'students' as table_name, 
  COUNT(*) as count,
  COUNT(DISTINCT faculty_id) as faculties_used
FROM students
UNION ALL
SELECT 'teachers', COUNT(*), 0 FROM teachers
UNION ALL
SELECT 'intervention_records', COUNT(*), 0 FROM intervention_records
UNION ALL
SELECT 'intervention_details', COUNT(*), 0 FROM intervention_details
UNION ALL
SELECT 'appointments', COUNT(*), 0 FROM appointments
UNION ALL
SELECT 'posts', COUNT(*), 0 FROM posts
UNION ALL
SELECT 'warnings', COUNT(*), 0 FROM warnings
ORDER BY table_name;

-- 检查外键引用完整性
SELECT 'orphan alerts' as check_type, COUNT(*) as count
FROM alerts a
LEFT JOIN students s ON a.student_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 'orphan appointments', COUNT(*)
FROM appointments a
LEFT JOIN students s ON a.student_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 'orphan intervention_records', COUNT(*)
FROM intervention_records ir
LEFT JOIN students s ON ir.student_id = s.id
WHERE s.id IS NULL;
`);

// 保存诊断报告
const reportPath = path.join(__dirname, '..', 'sql-diagnosis-report.md');
const report = `# SQL 数据完整性诊断报告

生成时间: ${new Date().toLocaleString()}

## 数据表统计

| 表名 | 记录数 | 依赖表 |
|------|--------|--------|
${stats.map(s => `| ${s.table} | ${s.count} | ${s.deps.join(', ') || '-'} |`).join('\n')}

## 发现的问题

${issues.map((issue, i) => `
### ${i + 1}. [${issue.severity}] ${issue.type}

- **描述**: ${issue.description}
${issue.tables ? `- **涉及表**: ${issue.tables.join(', ')}` : ''}
${issue.details ? `- **详情**:\n${issue.details.map(d => `  - ${d}`).join('\n')}` : ''}
`).join('\n')}

## 修复建议

1. 使用延迟约束导入：
   \`\`\`sql
   BEGIN;
   SET CONSTRAINTS ALL DEFERRED;
   \\i psytwin_backup.sql
   COMMIT;
   \`\`\`

2. 补充缺失的数据表运行 seed 脚本

3. 验证外键引用完整性
`;

fs.writeFileSync(reportPath, report);
console.log(`\n📄 诊断报告已保存: ${reportPath}`);
