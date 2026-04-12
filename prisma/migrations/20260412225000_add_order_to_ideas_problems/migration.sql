-- AlterTable: dodaj kolumne order do Idea i Problem (DnD reorder)
ALTER TABLE "Idea" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Problem" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
