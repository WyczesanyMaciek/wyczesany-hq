"use server";

// Server actions dla dashboardu kontekstu.
// Projekty, luzne taski — tworzenie, toggle, usuwanie.

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ---- pomocnicze ----

type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function str(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function parseDateOrNull(input: unknown): Date | null {
  if (typeof input !== "string" || !input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parsePriority(input: unknown): number {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 3) return 3;
  return Math.floor(n);
}

// ---- PROJEKT ----

export async function createProject(
  contextId: string,
  input: {
    name: string;
    description?: string | null;
    deadline?: string | null; // YYYY-MM-DD z input[type=date]
    status?: string;
  }
): Promise<Result<{ id: string }>> {
  const name = str(input.name);
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "Nazwa projektu musi miec 1-120 znakow." };
  }
  const ctx = await prisma.context.findUnique({ where: { id: contextId } });
  if (!ctx) return { ok: false, error: "Kontekst nie istnieje." };

  const status = str(input.status) || "todo";
  if (!["todo", "in_progress", "done", "on_hold"].includes(status)) {
    return { ok: false, error: "Nieprawidlowy status." };
  }

  const description = str(input.description) || null;
  const deadline = parseDateOrNull(input.deadline);

  // nextOrder: max+1 w ramach kontekstu
  const last = await prisma.project.findFirst({
    where: { contextId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  const p = await prisma.project.create({
    data: {
      name,
      description,
      status,
      deadline,
      contextId,
      order: nextOrder,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { id: p.id } };
}

export async function deleteProject(
  projectId: string
): Promise<Result> {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    include: { _count: { select: { tasks: true, notes: true, links: true } } },
  });
  if (!p) return { ok: false, error: "Projekt nie istnieje." };

  // Usuwamy taski, notatki i linki powiazane (cascade recznie)
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { projectId } }),
    prisma.note.deleteMany({ where: { projectId } }),
    prisma.link.deleteMany({ where: { projectId } }),
    prisma.project.delete({ where: { id: projectId } }),
  ]);

  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- TASK ----

export async function createLooseTask(
  contextId: string,
  input: {
    title: string;
    deadline?: string | null;
    priority?: number;
  }
): Promise<Result<{ id: string }>> {
  const title = str(input.title);
  if (title.length < 1 || title.length > 200) {
    return { ok: false, error: "Tytul zadania musi miec 1-200 znakow." };
  }
  const ctx = await prisma.context.findUnique({ where: { id: contextId } });
  if (!ctx) return { ok: false, error: "Kontekst nie istnieje." };

  const deadline = parseDateOrNull(input.deadline);
  const priority = parsePriority(input.priority);

  // nextOrder: max+1 w ramach kontekstu dla luznych (projectId = null)
  const last = await prisma.task.findFirst({
    where: { contextId, projectId: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  const t = await prisma.task.create({
    data: {
      title,
      deadline,
      priority,
      contextId,
      projectId: null,
      order: nextOrder,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { id: t.id } };
}

export async function toggleTask(taskId: string): Promise<Result<{ done: boolean }>> {
  const t = await prisma.task.findUnique({
    where: { id: taskId },
    select: { done: true },
  });
  if (!t) return { ok: false, error: "Task nie istnieje." };

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { done: !t.done },
    select: { done: true },
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { done: updated.done } };
}

export async function deleteTask(taskId: string): Promise<Result> {
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) return { ok: false, error: "Task nie istnieje." };
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/", "layout");
  return { ok: true };
}
