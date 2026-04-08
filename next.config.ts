import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Wyczesany HQ — build info.
// Hash z git rev-parse i czas startu trafiaja do env,
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

const buildTime = new Date().toLocaleTimeString("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: "0.2.0",
    NEXT_PUBLIC_GIT_HASH: readGitHash(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
