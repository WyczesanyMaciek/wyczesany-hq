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
      // Sprawdz czy email jest w bazie (admin dodal go wczesniej)
      // LUB czy to pierwszy user (auto-admin)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUser) return true;
      // Pierwszy user w systemie staje sie adminem
      const userCount = await prisma.user.count();
      if (userCount === 0) return true;
      // Nowy email bez wpisu w bazie = odrzucony
      return false;
    },
  },
  events: {
    // Pierwszy user automatycznie dostaje role admin
    async createUser({ user }) {
      const userCount = await prisma.user.count();
      if (userCount === 1 && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        });
      }
    },
  },
});
