DO $$
BEGIN
  CREATE TYPE "PetSpecies" AS ENUM ('CAT', 'DOG', 'RABBIT', 'HAMSTER', 'BIRD', 'FISH', 'TURTLE', 'FOX', 'WOLF', 'DRAGON');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "Direction" AS ENUM ('UP', 'DOWN', 'LEFT', 'RIGHT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ActivityType" AS ENUM ('IDLE', 'WALKING', 'RUNNING', 'EATING', 'SLEEPING', 'PLAYING', 'BATHING', 'GROOMING', 'SOCIALIZING', 'EXPLORING', 'RESTING', 'WORKING', 'STUDYING', 'EXERCISING');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ControlState" AS ENUM ('FREE', 'AI_CONTROLLED', 'USER_CONTROLLED', 'HYBRID');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "EventType" AS ENUM ('INTERACTION', 'MOOD_CHANGE', 'ENVIRONMENT_CHANGE', 'MILESTONE', 'HEALTH_ALERT', 'SOCIAL', 'ACTIVITY', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "EventCategory" AS ENUM ('BEHAVIOR', 'SOCIAL', 'HEALTH', 'ENVIRONMENTAL', 'ACHIEVEMENT', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ItemType" AS ENUM ('FOOD', 'TOY', 'FURNITURE', 'CLOTHING', 'ACCESSORY', 'DECORATION', 'TOOL', 'MEDICINE', 'GIFT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "DiaryEntryType" AS ENUM ('MOOD', 'HEALTH', 'MILESTONE', 'BEHAVIOR', 'SOCIAL', 'TRAINING', 'DAILY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "PetAlertType" AS ENUM ('HEALTH_WARNING', 'MOOD_ANOMALY', 'SOCIAL_ISOLATION', 'NEGLECT_ALERT', 'EMERGENCY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "pets" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "species" "PetSpecies" NOT NULL,
  "color" TEXT,
  "accessories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "expression" TEXT,
  "openness" INTEGER NOT NULL DEFAULT 50,
  "conscientiousness" INTEGER NOT NULL DEFAULT 50,
  "extraversion" INTEGER NOT NULL DEFAULT 50,
  "agreeableness" INTEGER NOT NULL DEFAULT 50,
  "neuroticism" INTEGER NOT NULL DEFAULT 50,
  "mood" INTEGER NOT NULL DEFAULT 60,
  "energy" INTEGER NOT NULL DEFAULT 75,
  "sociability" INTEGER NOT NULL DEFAULT 20,
  "current_scene" TEXT,
  "position_x" DOUBLE PRECISION,
  "position_y" DOUBLE PRECISION,
  "direction" "Direction",
  "current_activity_type" "ActivityType" NOT NULL DEFAULT 'IDLE',
  "current_activity_name" TEXT,
  "activity_start_time" TIMESTAMP(3),
  "activity_duration" INTEGER,
  "activity_progress" INTEGER,
  "is_online" BOOLEAN NOT NULL DEFAULT false,
  "is_sleeping" BOOLEAN NOT NULL DEFAULT false,
  "is_interacting" BOOLEAN NOT NULL DEFAULT false,
  "interacting_with_id" TEXT,
  "control_state" "ControlState" NOT NULL DEFAULT 'FREE',
  "controlled_by" TEXT,
  "controlled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "last_action_at" TIMESTAMP(3),

  CONSTRAINT "pets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pet_events" (
  "id" TEXT NOT NULL,
  "pet_id" TEXT NOT NULL,
  "type" "EventType" NOT NULL,
  "category" "EventCategory" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMP(3),
  "duration" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pet_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pet_events_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pet_items" (
  "id" TEXT NOT NULL,
  "pet_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ItemType" NOT NULL,
  "description" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "equipped" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pet_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pet_items_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pet_diary_entries" (
  "id" TEXT NOT NULL,
  "pet_id" TEXT NOT NULL,
  "type" "DiaryEntryType" NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "mood" INTEGER,
  "energy" INTEGER,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pet_diary_entries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pet_diary_entries_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pet_alerts" (
  "id" TEXT NOT NULL,
  "pet_id" TEXT NOT NULL,
  "type" "PetAlertType" NOT NULL,
  "severity" "AlertSeverity" NOT NULL,
  "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "message" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "resolved_at" TIMESTAMP(3),

  CONSTRAINT "pet_alerts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pet_alerts_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "scene_items" (
  "id" TEXT NOT NULL,
  "scene_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "position_x" DOUBLE PRECISION NOT NULL,
  "position_y" DOUBLE PRECISION NOT NULL,
  "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "properties" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "scene_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "pets_owner_id_idx" ON "pets"("owner_id");
CREATE INDEX IF NOT EXISTS "pets_species_idx" ON "pets"("species");
CREATE INDEX IF NOT EXISTS "pets_is_online_idx" ON "pets"("is_online");

CREATE INDEX IF NOT EXISTS "pet_events_pet_id_idx" ON "pet_events"("pet_id");
CREATE INDEX IF NOT EXISTS "pet_events_type_idx" ON "pet_events"("type");
CREATE INDEX IF NOT EXISTS "pet_events_category_idx" ON "pet_events"("category");
CREATE INDEX IF NOT EXISTS "pet_events_status_idx" ON "pet_events"("status");
CREATE INDEX IF NOT EXISTS "pet_events_started_at_idx" ON "pet_events"("started_at");

CREATE INDEX IF NOT EXISTS "pet_items_pet_id_idx" ON "pet_items"("pet_id");
CREATE INDEX IF NOT EXISTS "pet_items_type_idx" ON "pet_items"("type");
CREATE INDEX IF NOT EXISTS "pet_items_equipped_idx" ON "pet_items"("equipped");

CREATE INDEX IF NOT EXISTS "pet_diary_entries_pet_id_idx" ON "pet_diary_entries"("pet_id");
CREATE INDEX IF NOT EXISTS "pet_diary_entries_type_idx" ON "pet_diary_entries"("type");
CREATE INDEX IF NOT EXISTS "pet_diary_entries_created_at_idx" ON "pet_diary_entries"("created_at");

CREATE INDEX IF NOT EXISTS "pet_alerts_pet_id_idx" ON "pet_alerts"("pet_id");
CREATE INDEX IF NOT EXISTS "pet_alerts_type_idx" ON "pet_alerts"("type");
CREATE INDEX IF NOT EXISTS "pet_alerts_severity_idx" ON "pet_alerts"("severity");
CREATE INDEX IF NOT EXISTS "pet_alerts_status_idx" ON "pet_alerts"("status");
CREATE INDEX IF NOT EXISTS "pet_alerts_created_at_idx" ON "pet_alerts"("created_at");

CREATE INDEX IF NOT EXISTS "scene_items_scene_id_idx" ON "scene_items"("scene_id");
CREATE INDEX IF NOT EXISTS "scene_items_type_idx" ON "scene_items"("type");
