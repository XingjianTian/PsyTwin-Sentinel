#!/usr/bin/env node
/**
 * 数据库导入脚本（使用 Node.js + Prisma）
 * 
 * 执行 psytwin_backup.sql 文件导入到 PostgreSQL 数据库
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const SQL_FILE = path.join(__dirname, '..', 'psytwin_backup.sql');

console.log('🚀 PsyTwin 数据库导入工具\n');
console.log('='.repeat(60));

// 检查 SQL 文件
if (!fs.existsSync(SQL_FILE)) {
  console.error(`❌ 错误: 找不到 SQL 文件 ${SQL_FILE}`);
  process.exit(1);
}

console.log(`📄 SQL 文件: ${SQL_FILE}`);
console.log(`📊 文件大小: ${(fs.statSync(SQL_FILE).size / 1024).toFixed(2)} KB\n`);

// 检查是否安装了 psql
try {
  execSync('which psql', { stdio: 'ignore' });
  console.log('✅ 找到 psql 命令');
} catch {
  console.log('⚠️  未找到 psql 命令，尝试使用 npx prisma...\n');
}

// 读取 .env 文件
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ 错误: 找不到 .env 文件');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!dbUrlMatch) {
  console.error('❌ 错误: 找不到 DATABASE_URL');
  process.exit(1);
}

const databaseUrl = dbUrlMatch[1];
console.log(`🔗 数据库: ${databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}\n`);

// 解析连接信息
const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
  console.error('❌ 错误: 无法解析数据库连接 URL');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('📝 连接信息:');
console.log(`  主机: ${host}`);
console.log(`  端口: ${port}`);
console.log(`  用户: ${user}`);
console.log(`  数据库: ${database}\n`);

// 创建临时 SQL 文件（添加事务包装）
const tempSqlFile = path.join(__dirname, '..', 'psytwin_backup_import.sql');
const originalSql = fs.readFileSync(SQL_FILE, 'utf8');

// 包装在事务中，使用延迟约束
const wrappedSql = `-- 自动生成的导入脚本
-- 包装原始 SQL 在事务中，启用延迟约束检查

BEGIN;

SET CONSTRAINTS ALL DEFERRED;

-- 禁用触发器以避免外键约束检查
-- 注意: 这需要超级用户权限

${originalSql}

COMMIT;

-- 验证导入
SELECT '导入完成' as status;
SELECT 'students count: ' || COUNT(*) FROM students;
SELECT 'teachers count: ' || COUNT(*) FROM teachers;
SELECT 'intervention_records count: ' || COUNT(*) FROM intervention_records;
`;

fs.writeFileSync(tempSqlFile, wrappedSql);
console.log(`✅ 已创建临时导入文件: ${tempSqlFile}\n`);

// 尝试使用 psql 导入
try {
  console.log('📥 开始导入数据...\n');
  
  const env = {
    ...process.env,
    PGPASSWORD: password
  };
  
  const result = execSync(
    `psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${tempSqlFile} --set ON_ERROR_STOP=on`,
    { 
      env,
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe']
    }
  );
  
  console.log(result);
  console.log('\n✅ 数据导入成功！\n');
  
} catch (error) {
  console.error('❌ 导入失败:\n');
  console.error(error.stderr || error.message);
  
  console.log('\n💡 尝试备选方案: 使用 Prisma Migrate...\n');
  
  // 备选: 使用 prisma db push
  try {
    console.log('🔄 运行 prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ 数据库结构已同步\n');
    
    console.log('🔄 现在需要手动导入数据...');
    console.log('请使用以下命令:');
    console.log(`  psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${SQL_FILE}`);
    
  } catch (prismaError) {
    console.error('❌ Prisma 同步也失败了');
  }
} finally {
  // 清理临时文件
  if (fs.existsSync(tempSqlFile)) {
    fs.unlinkSync(tempSqlFile);
    console.log('🧹 已清理临时文件');
  }
}

console.log('\n' + '='.repeat(60));
console.log('导入流程结束');
