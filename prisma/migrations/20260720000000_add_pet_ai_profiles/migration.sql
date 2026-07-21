CREATE TABLE "pet_ai_profiles" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT '温暖陪伴',
    "response_style" TEXT NOT NULL DEFAULT '简短自然',
    "initiative" INTEGER NOT NULL DEFAULT 60,
    "system_prompt" TEXT NOT NULL,
    "knowledge_scope" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_ai_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pet_ai_profiles_pet_id_key" ON "pet_ai_profiles"("pet_id");

ALTER TABLE "pet_ai_profiles"
ADD CONSTRAINT "pet_ai_profiles_pet_id_fkey"
FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
