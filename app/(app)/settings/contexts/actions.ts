"use server";

// Server actions dla CRUD kontekstow.
// Wszystkie walidacje po stronie serwera — klient tylko wysyla wartosci.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { PALETTE_HEX_SET } from "@/lib/colors";

export type ContextFormInput = {
  name: string;
  color: string;
  parentId: string | null;
};

function validateInput(input: ContextFormInput): string | null {
  const name = input.name?.trim();
  if (!name) return "Nazwa jest wymagana.";
  if (name.length > 80) return "Nazwa moze miec maksymalnie 80 znakow.";
  if (!PALETTE_HEX_SET.has(input.color)) return "Nieprawidlowy kolor.";
  return null;
}

export async function createContext(input: ContextFormInput) {
  const err = validateInput(input);
  if (err) return { ok: false as const, error: err };

  // Sprawdz rodzica jesli podany
  if (input.parentId) {
    const parent = await prisma.context.findUnique({
      where: { id: input.parentId },
    });
    if (!parent) return { ok: false as const, error: "Rodzic nie istnieje." };
  }

  // Ustal order jako max + 1 w obrebie tego samego rodzica
  const siblings = await prisma.context.findMany({
    where: { parentId: input.parentId ?? null },
    select: { order: true },
    orderBy: { order: "desc" },
    take: 1,
  });
  const nextOrder = (siblings[0]?.order ?? -1) + 1;

  await prisma.context.create({
    data: {
      name: input.name.trim(),
      color: input.color,
      parentId: input.parentId ?? null,
      order: nextOrder,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateContext(id: string, input: ContextFormInput) {
  const err = validateInput(input);
  if (err) return { ok: false as const, error: err };

  const existing = await prisma.context.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "Kontekst nie istnieje." };

  // Ochrona przed cyklem: nie mozna ustawic samego siebie jako rodzica
  if (input.parentId === id) {
    return { ok: false as const, error: "Kontekst nie moze byc wlasnym rodzicem." };
  }

  // Ochrona przed cyklem przez potomka: przejdz w gore od nowego rodzica
  // i sprawdz, czy nie trafimy na ten sam id.
  if (input.parentId) {
    let cursor: string | null = input.parentId;
    const visited = new Set<string>();
    while (cursor) {
      if (cursor === id) {
        return {
          ok: false as const,
          error: "Nie mozna ustawic kontekstu jako rodzica swojego potomka.",
        };
      }
      if (visited.has(cursor)) break;
      visited.add(cursor);
      const p: { parentId: string | null } | null =
        await prisma.context.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        });
      cursor = p?.parentId ?? null;
    }
  }

  await prisma.context.update({
    where: { id },
    data: {
      name: input.name.trim(),
      color: input.color,
      parentId: input.parentId ?? null,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteContext(id: string) {
  const ctx = await prisma.context.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          children: true,
          projects: true,
          tasks: true,
          ideas: true,
          problems: true,
          notes: true,
          links: true,
        },
      },
    },
  });

  if (!ctx) return { ok: false as const, error: "Kontekst nie istnieje." };

  const c = ctx._count;
  const total =
    c.children +
    c.projects +
    c.tasks +
    c.ideas +
    c.problems +
    c.notes +
    c.links;

  if (total > 0) {
    const parts: string[] = [];
    if (c.children) parts.push(`${c.children} kontekstow`);
    if (c.projects) parts.push(`${c.projects} projektow`);
    if (c.tasks) parts.push(`${c.tasks} taskow`);
    if (c.ideas) parts.push(`${c.ideas} pomyslow`);
    if (c.problems) parts.push(`${c.problems} problemow`);
    if (c.notes) parts.push(`${c.notes} notatek`);
    if (c.links) parts.push(`${c.links} linkow`);

    return {
      ok: false as const,
      error: `Nie mozna usunac kontekstu "${ctx.name}" — zawiera: ${parts.join(", ")}. Najpierw przenies lub usun te elementy.`,
    };
  }

  await prisma.context.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
