// Global search — szuka w kontekstach, projektach, taskach, pomyslach, problemach.
// Zwraca max 20 wynikow, pogrupowane po typie.

import { prisma } from "@/lib/db";

export type SearchResult = {
  type: "context" | "project" | "task" | "idea" | "problem";
  id: string;
  title: string;
  subtitle: string | null;
  contextId: string;
  contextName: string;
  contextColor: string;
  projectId?: string;
};

export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const like = `%${q}%`;
  const results: SearchResult[] = [];

  // Szukaj rownolegle
  const [contexts, projects, tasks, ideas, problems] = await Promise.all([
    prisma.context.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, color: true },
    }),
    prisma.project.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      include: { context: { select: { id: true, name: true, color: true } } },
    }),
    prisma.task.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5,
      include: { context: { select: { id: true, name: true, color: true } } },
    }),
    prisma.idea.findMany({
      where: { content: { contains: q, mode: "insensitive" } },
      take: 3,
      include: { context: { select: { id: true, name: true, color: true } } },
    }),
    prisma.problem.findMany({
      where: { content: { contains: q, mode: "insensitive" } },
      take: 3,
      include: { context: { select: { id: true, name: true, color: true } } },
    }),
  ]);

  for (const c of contexts) {
    results.push({
      type: "context",
      id: c.id,
      title: c.name,
      subtitle: null,
      contextId: c.id,
      contextName: c.name,
      contextColor: c.color,
    });
  }

  for (const p of projects) {
    results.push({
      type: "project",
      id: p.id,
      title: p.name,
      subtitle: p.description?.slice(0, 60) ?? null,
      contextId: p.context.id,
      contextName: p.context.name,
      contextColor: p.context.color,
      projectId: p.id,
    });
  }

  for (const t of tasks) {
    results.push({
      type: "task",
      id: t.id,
      title: t.title,
      subtitle: t.done ? "zrobione" : null,
      contextId: t.context.id,
      contextName: t.context.name,
      contextColor: t.context.color,
      projectId: t.projectId ?? undefined,
    });
  }

  for (const i of ideas) {
    results.push({
      type: "idea",
      id: i.id,
      title: i.content.slice(0, 80),
      subtitle: "pomysl",
      contextId: i.context.id,
      contextName: i.context.name,
      contextColor: i.context.color,
    });
  }

  for (const pr of problems) {
    results.push({
      type: "problem",
      id: pr.id,
      title: pr.content.slice(0, 80),
      subtitle: "problem",
      contextId: pr.context.id,
      contextName: pr.context.name,
      contextColor: pr.context.color,
    });
  }

  return results.slice(0, 20);
}
