-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HEART_RATE_SURGE', 'VOICE_TREMOR', 'SLEEP_ANOMALY', 'EMOTION_SWING', 'SOCIAL_WITHDRAWAL', 'GAIT_ANOMALY', 'EATING_ANOMALY');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('COMPLETED', 'FOLLOWING', 'PENDING', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('REGULAR_INTERVIEW', 'CBT_THERAPY', 'GROUP_COUNSELING', 'CRISIS_INTERVENTION', 'INITIAL_ASSESSMENT');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('VR', 'BRACELET', 'EEG');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_USE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('VECTORIZED', 'PROCESSING', 'FAILED');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "student_no" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "faculty_id" TEXT,
    "gender" TEXT,
    "birth_date" TIMESTAMP(3),
    "mbti" TEXT,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psych_profiles" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "adversity_quotient" INTEGER NOT NULL,
    "emotional_stability" INTEGER NOT NULL,
    "social_tendency" INTEGER NOT NULL,
    "stress_resistance" INTEGER NOT NULL,
    "self_awareness" INTEGER NOT NULL,
    "empathy" INTEGER NOT NULL,
    "willpower" INTEGER NOT NULL,
    "adaptability" INTEGER NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psych_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campus_x" DOUBLE PRECISION,
    "campus_y" DOUBLE PRECISION,
    "stress_index" DOUBLE PRECISION,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "level" TEXT NOT NULL,
    "alert_time" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "method" TEXT NOT NULL,
    "counselor" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "detail" TEXT,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervention_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "InterventionType" NOT NULL,
    "counselor" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intervention_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vr_scenes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vr_scenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vr_sessions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "scene_id" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "emotion_before" TEXT NOT NULL,
    "emotion_after" TEXT NOT NULL,
    "result" "Sentiment" NOT NULL,
    "session_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vr_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "model" TEXT,
    "status" "DeviceStatus" NOT NULL,
    "battery" INTEGER,
    "room" TEXT,
    "location" TEXT,
    "last_active" TEXT,
    "last_sync" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "current_student_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_devices" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "heart_rate" INTEGER NOT NULL,
    "hrv" DOUBLE PRECISION,
    "gsr" DOUBLE PRECISION,
    "stress_index" INTEGER,
    "blood_oxygen" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_analyses" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "tremor_index" DOUBLE PRECISION NOT NULL,
    "emotion_label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expression_data" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "primary_expression" TEXT NOT NULL,
    "anxiety_level" DOUBLE PRECISION NOT NULL,
    "sadness_level" DOUBLE PRECISION NOT NULL,
    "anger_level" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expression_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_size" TEXT NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL,
    "status" "DocStatus" NOT NULL,
    "vector_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_presets" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompt_presets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_student_no_key" ON "students"("student_no");

-- CreateIndex
CREATE INDEX "students_class_name_idx" ON "students"("class_name");

-- CreateIndex
CREATE INDEX "students_faculty_id_idx" ON "students"("faculty_id");

-- CreateIndex
CREATE INDEX "students_risk_level_idx" ON "students"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "psych_profiles_student_id_key" ON "psych_profiles"("student_id");

-- CreateIndex
CREATE INDEX "psych_profiles_student_id_idx" ON "psych_profiles"("student_id");

-- CreateIndex
CREATE INDEX "timeline_events_student_id_idx" ON "timeline_events"("student_id");

-- CreateIndex
CREATE INDEX "timeline_events_status_idx" ON "timeline_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "faculties"("name");

-- CreateIndex
CREATE INDEX "faculties_risk_level_idx" ON "faculties"("risk_level");

-- CreateIndex
CREATE INDEX "alerts_student_id_idx" ON "alerts"("student_id");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_level_idx" ON "alerts"("level");

-- CreateIndex
CREATE INDEX "alerts_alert_time_idx" ON "alerts"("alert_time");

-- CreateIndex
CREATE INDEX "work_orders_student_id_idx" ON "work_orders"("student_id");

-- CreateIndex
CREATE INDEX "work_orders_risk_level_idx" ON "work_orders"("risk_level");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_date_idx" ON "work_orders"("date");

-- CreateIndex
CREATE INDEX "intervention_records_student_id_idx" ON "intervention_records"("student_id");

-- CreateIndex
CREATE INDEX "intervention_records_type_idx" ON "intervention_records"("type");

-- CreateIndex
CREATE INDEX "intervention_records_date_idx" ON "intervention_records"("date");

-- CreateIndex
CREATE INDEX "intervention_records_status_idx" ON "intervention_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vr_scenes_name_key" ON "vr_scenes"("name");

-- CreateIndex
CREATE INDEX "vr_sessions_student_id_idx" ON "vr_sessions"("student_id");

-- CreateIndex
CREATE INDEX "vr_sessions_scene_id_idx" ON "vr_sessions"("scene_id");

-- CreateIndex
CREATE INDEX "vr_sessions_session_at_idx" ON "vr_sessions"("session_at");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_number_key" ON "devices"("serial_number");

-- CreateIndex
CREATE INDEX "devices_type_idx" ON "devices"("type");

-- CreateIndex
CREATE INDEX "devices_status_idx" ON "devices"("status");

-- CreateIndex
CREATE INDEX "consultation_rooms_status_idx" ON "consultation_rooms"("status");

-- CreateIndex
CREATE INDEX "consultation_rooms_current_student_id_idx" ON "consultation_rooms"("current_student_id");

-- CreateIndex
CREATE INDEX "room_devices_room_id_idx" ON "room_devices"("room_id");

-- CreateIndex
CREATE INDEX "room_devices_device_id_idx" ON "room_devices"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_devices_room_id_device_id_key" ON "room_devices"("room_id", "device_id");

-- CreateIndex
CREATE INDEX "vital_signs_student_id_idx" ON "vital_signs"("student_id");

-- CreateIndex
CREATE INDEX "vital_signs_timestamp_idx" ON "vital_signs"("timestamp");

-- CreateIndex
CREATE INDEX "vital_signs_student_id_timestamp_idx" ON "vital_signs"("student_id", "timestamp");

-- CreateIndex
CREATE INDEX "voice_analyses_student_id_idx" ON "voice_analyses"("student_id");

-- CreateIndex
CREATE INDEX "voice_analyses_timestamp_idx" ON "voice_analyses"("timestamp");

-- CreateIndex
CREATE INDEX "voice_analyses_sentiment_idx" ON "voice_analyses"("sentiment");

-- CreateIndex
CREATE INDEX "voice_analyses_student_id_timestamp_idx" ON "voice_analyses"("student_id", "timestamp");

-- CreateIndex
CREATE INDEX "expression_data_student_id_idx" ON "expression_data"("student_id");

-- CreateIndex
CREATE INDEX "expression_data_timestamp_idx" ON "expression_data"("timestamp");

-- CreateIndex
CREATE INDEX "expression_data_student_id_timestamp_idx" ON "expression_data"("student_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ai_documents_name_key" ON "ai_documents"("name");

-- CreateIndex
CREATE INDEX "ai_documents_status_idx" ON "ai_documents"("status");

-- CreateIndex
CREATE INDEX "ai_documents_upload_date_idx" ON "ai_documents"("upload_date");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_presets_value_key" ON "ai_prompt_presets"("value");

-- CreateIndex
CREATE INDEX "ai_prompt_presets_is_active_idx" ON "ai_prompt_presets"("is_active");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psych_profiles" ADD CONSTRAINT "psych_profiles_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_records" ADD CONSTRAINT "intervention_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vr_sessions" ADD CONSTRAINT "vr_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vr_sessions" ADD CONSTRAINT "vr_sessions_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "vr_scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_rooms" ADD CONSTRAINT "consultation_rooms_current_student_id_fkey" FOREIGN KEY ("current_student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_devices" ADD CONSTRAINT "room_devices_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "consultation_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_devices" ADD CONSTRAINT "room_devices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_analyses" ADD CONSTRAINT "voice_analyses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expression_data" ADD CONSTRAINT "expression_data_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
