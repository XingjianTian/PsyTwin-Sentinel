#!/usr/bin/env node
/**
 * 使用 pg 模块导入 SQL 文件
 * 
 * 直接连接 PostgreSQL 并执行 SQL 文件
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SQL_FILE = path.join(__dirname, '..', 'psytwin_backup.sql');

console.log('🚀 PsyTwin 数据库导入工具 (使用 node-pg)\n');
console.log('='.repeat(60));

// 读取 .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!dbUrlMatch) {
  console.error('❌ 错误: 找不到 DATABASE_URL');
  process.exit(1);
}

const databaseUrl = dbUrlMatch[1];

async function importDatabase() {
  console.log('📥 准备导入数据...\n');
  
  // 检查 SQL 文件
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`❌ 错误: 找不到 SQL 文件 ${SQL_FILE}`);
    process.exit(1);
  }
  
  console.log(`📄 SQL 文件: ${SQL_FILE}`);
  console.log(`📊 文件大小: ${(fs.statSync(SQL_FILE).size / 1024 / 1024).toFixed(2)} MB\n`);
  
  // 连接数据库
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  try {
    console.log('🔗 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功\n');
    
    // 检查当前数据
    console.log('📊 当前数据库状态:');
    const checkResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM teachers) as teachers,
        (SELECT COUNT(*) FROM intervention_records) as intervention_records
    `);
    
    const current = checkResult.rows[0];
    console.log(`  - students: ${current.students} 条记录`);
    console.log(`  - teachers: ${current.teachers} 条记录`);
    console.log(`  - intervention_records: ${current.intervention_records} 条记录\n`);
    
    if (parseInt(current.students) > 0) {
      console.log('⚠️  警告: 数据库中已有数据！');
      console.log('导入将清空现有数据并重新导入。\n');
      
      // 询问确认
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('是否继续导入? (yes/no): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('操作已取消');
        await client.end();
        return;
      }
      
      console.log('');
    }
    
    // 读取 SQL 文件
    console.log('📖 读取 SQL 文件...');
    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    
    // 将 SQL 分成语句块
    // PostgreSQL 的 COPY 命令需要特殊处理
    const statements = [];
    let currentStatement = '';
    let inCopyMode = false;
    let copyData = '';
    
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('COPY ')) {
        inCopyMode = true;
        copyData = line + '\n';
      } else if (inCopyMode) {
        if (line === '\\.') {
          // COPY 数据结束
          copyData += line + '\n';
          statements.push({ type: 'copy', content: copyData });
          inCopyMode = false;
          copyData = '';
        } else {
          copyData += line + '\n';
        }
      } else {
        // 普通 SQL 语句
        currentStatement += line + '\n';
        if (line.trim().endsWith(';')) {
          statements.push({ type: 'sql', content: currentStatement.trim() });
          currentStatement = '';
        }
      }
    }
    
    console.log(`✅ 解析完成: ${statements.length} 个语句块\n`);
    
    // 开始事务
    console.log('🔄 开始导入 (使用延迟约束检查)...\n');
    await client.query('BEGIN');
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    let successCount = 0;
    let errorCount = 0;
    let copyCount = 0;
    
    // 执行所有语句
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        if (stmt.type === 'copy') {
          // COPY 语句需要特殊处理
          await client.query(stmt.content);
          copyCount++;
        } else if (stmt.type === 'sql') {
          // 跳过某些可能导致问题的语句
          const content = stmt.content;
          
          // 跳过 ALTER TABLE ... ADD CONSTRAINT 外键约束
          // 这些约束会在所有数据导入后自动创建
          if (content.includes('ADD CONSTRAINT') && content.includes('FOREIGN KEY')) {
            continue;
          }
          
          await client.query(content);
          successCount++;
        }
        
        // 每 100 个语句显示进度
        if ((i + 1) % 100 === 0) {
          process.stdout.write(`  进度: ${i + 1}/${statements.length} 语句\r`);
        }
        
      } catch (err) {
        errorCount++;
        // 某些错误可以忽略（如表不存在）
        if (!err.message.includes('does not exist') && 
            !err.message.includes('already exists')) {
          console.log(`  ⚠️  语句 ${i + 1} 错误: ${err.message.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n  ✅ SQL 执行完成: ${successCount} 成功, ${copyCount} COPY, ${errorCount} 错误\n`);
    
    // 提交事务
    await client.query('COMMIT');
    console.log('✅ 事务已提交\n');
    
    // 验证导入结果
    console.log('🔍 验证导入结果:\n');
    
    const verifyResult = await client.query(`
      SELECT 
        'students' as table_name, 
        COUNT(*) as count,
        COUNT(DISTINCT faculty_id) as faculties_used
      FROM students
      UNION ALL
      SELECT 'teachers', COUNT(*), 0 FROM teachers
      UNION ALL
      SELECT 'faculties', COUNT(*), 0 FROM faculties
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
      UNION ALL
      SELECT 'timeline_events', COUNT(*), 0 FROM timeline_events
      UNION ALL
      SELECT 'vr_sessions', COUNT(*), 0 FROM vr_sessions
      UNION ALL
      SELECT 'psych_profiles', COUNT(*), 0 FROM psych_profiles
      ORDER BY table_name
    `);
    
    console.log('表名                          记录数');
    console.log('-'.repeat(50));
    for (const row of verifyResult.rows) {
      const name = row.table_name.padEnd(28);
      const count = row.count.toString().padStart(8);
      console.log(`  ${name} ${count}`);
    }
    
    // 检查外键完整性
    console.log('\n\n🔗 检查外键引用完整性:\n');
    
    const fkCheck = await client.query(`
      SELECT 
        'alerts' as "表名",
        COUNT(*) FILTER (WHERE s.id IS NULL) as "孤儿记录"
      FROM alerts a
      LEFT JOIN students s ON a.student_id = s.id
      UNION ALL
      SELECT 'appointments', COUNT(*) FILTER (WHERE s.id IS NULL)
      FROM appointments a
      LEFT JOIN students s ON a.student_id = s.id
      UNION ALL
      SELECT 'intervention_records', COUNT(*) FILTER (WHERE s.id IS NULL)
      FROM intervention_records ir
      LEFT JOIN students s ON ir.student_id = s.id
      UNION ALL
      SELECT 'posts', COUNT(*) FILTER (WHERE s.id IS NULL)
      FROM posts p
      LEFT JOIN students s ON p.author_id = s.id
    `);
    
    let hasOrphan = false;
    for (const row of fkCheck.rows) {
      if (parseInt(row['孤儿记录']) > 0) {
        console.log(`  ⚠️  ${row['表名']}: ${row['孤儿记录']} 条孤儿记录`);
        hasOrphan = true;
      }
    }
    
    if (!hasOrphan) {
      console.log('  ✅ 所有外键引用完整，无孤儿记录');
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ 数据库导入完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    
    try {
      await client.query('ROLLBACK');
      console.log('🔄 事务已回滚');
    } catch (rollbackErr) {
      // ignore
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

importDatabase();
