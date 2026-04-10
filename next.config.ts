import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Wyczesany HQ — build info.
// Numer buildu z pliku BUILD_NUMBER (inkrementowany przy commitach).
// Format w UI: "Build070 · 15:48"

function readBuildNumber(): string {
  try {
    const raw = readFileSync(resolve(process.cwd(), "BUILD_NUMBER"), "utf-8").trim();
    const num = parseInt(raw, 10);
    if (Number.isNaN(num)) return "000";
    return String(num).padStart(3, "0");
  } catch {
    return "000";
  }
}

const buildTime = new Date().toLocaleTimeString("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_NUMBER: readBuildNumber(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
