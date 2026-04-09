import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Wyczesany HQ — build info.
// Numer buildu (count commitow), hash, czas startu trafiaja do env,
// dzieki temu sidebar pokazuje wersje/build.
function readGitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "nogit";
  }
}

// Numer buildu = liczba commitow w historii HEAD. Rosnie o 1 z kazdym
// commitem, czytelny (cyfra), latwy do porownania ("jestem na #142, a ta
// to #131 → starsza"). Hash zostaje jako tooltip dla debugowania.
function readBuildNumber(): string {
  try {
    return execSync("git rev-list --count HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "0";
  }
}

const buildTime = new Date().toLocaleTimeString("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: "0.2.0",
    NEXT_PUBLIC_BUILD_NUMBER: readBuildNumber(),
    NEXT_PUBLIC_GIT_HASH: readGitHash(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
