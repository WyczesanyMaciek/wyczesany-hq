// Wyczesany HQ — zapytania o dashboard kontekstu i dashboard globalny.
// Zwracaja dane zagregowane „w gore" (kontekst + wszyscy potomkowie).
// Kazdy element ma dolaczony kontekst pochodzenia (do badge'a).

import { prisma } from "@/lib/db";

// Mini-kontekst do badge'a przy elemencie.
export type OriginContext = {
  id: string;
  name: string;
  color: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  createdAt: Date;
  context: OriginContext;
};

export type DashboardTask = {
  id: string;
  title: string;
  done: boolean;
  deadline: Date | null;
  priority: number;
  createdAt: Date;
  context: OriginContext;
};

export type DashboardItem = {
  id: string;
  content: string;
  createdAt: Date;
  context: OriginContext;
};

export type DashboardData = {
  // Aktualny kontekst (null dla globalnego dashboardu)
  current: {
    id: string;
    name: string;
    color: string;
    breadcrumb: Array<{ id: string; name: string; color: string }>;
  } | null;
  projects: DashboardProject[];
  looseTasks: DashboardTask[]; // niezakonczone, projectId = null
  doneTasks: DashboardTask[]; // historia — zakonczone luzne taski
  ideas: DashboardItem[];
  problems: DashboardItem[];
};

/**
 * Buduje mape contextId -> {id, name, color, parentId} do szybkiego
 * wyciagania przodkow i badge'ow. Jedno zapytanie do bazy.
 */
async function loadAllContexts() {
  const rows = await prisma.context.findMany({
    select: { id: true, name: true, color: true, parentId: true },
  });
  const map = new Map<
    string,
    { id: string; name: string; color: string; parentId: string | null }
  >();
  for (const r of rows) map.set(r.id, r);
  return map;
}

/**
 * Zwraca set z id kontekstu + wszystkich jego potomkow (rekurencyjnie).
 */
function collectDescendantIds(
  rootId: string,
  all: Map<string, { parentId: string | null }>
): Set<string> {
  // Zbuduj odwrocona mape: parent -> children[]
  const childrenByParent = new Map<string, string[]>();
  for (const [id, node] of all.entries()) {
    const p = node.parentId;
    if (p) {
      if (!childrenByParent.has(p)) childrenByParent.set(p, []);
      childrenByParent.get(p)!.push(id);
    }
  }
  const out = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    const kids = childrenByParent.get(id);
    if (kids) stack.push(...kids);
  }
  return out;
}

/**
 * Buduje breadcrumb: lista przodkow od korzenia do danego kontekstu (wlacznie).
 */
function buildBreadcrumb(
  id: string,
  all: Map<string, { id: string; name: string; color: string; parentId: string | null }>
): Array<{ id: string; name: string; color: string }> {
  const path: Array<{ id: string; name: string; color: string }> = [];
  let cur: string | null = id;
  while (cur) {
    const node = all.get(cur);
    if (!node) break;
    path.unshift({ id: node.id, name: node.name, color: node.color });
    cur = node.parentId;
  }
  return path;
}

/**
 * Dashboard pojedynczego kontekstu — agregacja „w gore":
 * wlasne elementy + elementy wszystkich potomkow.
 */
export async function getContextDashboard(
  contextId: string
): Promise<DashboardData | null> {
  const all = await loadAllContexts();
  const self = all.get(contextId);
  if (!self) return null;

  const ids = collectDescendantIds(contextId, all);
  const idList = Array.from(ids);
  const contextFilter = { contextId: { in: idList } };

  const [projects, tasks, ideas, problems] = await Promise.all([
    prisma.project.findMany({
      where: contextFilter,
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.task.findMany({
      where: { ...contextFilter, projectId: null },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    }),
    prisma.idea.findMany({
      where: contextFilter,
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.problem.findMany({
      where: contextFilter,
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  return {
    current: {
      id: self.id,
      name: self.name,
      color: self.color,
      breadcrumb: buildBreadcrumb(self.id, all),
    },
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      deadline: p.deadline,
      createdAt: p.createdAt,
      context: toOrigin(p.contextId),
    })),
    looseTasks: tasks
      .filter((t) => !t.done)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        deadline: t.deadline,
        priority: t.priority,
        createdAt: t.createdAt,
        context: toOrigin(t.contextId),
      })),
    doneTasks: tasks
      .filter((t) => t.done)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        deadline: t.deadline,
        priority: t.priority,
        createdAt: t.createdAt,
        context: toOrigin(t.contextId),
      })),
    ideas: ideas.map((i) => ({
      id: i.id,
      content: i.content,
      createdAt: i.createdAt,
      context: toOrigin(i.contextId),
    })),
    problems: problems.map((pr) => ({
      id: pr.id,
      content: pr.content,
      createdAt: pr.createdAt,
      context: toOrigin(pr.contextId),
    })),
  };
}

/**
 * Dashboard globalny — wszystkie elementy z calej aplikacji.
 * Kazdy element ma badge z nazwa kontekstu.
 */
export async function getGlobalDashboard(): Promise<DashboardData> {
  const all = await loadAllContexts();

  const [projects, tasks, ideas, problems] = await Promise.all([
    prisma.project.findMany({ orderBy: [{ createdAt: "desc" }] }),
    prisma.task.findMany({
      where: { projectId: null },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    }),
    prisma.idea.findMany({ orderBy: [{ createdAt: "desc" }] }),
    prisma.problem.findMany({ orderBy: [{ createdAt: "desc" }] }),
  ]);

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  return {
    current: null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      deadline: p.deadline,
      createdAt: p.createdAt,
      context: toOrigin(p.contextId),
    })),
    looseTasks: tasks
      .filter((t) => !t.done)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        deadline: t.deadline,
        priority: t.priority,
        createdAt: t.createdAt,
        context: toOrigin(t.contextId),
      })),
    doneTasks: tasks
      .filter((t) => t.done)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        deadline: t.deadline,
        priority: t.priority,
        createdAt: t.createdAt,
        context: toOrigin(t.contextId),
      })),
    ideas: ideas.map((i) => ({
      id: i.id,
      content: i.content,
      createdAt: i.createdAt,
      context: toOrigin(i.contextId),
    })),
    problems: problems.map((pr) => ({
      id: pr.id,
      content: pr.content,
      createdAt: pr.createdAt,
      context: toOrigin(pr.contextId),
    })),
  };
}
