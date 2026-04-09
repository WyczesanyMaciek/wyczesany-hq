// Wyczesany HQ — singleton PrismaClient.
// Uzywa adaptera pg (Postgres — Neon lokalnie w dev i docelowo na Vercel).
// Migracja z SQLite na Postgres: zmiana providera w schema.prisma
// + zmiana adaptera tu + DATABASE_URL w .env.local / Vercel env vars.

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Put connection string in .env.local (Neon) albo w env vars na Vercel."
  );
}

// Connection pool do Postgresa. Pooler Neon jest bezpieczny z serverless,
// wystarczy zwykly Pool z pg — Prisma adapter obsluzy lifecycle.
const adapter = new PrismaPg({ connectionString: databaseUrl });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
