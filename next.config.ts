import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Wyczesany HQ — build info.
// Numer buildu z build-meta.json (inkrementowany w pre-commit hook).
// Czas buildu generowany dynamicznie.
// Format w UI: "Build #137 · 19:42"

function getBuildNumber(): string {
  try {
    const raw = readFileSync(resolve(process.cwd(), "build-meta.json"), "utf-8");
    const meta = JSON.parse(raw);
    const num = meta.number;
    if (typeof num !== "number" || Number.isNaN(num)) return "000";
    return String(num).padStart(3, "0");
  } catch {
    return "000";
  }
}

const buildTime = new Date().toLocaleTimeString("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Warsaw",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_NUMBER: getBuildNumber(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
