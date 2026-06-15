CREATE TABLE "pet_diary_templates" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "scene_hint" TEXT,
  "tone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pet_diary_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pet_diary_templates_slug_key" ON "pet_diary_templates"("slug");
CREATE INDEX "pet_diary_templates_active_idx" ON "pet_diary_templates"("active");
CREATE INDEX "pet_diary_templates_scene_hint_idx" ON "pet_diary_templates"("scene_hint");
