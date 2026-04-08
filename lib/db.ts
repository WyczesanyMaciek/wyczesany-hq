// Wyczesany HQ — singleton PrismaClient.
// Uzywa adaptera better-sqlite3 (SQLite lokalnie).
// Migracja na Postgres = zmiana adaptera + provider w schema.prisma.

import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
// Adapter oczekuje sciezki bez prefiksu "file:"
const dbPath = databaseUrl.replace(/^file:/, "");

const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
