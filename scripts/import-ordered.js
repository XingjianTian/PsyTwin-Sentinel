#!/usr/bin/env node
/**
 * 正确的数据导入顺序
 * 
 * 按照外键依赖关系，从父表到子表依次导入
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '..', 'psytwin_backup.sql');

// 正确的导入顺序（父表在前，子表在后）
const IMPORT_ORDER = [
  // Level 0: 无依赖
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
  
  // Level 1: 依赖 Level 0
  'students',
  'teachers',
  'schedules',
  'sync_tasks',
  
  // Level 2: 依赖 Level 1
  'psych_profiles',
  'timeline_events',
  'alerts',
  'intervention_records',
  'work_orders',
  'warnings',
  'appointments',
  'chat_sessions',
  'student_notifications',
  'posts',
  'vital_signs',
  'voice_analyses',
  'expression_data',
  'vr_sessions',
  'room_devices',
  'document_chunks',
  'audit_logs',
  
  // Level 3: 依赖 Level 2
  'intervention_details',
  'post_likes',
  'post_collections',
  'comments',
  'sync_logs',
  
  // Level 4: 依赖 Level 3
  'chat_messages',
  'notification_histories',
];

console.log('🚀 PsyTwin 数据导入（按正确顺序）');
console.log('='.repeat(60));
console.log('');

// 读取 SQL 文件内容
const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');

// 提取单个表的 COPY 数据
function extractCopyData(tableName) {
  const pattern = new RegExp(
    `(COPY public\\.${tableName}[^;]+?FROM stdin;\\n)([\\s\\S]*?)(\\n\\\\\\.\\n)`,
    's'
  );
  const match = sqlContent.match(pattern);
  
  if (match) {
    return {
      header: match[1],
      data: match[2],
      footer: match[3]
    };
  }
  return null;
}

async function importData() {
  // 连接数据库
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 
      'postgresql://psytwin:Pt5xK9mR2wQ7vN3j@localhost:5432/psytwin_sentinel?schema=public'
  });
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功\n');
    
    // 禁用所有外键约束
    console.log('🔓 禁用外键约束...');
    await client.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
              EXCEPTION WHEN OTHERS THEN
                  NULL;
              END;
          END LOOP;
      END $$;
    `);
    console.log('✅ 外键约束已禁用\n');
    
    // 清空所有表
    console.log('🗑️  清空所有表...');
    for (const table of IMPORT_ORDER) {
      try {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      } catch (err) {
        // 忽略错误
      }
    }
    console.log('✅ 表已清空\n');
    
    // 按顺序导入每个表
    console.log('📥 开始导入数据...\n');
    
    let totalImported = 0;
    
    for (const tableName of IMPORT_ORDER) {
      const copyData = extractCopyData(tableName);
      
      if (copyData && copyData.data.trim()) {
        try {
          // 构建完整的 COPY 命令
          const fullCopy = copyData.header + copyData.data + '\n\\.';
          
          // 执行 COPY
          await client.query(fullCopy);
          
          // 统计行数
          const lineCount = copyData.data.trim().split('\n').length;
          totalImported += lineCount;
          
          console.log(`  ✅ ${tableName.padEnd(28)} ${lineCount.toString().padStart(4)} 行`);
        } catch (err) {
          console.log(`  ❌ ${tableName.padEnd(28)} 错误: ${err.message.substring(0, 50)}`);
        }
      } else {
        console.log(`  ⚠️  ${tableName.padEnd(28)} 无数据`);
      }
    }
    
    console.log(`\n✅ 导入完成，共 ${totalImported} 行\n`);
    
    // 重新启用外键约束
    console.log('🔒 重新启用外键约束...');
    await client.query(`
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
    `);
    console.log('✅ 外键约束已启用\n');
    
    // 验证导入结果
    console.log('📊 验证导入结果:\n');
    
    const verifyResult = await client.query(`
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
      ORDER BY table_name
    `);
    
    console.log('表名                          记录数');
    console.log('-'.repeat(50));
    for (const row of verifyResult.rows) {
      const name = row.table_name.padEnd(28);
      const count = row.count.toString().padStart(8);
      const status = parseInt(row.count) > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${name} ${count}`);
    }
    
    // 关键关联检查
    console.log('\n关键关联检查:');
    console.log('-'.repeat(50));
    
    const checks = [
      {
        name: 'intervention_records ↔ details',
        query: `SELECT COUNT(*) FROM intervention_records ir JOIN intervention_details id ON ir.id = id.record_id`
      },
      {
        name: 'students ↔ psych_profiles',
        query: `SELECT COUNT(*) FROM students s JOIN psych_profiles p ON s.id = p.student_id`
      },
      {
        name: 'appointments ↔ students+teachers',
        query: `SELECT COUNT(*) FROM appointments a JOIN students s ON a.student_id = s.id JOIN teachers t ON a.teacher_id = t.id`
      },
      {
        name: 'posts ↔ students',
        query: `SELECT COUNT(*) FROM posts p JOIN students s ON p.author_id = s.id`
      },
      {
        name: 'warnings ↔ students',
        query: `SELECT COUNT(*) FROM warnings w JOIN students s ON w.student_id = s.id`
      }
    ];
    
    for (const check of checks) {
      const result = await client.query(check.query);
      const count = result.rows[0].count;
      const status = parseInt(count) > 0 ? '✅' : '❌';
      console.log(`  ${status} ${check.name.padEnd(35)} ${count}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 数据导入完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

importData();
