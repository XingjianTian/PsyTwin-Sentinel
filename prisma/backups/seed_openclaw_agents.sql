-- OpenClaw Agents Initialization
-- Run this SQL to initialize the 6 core OpenClaw agents

-- Delete any existing lowercase agents (cleanup)
DELETE FROM "openclaw_agents" WHERE id IN ('therapist', 'relayer');

-- Upsert all 6 agents with correct configuration
INSERT INTO "openclaw_agents" (id, name, role, emoji, color, "is_online", "created_at", "updated_at")
VALUES 
  ('main', '首席数据官', '总览全局', '🎯', '#ff006e', false, NOW(), NOW()),
  ('Collector', '采集员', '数据采集', '📡', '#374151', false, NOW(), NOW()),
  ('Therapist', '咨询师', '干预策略', '🧠', '#9d4edd', false, NOW(), NOW()),
  ('Relayer', '中继工程师', '边缘处理', '🔌', '#ffbe0b', false, NOW(), NOW()),
  ('DBA', '数据哨兵', '数据管理', '🛡️', '#1e40af', false, NOW(), NOW()),
  ('Analyst', '分析师', '特征提取', '📊', '#15803d', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  "updated_at" = NOW();
