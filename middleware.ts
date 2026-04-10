// Middleware — na razie przepuszcza wszystko (auth wylaczony).
// Auth.js jest skonfigurowany i gotowy do wlaczenia po ustawieniu
// env vars (AUTH_SECRET, AUTH_RESEND_KEY) na Vercel.
// Zeby wlaczyc auth: odkomentuj blok ponizej.

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Pomin Next.js internals i statyczne pliki
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
