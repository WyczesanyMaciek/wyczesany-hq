// Prisma config — ladujemy .env.local (Next.js convention) przed .env,
// zeby CLI (migrate, db seed, studio) widzial ten sam DATABASE_URL co app runtime.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" }); // fallback
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
