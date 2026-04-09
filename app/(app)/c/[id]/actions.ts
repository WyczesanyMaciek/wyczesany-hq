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

// Alias dla spojnosci nazewniczej w nowym UI.
export const toggleTaskDone = toggleTask;

// ---- TASK: reorder, przenoszenie, szczegoly ----

/**
 * Reorder taskow w ramach jednego kontenera (projekt albo luzne w kontekscie).
 * Przyjmuje uporzadkowana liste id. Zapisuje kolejnosc jako order = 0..n-1.
 */
export async function reorderTasks(orderedIds: string[]): Promise<Result> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: "Pusta lista." };
  }
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.task.update({ where: { id }, data: { order: idx } })
    )
  );
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Przenies task do projektu. Kontekst taska ustawiamy na kontekst projektu.
 * Task laduje na koncu listy projektu.
 */
export async function moveTaskToProject(
  taskId: string,
  projectId: string
): Promise<Result> {
  const [task, project] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);
  if (!task) return { ok: false, error: "Task nie istnieje." };
  if (!project) return { ok: false, error: "Projekt nie istnieje." };

  const last = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      projectId,
      contextId: project.contextId,
      order: nextOrder,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Zwolnij task z projektu — staje sie luzny w kontekscie projektu.
 */
export async function releaseTaskFromProject(
  taskId: string
): Promise<Result> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { ok: false, error: "Task nie istnieje." };
  if (!task.projectId) return { ok: false, error: "Task nie jest w projekcie." };

  const last = await prisma.task.findFirst({
    where: { contextId: task.contextId, projectId: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  await prisma.task.update({
    where: { id: taskId },
    data: { projectId: null, order: nextOrder },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Aktualizacja szczegolow taska — notatki, deadline, priorytet, assignee.
 * Kazde pole opcjonalne. `undefined` = nie rusz, `null` = wyczysc.
 */
export async function updateTaskDetails(
  taskId: string,
  input: {
    title?: string;
    notes?: string | null;
    deadline?: string | null;
    priority?: number;
    assigneeId?: string | null;
  }
): Promise<Result> {
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) return { ok: false, error: "Task nie istnieje." };

  const data: {
    title?: string;
    notes?: string | null;
    deadline?: Date | null;
    priority?: number;
    assigneeId?: string | null;
  } = {};

  if (input.title !== undefined) {
    const title = str(input.title);
    if (title.length < 1 || title.length > 200) {
      return { ok: false, error: "Tytul 1-200 znakow." };
    }
    data.title = title;
  }
  if (input.notes !== undefined) {
    data.notes = input.notes === null ? null : str(input.notes) || null;
  }
  if (input.deadline !== undefined) {
    data.deadline = input.deadline === null ? null : parseDateOrNull(input.deadline);
  }
  if (input.priority !== undefined) {
    data.priority = parsePriority(input.priority);
  }
  if (input.assigneeId !== undefined) {
    data.assigneeId = input.assigneeId === null ? null : str(input.assigneeId) || null;
  }

  await prisma.task.update({ where: { id: taskId }, data });
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- TASK LINK ----

export async function addTaskLink(
  taskId: string,
  input: { label: string; url: string }
): Promise<Result<{ id: string }>> {
  const label = str(input.label);
  const url = str(input.url);
  if (label.length < 1 || label.length > 120) {
    return { ok: false, error: "Label 1-120 znakow." };
  }
  if (url.length < 1 || url.length > 2000) {
    return { ok: false, error: "URL 1-2000 znakow." };
  }
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) return { ok: false, error: "Task nie istnieje." };

  const l = await prisma.taskLink.create({
    data: { taskId, label, url },
  });
  revalidatePath("/", "layout");
  return { ok: true, data: { id: l.id } };
}

export async function removeTaskLink(linkId: string): Promise<Result> {
  const l = await prisma.taskLink.findUnique({ where: { id: linkId } });
  if (!l) return { ok: false, error: "Link nie istnieje." };
  await prisma.taskLink.delete({ where: { id: linkId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- TASK ATTACHMENT ----

export async function addTaskAttachment(
  taskId: string,
  input: { kind: string; name: string; url: string }
): Promise<Result<{ id: string }>> {
  const kind = str(input.kind);
  const name = str(input.name);
  const url = str(input.url);
  if (!["image", "video", "file"].includes(kind)) {
    return { ok: false, error: "kind musi byc image|video|file." };
  }
  if (name.length < 1 || name.length > 200) {
    return { ok: false, error: "Nazwa 1-200 znakow." };
  }
  if (url.length < 1 || url.length > 2000) {
    return { ok: false, error: "URL 1-2000 znakow." };
  }
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) return { ok: false, error: "Task nie istnieje." };

  const a = await prisma.taskAttachment.create({
    data: { taskId, kind, name, url },
  });
  revalidatePath("/", "layout");
  return { ok: true, data: { id: a.id } };
}

export async function removeTaskAttachment(
  attachmentId: string
): Promise<Result> {
  const a = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId },
  });
  if (!a) return { ok: false, error: "Zalacznik nie istnieje." };
  await prisma.taskAttachment.delete({ where: { id: attachmentId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- PROJEKT: reorder, przenoszenie ----

/**
 * Reorder projektow w ramach jednego kontekstu.
 */
export async function reorderProjects(orderedIds: string[]): Promise<Result> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: "Pusta lista." };
  }
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.project.update({ where: { id }, data: { order: idx } })
    )
  );
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Przenies projekt do innego kontekstu. Wszystkie taski projektu
 * przechodza razem z nim — aktualizujemy im contextId.
 */
export async function moveProjectToContext(
  projectId: string,
  contextId: string
): Promise<Result> {
  const [project, context] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.context.findUnique({ where: { id: contextId } }),
  ]);
  if (!project) return { ok: false, error: "Projekt nie istnieje." };
  if (!context) return { ok: false, error: "Kontekst nie istnieje." };

  const last = await prisma.project.findFirst({
    where: { contextId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { contextId, order: nextOrder },
    }),
    prisma.task.updateMany({
      where: { projectId },
      data: { contextId },
    }),
  ]);

  revalidatePath("/", "layout");
  return { ok: true };
}
