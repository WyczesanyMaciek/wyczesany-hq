import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Wyczesany HQ — build info.
// Numer buildu (timestamp ostatniego commita), hash, czas startu trafiaja
// do env, dzieki temu sidebar pokazuje wersje/build.

function readGitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "nogit";
  }
}

// Numer buildu = timestamp ostatniego commita w formacie MMDD-HHMM.
// Przyklad: "0409-2150" = 9 kwietnia, 21:50.
//
// Dlaczego timestamp zamiast rev-list count:
// Vercel klonuje repo z shallow clone (depth ~10), wiec `git rev-list --count
// HEAD` zwraca tylko 10 zamiast prawdziwej liczby commitow. Proba
// `git fetch --unshallow` w prebuild scriptcie nie zadzialala (prawdopodobnie
// brak auth do remote po inicjalnym clone).
//
// Commit timestamp jest dostepny zawsze — `git log -1` patrzy tylko na
// HEAD, nie wymaga historii. Rosnie monotonicznie w czasie. Czytelny
// (widac kiedy kod poszedl). Latwe porownanie ("moja to #0409-2200, a ta
// #0409-1830" -> pierwsza jest nowsza).
function readBuildNumber(): string {
  try {
    return execSync("git log -1 --format=%cd --date=format:%m%d-%H%M", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "nodate";
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
