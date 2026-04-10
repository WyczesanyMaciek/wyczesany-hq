"use server";

// Server actions do zarzadzania userami i ich dostepem do kontekstow.
// Tylko admin moze uzywac tych akcji.

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// Helper: sprawdz czy aktualny user to admin
async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Niezalogowany." };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") return { ok: false, error: "Brak uprawnien." };
  return { ok: true, userId: session.user.id };
}

// ---- Whitelist: dodaj email ----

export async function whitelistEmail(email: string): Promise<Result<{ id: string }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "Nieprawidlowy email." };
  }

  // Sprawdz czy juz istnieje
  const existing = await prisma.user.findUnique({ where: { email: trimmed } });
  if (existing) return { ok: false, error: "User z tym emailem juz istnieje." };

  // Tworzymy usera z emailem — zaloguje sie magic linkiem
  const user = await prisma.user.create({
    data: { email: trimmed, role: "member" },
  });

  revalidatePath("/settings/users");
  return { ok: true, data: { id: user.id } };
}

// ---- Usun usera ----

export async function removeUser(userId: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  if (userId === admin.userId) {
    return { ok: false, error: "Nie mozesz usunac siebie." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "User nie istnieje." };

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/settings/users");
  return { ok: true };
}

// ---- Zmien role ----

export async function changeRole(
  userId: string,
  role: "admin" | "member"
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  if (userId === admin.userId) {
    return { ok: false, error: "Nie mozesz zmienic swojej roli." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "User nie istnieje." };

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/settings/users");
  return { ok: true };
}

// ---- Dostep do kontekstow ----

export async function grantContextAccess(
  userId: string,
  contextId: string
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const [user, context] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.context.findUnique({ where: { id: contextId } }),
  ]);
  if (!user) return { ok: false, error: "User nie istnieje." };
  if (!context) return { ok: false, error: "Kontekst nie istnieje." };

  // Sprawdz czy juz ma dostep
  const existing = await prisma.userContextAccess.findUnique({
    where: { userId_contextId: { userId, contextId } },
  });
  if (existing) return { ok: false, error: "User juz ma dostep." };

  await prisma.userContextAccess.create({
    data: { userId, contextId },
  });

  revalidatePath("/settings/users");
  return { ok: true };
}

export async function revokeContextAccess(
  userId: string,
  contextId: string
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const existing = await prisma.userContextAccess.findUnique({
    where: { userId_contextId: { userId, contextId } },
  });
  if (!existing) return { ok: false, error: "User nie ma tego dostepu." };

  await prisma.userContextAccess.delete({
    where: { userId_contextId: { userId, contextId } },
  });

  revalidatePath("/settings/users");
  return { ok: true };
}

// ---- Lista userow z ich dostepami ----

export type UserWithAccess = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  image: string | null;
  createdAt: Date;
  contextAccess: Array<{ contextId: string; contextName: string; contextColor: string }>;
};

export async function getUsers(): Promise<UserWithAccess[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: {
      contextAccess: {
        include: {
          context: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    image: u.image,
    createdAt: u.createdAt,
    contextAccess: u.contextAccess.map((a) => ({
      contextId: a.context.id,
      contextName: a.context.name,
      contextColor: a.context.color,
    })),
  }));
}
