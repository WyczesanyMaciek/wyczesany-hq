// Middleware — ochrona routes. Niezalogowani -> /login.
// Publiczne sciezki: /login, /api/auth, statyczne assety.

import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Publiczne sciezki — przepusc
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Niezalogowany — redirect do /login
  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Pomin Next.js internals i statyczne pliki
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
