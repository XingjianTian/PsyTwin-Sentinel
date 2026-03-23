-- 同步数据库结构迁移
-- 添加 schema.prisma 中有但数据库中缺失的字段和表
-- 执行时间: 2026-03-23

-- ============================================
-- 1. 为 students 表添加缺失字段
-- ============================================

-- 添加 introduction 字段（个人简介）
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "introduction" TEXT;

-- 添加 photos 字段（照片墙，字符串数组）
-- PostgreSQL 中数组类型为 text[]
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "photos" TEXT[] DEFAULT '{}';

-- ============================================
-- 2. 创建 voice_transcriptions 表
-- ============================================

CREATE TABLE IF NOT EXISTS "voice_transcriptions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_transcriptions_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "voice_transcriptions_student_id_idx" ON "voice_transcriptions"("student_id");
CREATE INDEX IF NOT EXISTS "voice_transcriptions_timestamp_idx" ON "voice_transcriptions"("timestamp");

-- 添加外键约束
ALTER TABLE "voice_transcriptions" 
ADD CONSTRAINT "voice_transcriptions_student_id_fkey" 
FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 3. 验证
-- ============================================

-- 验证字段添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('introduction', 'photos');

-- 验证表创建成功
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'voice_transcriptions';
