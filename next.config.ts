import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Wyczesany HQ — build info.
// Numer buildu = liczba commitow na main. Automatycznie rosnie.
// Format w UI: "Build #095 · 17:42"

function getBuildNumber(): string {
  try {
    const count = execSync("git rev-list --count HEAD", { encoding: "utf-8" }).trim();
    const num = parseInt(count, 10);
    if (Number.isNaN(num)) return "000";
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
