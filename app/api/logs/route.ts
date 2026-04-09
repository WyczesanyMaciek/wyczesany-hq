// /api/logs — zwraca ostatnie ~200 linii loga dev servera.
// Log jest pipowany z `next dev` do .next/dev-server.log (patrz package.json).
//
// WAZNE: to jest narzedzie DEV-ONLY. Na Vercel (produkcja/serverless Lambda)
// plik .next/dev-server.log nie istnieje i filesystem jest read-only.
// W produkcji endpoint zwraca `devOnly: true` zamiast proby czytania pliku,
// zeby nie marnowac cold-start + unikac mylacego bledu ENOENT.
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
  // Na produkcji/Vercel: dev logs nie istnieja. Zwroc flage devOnly.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        lines: [],
        total: 0,
        path: ".next/dev-server.log",
        devOnly: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

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
