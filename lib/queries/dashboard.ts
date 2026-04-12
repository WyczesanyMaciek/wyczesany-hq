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

export type TaskAttachmentDTO = {
  id: string;
  kind: string;
  url: string;
  name: string;
};

export type TaskLinkDTO = {
  id: string;
  label: string;
  url: string;
};

export type SubtaskDTO = {
  id: string;
  title: string;
  done: boolean;
  order: number;
};

export type DashboardTask = {
  id: string;
  title: string;
  done: boolean;
  deadline: Date | null;
  priority: number;
  order: number;
  assigneeId: string | null;
  notes: string | null;
  projectId: string | null;
  createdAt: Date;
  context: OriginContext;
  subtasks: SubtaskDTO[];
  attachments: TaskAttachmentDTO[];
  links: TaskLinkDTO[];
};

export type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  order: number;
  createdAt: Date;
  context: OriginContext;
  tasks: DashboardTask[]; // pelne taski projektu, posortowane po order
  taskTotal: number;
  taskDone: number;
};

export type DashboardItem = {
  id: string;
  content: string;
  description?: string | null;
  priority?: number;
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

// Prisma include dla taska z pelnymi szczegolami (subtaski + zalaczniki + linki).
const taskInclude = {
  subtasks: { orderBy: { order: "asc" as const } },
  attachments: { orderBy: { createdAt: "asc" as const } },
  links: { orderBy: { createdAt: "asc" as const } },
};

// Helper: surowy task z Prismy -> DashboardTask
type RawTask = {
  id: string;
  title: string;
  done: boolean;
  deadline: Date | null;
  priority: number;
  order: number;
  assigneeId: string | null;
  notes: string | null;
  projectId: string | null;
  createdAt: Date;
  contextId: string;
  subtasks: Array<{ id: string; title: string; done: boolean; order: number }>;
  attachments: Array<{ id: string; kind: string; url: string; name: string }>;
  links: Array<{ id: string; label: string; url: string }>;
};

function mapTask(t: RawTask, toOrigin: (cid: string) => OriginContext): DashboardTask {
  return {
    id: t.id,
    title: t.title,
    done: t.done,
    deadline: t.deadline,
    priority: t.priority,
    order: t.order,
    assigneeId: t.assigneeId,
    notes: t.notes,
    projectId: t.projectId,
    createdAt: t.createdAt,
    context: toOrigin(t.contextId),
    subtasks: t.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      done: s.done,
      order: s.order,
    })),
    attachments: t.attachments.map((a) => ({
      id: a.id,
      kind: a.kind,
      url: a.url,
      name: a.name,
    })),
    links: t.links.map((l) => ({ id: l.id, label: l.label, url: l.url })),
  };
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
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        tasks: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          include: taskInclude,
        },
      },
    }),
    prisma.task.findMany({
      where: { ...contextFilter, projectId: null },
      orderBy: [{ done: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      include: taskInclude,
    }),
    prisma.idea.findMany({
      where: contextFilter,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.problem.findMany({
      where: contextFilter,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
      order: p.order,
      createdAt: p.createdAt,
      context: toOrigin(p.contextId),
      tasks: p.tasks.map((t) => mapTask(t as RawTask, toOrigin)),
      taskTotal: p.tasks.length,
      taskDone: p.tasks.filter((t) => t.done).length,
    })),
    looseTasks: tasks
      .filter((t) => !t.done)
      .map((t) => mapTask(t as RawTask, toOrigin)),
    doneTasks: tasks
      .filter((t) => t.done)
      .map((t) => mapTask(t as RawTask, toOrigin)),
    ideas: ideas.map((i) => ({
      id: i.id,
      content: i.content,
      description: i.description,
      createdAt: i.createdAt,
      context: toOrigin(i.contextId),
    })),
    problems: problems.map((pr) => ({
      id: pr.id,
      content: pr.content,
      description: pr.description,
      priority: pr.priority,
      createdAt: pr.createdAt,
      context: toOrigin(pr.contextId),
    })),
  };
}

// =====================================================
// Typy dla strony projektu (Etap 6)
// =====================================================

export type ProjectNoteDTO = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectLinkDTO = {
  id: string;
  url: string;
  label: string;
  type: string;
  createdAt: Date;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  deadline: Date | null;
  createdAt: Date;
  context: OriginContext;
  breadcrumb: Array<{ id: string; name: string; color: string }>;
  tasks: DashboardTask[];
  taskTotal: number;
  taskDone: number;
  notes: ProjectNoteDTO[];
  links: ProjectLinkDTO[];
};

/**
 * Pelne dane projektu: metadane + taski + notatki + linki + breadcrumb kontekstu.
 * Uzywane na stronie /c/[id]/p/[projectId].
 */
export async function getProjectDetail(
  projectId: string
): Promise<ProjectDetail | null> {
  const all = await loadAllContexts();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        orderBy: [{ done: "asc" }, { order: "asc" }, { createdAt: "asc" }],
        include: taskInclude,
      },
      notes: {
        orderBy: [{ createdAt: "desc" }],
      },
      links: {
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });

  if (!project) return null;

  const ctx = all.get(project.contextId);
  const origin: OriginContext = ctx
    ? { id: ctx.id, name: ctx.name, color: ctx.color }
    : { id: project.contextId, name: "?", color: "#64748B" };

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    deadline: project.deadline,
    createdAt: project.createdAt,
    context: origin,
    breadcrumb: buildBreadcrumb(project.contextId, all),
    tasks: project.tasks.map((t) => mapTask(t as RawTask, toOrigin)),
    taskTotal: project.tasks.length,
    taskDone: project.tasks.filter((t) => t.done).length,
    notes: project.notes.map((n) => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    links: project.links.map((l) => ({
      id: l.id,
      url: l.url,
      label: l.label,
      type: l.type,
      createdAt: l.createdAt,
    })),
  };
}

/**
 * Globalne liczniki dla placeholder strony glownej /.
 * Cztery zapytania count() rownolegle — szybki szkielet bez ladowania
 * pelnych obiektow projektow/taskow/pomyslow/problemow.
 */
export async function getGlobalStats(): Promise<{
  projects: number;
  tasks: number;
  ideas: number;
  problems: number;
}> {
  const [projects, tasks, ideas, problems] = await Promise.all([
    prisma.project.count({
      where: { status: { notIn: ["done", "on_hold"] } },
    }),
    prisma.task.count({ where: { done: false } }),
    prisma.idea.count(),
    prisma.problem.count(),
  ]);
  return { projects, tasks, ideas, problems };
}

/**
 * Taski z deadline <= dzisiaj (niezakonczone). Overdue + today.
 */
export async function getOverdueTasks(): Promise<DashboardTask[]> {
  const all = await loadAllContexts();
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      done: false,
      deadline: { lte: now },
    },
    orderBy: [{ deadline: "asc" }, { priority: "desc" }],
    include: taskInclude,
  });

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  return tasks.map((t) => mapTask(t as RawTask, toOrigin));
}

/**
 * Taski pogrupowane po kontekscie — do widoku "Moje zadania".
 */
export async function getMyTasks(assignee?: string): Promise<{
  tasks: DashboardTask[];
  byContext: Map<string, DashboardTask[]>;
}> {
  const all = await loadAllContexts();

  const where: { done: boolean; assigneeId?: string } = { done: false };
  if (assignee) where.assigneeId = assignee;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ priority: "desc" }, { deadline: "asc" }, { order: "asc" }],
    include: taskInclude,
  });

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  const mapped = tasks.map((t) => mapTask(t as RawTask, toOrigin));
  const byContext = new Map<string, DashboardTask[]>();
  for (const t of mapped) {
    const key = t.context.id;
    if (!byContext.has(key)) byContext.set(key, []);
    byContext.get(key)!.push(t);
  }

  return { tasks: mapped, byContext };
}

/**
 * Problemy pilne (priorytet >= 2) ze wszystkich kontekstow.
 */
export async function getUrgentProblems(): Promise<DashboardItem[]> {
  const all = await loadAllContexts();

  const problems = await prisma.problem.findMany({
    where: { priority: { gte: 2 } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const toOrigin = (cid: string): OriginContext => {
    const c = all.get(cid);
    return c
      ? { id: c.id, name: c.name, color: c.color }
      : { id: cid, name: "?", color: "#64748B" };
  };

  return problems.map((pr) => ({
    id: pr.id,
    content: pr.content,
    description: pr.description,
    priority: pr.priority,
    createdAt: pr.createdAt,
    context: toOrigin(pr.contextId),
  }));
}
