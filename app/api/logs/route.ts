// /api/logs — zwraca ostatnie ~200 linii loga dev servera.
// Log jest pipowany z `next dev` do .next/dev-server.log (patrz package.json).
//
// TODO(Etap 9): wystawic to jako MCP tool `get_dev_logs`, zeby Claude
// mogl czytac logi przez MCP bez otwierania /dev/logs w UI.

import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LOG_PATH = path.join(process.cwd(), ".next", "dev-server.log");
const MAX_LINES = 200;

export async function GET() {
  try {
    const content = await readFile(LOG_PATH, "utf-8");
    const allLines = content.split("\n");
    const lines = allLines.slice(-MAX_LINES);
    return NextResponse.json(
      { lines, total: allLines.length, path: ".next/dev-server.log" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        lines: [],
        total: 0,
        path: ".next/dev-server.log",
        error: `Nie mozna odczytac loga: ${message}`,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
