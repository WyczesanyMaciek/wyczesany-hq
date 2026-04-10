// Wyczesany HQ — konfiguracja Auth.js v5.
// Magic link (email) — bez hasel. Whitelist emaili.
// Resend jako provider maili (AUTH_RESEND_KEY w env).
// Prisma adapter — sesje i tokeny w Postgres.

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM ?? "Wyczesany HQ <noreply@wyczesany.com>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  callbacks: {
    // Dodaj role do sesji
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        (session.user as { role?: string }).role =
          (user as { role?: string }).role ?? "member";
      }
      return session;
    },
    // Whitelist: tylko whitelistowane emaile moga sie logowac
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      // Admin email — zawsze dozwolony (bootstrap)
      const adminEmail = (process.env.ADMIN_EMAIL ?? "maciek@wyczesany.com").toLowerCase();
      if (email === adminEmail) return true;
      // Sprawdz czy email jest w bazie (admin dodal go wczesniej)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) return true;
      // Nowy email bez wpisu w bazie = odrzucony
      return false;
    },
  },
  events: {
    // Admin email automatycznie dostaje role admin
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      const adminEmail = (process.env.ADMIN_EMAIL ?? "maciek@wyczesany.com").toLowerCase();
      if (user.email.toLowerCase() === adminEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        });
      }
    },
  },
});
