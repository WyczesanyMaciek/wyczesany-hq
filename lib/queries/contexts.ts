// Wyczesany HQ — zapytania o drzewko kontekstow.
// Zwracaja dane w formie gotowej do renderowania sidebaru i listy ustawien.

import { prisma } from "@/lib/db";

export type ContextNode = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  children: ContextNode[];
  // Liczby zagregowane „w dol" (ten kontekst + wszystkie dzieci, wnuki...)
  projectCount: number;
  taskCount: number;
  // Liczby wlasne (tylko ten kontekst, bez dzieci) — przydatne przy usuwaniu
  ownProjectCount: number;
  ownTaskCount: number;
  ownIdeaCount: number;
  ownProblemCount: number;
  ownNoteCount: number;
  ownLinkCount: number;
};

type Raw = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  _count: {
    projects: number;
    tasks: number;
    ideas: number;
    problems: number;
    notes: number;
    links: number;
  };
};

/**
 * Pobiera wszystkie konteksty i zwraca je jako drzewko.
 * Liczby projektow/taskow sa agregowane w dol (rodzic sumuje dzieci).
 */
export async function getContextTree(): Promise<ContextNode[]> {
  const rows: Raw[] = await prisma.context.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
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

  // 1. Mapa id -> node (z pustymi children)
  const map = new Map<string, ContextNode>();
  for (const r of rows) {
    map.set(r.id, {
      id: r.id,
      name: r.name,
      color: r.color,
      icon: r.icon,
      parentId: r.parentId,
      order: r.order,
      children: [],
      projectCount: r._count.projects,
      taskCount: r._count.tasks,
      ownProjectCount: r._count.projects,
      ownTaskCount: r._count.tasks,
      ownIdeaCount: r._count.ideas,
      ownProblemCount: r._count.problems,
      ownNoteCount: r._count.notes,
      ownLinkCount: r._count.links,
    });
  }

  // 2. Podlacz dzieci do rodzicow, zbierz korzenie
  const roots: ContextNode[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 3. Posortuj dzieci po order
  const sortChildren = (node: ContextNode) => {
    node.children.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    node.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  roots.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  // 4. Agregacja „w gore" — rodzic sumuje wlasne + wszystkich potomkow.
  //    Robimy to rekurencyjnie (post-order).
  const aggregate = (node: ContextNode): { projects: number; tasks: number } => {
    let projects = node.ownProjectCount;
    let tasks = node.ownTaskCount;
    for (const child of node.children) {
      const sub = aggregate(child);
      projects += sub.projects;
      tasks += sub.tasks;
    }
    node.projectCount = projects;
    node.taskCount = tasks;
    return { projects, tasks };
  };
  roots.forEach(aggregate);

  return roots;
}

/**
 * Pobiera pojedynczy kontekst po id z wlasnymi licznikami (bez dzieci).
 * Uzywane przy usuwaniu zeby sprawdzic czy kontekst jest pusty.
 */
export async function getContextById(id: string) {
  return prisma.context.findUnique({
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
}

/**
 * Zwraca plaska liste kontekstow do uzycia w dropdownie rodzica
 * (z wcieciem i prefiksem depth).
 */
export async function getContextsFlat(): Promise<
  Array<{ id: string; name: string; depth: number; color: string }>
> {
  const tree = await getContextTree();
  const out: Array<{ id: string; name: string; depth: number; color: string }> = [];
  const walk = (nodes: ContextNode[], depth: number) => {
    for (const n of nodes) {
      out.push({ id: n.id, name: n.name, depth, color: n.color });
      walk(n.children, depth + 1);
    }
  };
  walk(tree, 0);
  return out;
}
