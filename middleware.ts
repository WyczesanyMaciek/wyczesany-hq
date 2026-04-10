// Middleware — ochrona routes. Niezalogowani -> /login.
// UWAGA: nie importujemy auth() tutaj bo Prisma adapter uzywa Node.js modules
// (node:path, node:url) ktore nie dzialaja w Edge Runtime.
// Zamiast tego sprawdzamy obecnosc cookie sesji Auth.js.
// Pelna walidacja sesji odbywa sie w server components przez auth().

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth", "/api/mcp"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Publiczne sciezki — przepusc
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Sprawdz cookie sesji Auth.js (bez pelnej walidacji — ta jest w server components)
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Pomin Next.js internals i statyczne pliki
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
