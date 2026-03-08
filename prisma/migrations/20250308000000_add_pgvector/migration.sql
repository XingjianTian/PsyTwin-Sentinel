-- 启用 pgvector 扩展（用于向量存储）
CREATE EXTENSION IF NOT EXISTS vector;

-- 添加注释
COMMENT ON EXTENSION vector IS 'pgvector extension for vector similarity search';
