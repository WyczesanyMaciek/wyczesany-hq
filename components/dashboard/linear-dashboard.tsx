"use client";

// LinearDashboard — widok dashboardu kontekstu w stylu Linear v2.
// Dwie kolumny: srodek (sekcje: projekty, luzne taski, pomysly, problemy)
// + prawy panel szczegolow klikanego taska (320px).
//
// Orchestrator: trzyma state (selectedTaskId, collapsed, optimistic projects/tasks),
// renderuje DndContext + sekcje + TaskDetailPanel.
//
// UWAGA: DnD (DndContext, sensors, handleDragEnd) jest INLINE w tym pliku,
// nie wydzielone do `shared/dnd/`. Powod: dodatkowa warstwa komponentu
// DndProvider + custom hook useDndHandlers powodowaly regresje po refaktorze
// (commit 0161694) — wewnetrzny state TaskRow i ProjectCard (useTransition
// pending, useSortable transform) byl resetowany przy kazdym renderze
// orchestratora, co psulo: a) toggle checkboxa, b) drop taska (wracal).
// Pliki `shared/dnd/*` zostaly jako kandydaci do posprzatania w Etapie 7.

import { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@/lib/use-hotkeys";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { DashboardData, DashboardTask, DashboardItem } from "@/lib/queries/dashboard";
import {
  reorderTasks,
  reorderProjects,
  reorderIdeas,
  reorderProblems,
  moveTaskToProject,
  releaseTaskFromProject,
} from "@/app/(app)/c/[id]/actions";
import { LinearNewProjectButton } from "./linear-new-project";
import { TaskDetailPanel } from "./shared/task-detail-panel";
import { ItemDetailPanel } from "./shared/item-detail-panel";
import { ProjectsSection } from "./sections/projects-section";
import { TasksSection } from "./sections/tasks-section";
import { IdeasSection } from "./sections/ideas-section";
import { ProblemsSection } from "./sections/problems-section";

export function LinearDashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ id: string; kind: "idea" | "problem" } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [filterPriorities, setFilterPriorities] = useState<Set<number>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const currentId = data.current?.id ?? null;

  const toggleFilter = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    setter(next);
  };

  const hasActiveFilters = filterStatuses.size > 0 || filterPriorities.size > 0;
  const clearFilters = () => { setFilterStatuses(new Set()); setFilterPriorities(new Set()); };

  // Optimistic state dla DnD — synchronizowany z `data` na zmiany servera
  const [projects, setProjects] = useState(data.projects);
  const [looseTasks, setLooseTasks] = useState(data.looseTasks);
  const [ideas, setIdeas] = useState(data.ideas);
  const [problems, setProblems] = useState(data.problems);
  useEffect(() => {
    setProjects(data.projects);
    setLooseTasks(data.looseTasks);
    setIdeas(data.ideas);
    setProblems(data.problems);
  }, [data]);

  // Filtrowanie tasków po statusie i priorytecie
  const filterTask = useCallback((t: { done: boolean; priority: number }) => {
    if (filterStatuses.size > 0) {
      const status = t.done ? "done" : "todo";
      if (!filterStatuses.has(status)) return false;
    }
    if (filterPriorities.size > 0) {
      if (!filterPriorities.has(t.priority)) return false;
    }
    return true;
  }, [filterStatuses, filterPriorities]);

  const filteredProjects = useMemo(() =>
    projects.map(p => ({ ...p, tasks: p.tasks.filter(filterTask) })),
    [projects, filterTask]
  );
  const filteredLoose = useMemo(() => looseTasks.filter(filterTask), [looseTasks, filterTask]);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mapa wszystkich taskow: id -> { task, projectName }
  const taskMap = useMemo(() => {
    const map = new Map<string, { task: DashboardTask; projectName: string | null }>();
    for (const p of projects) {
      for (const t of p.tasks) {
        map.set(t.id, { task: t, projectName: p.name });
      }
    }
    for (const t of looseTasks) map.set(t.id, { task: t, projectName: null });
    for (const t of data.doneTasks) map.set(t.id, { task: t, projectName: null });
    return map;
  }, [projects, looseTasks, data.doneTasks]);

  const selected = selectedTaskId ? taskMap.get(selectedTaskId) ?? null : null;

  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id);
    setSelectedItem(null);
  };

  const handleSelectItem = (id: string, kind: "idea" | "problem") => {
    setSelectedItem({ id, kind });
    setSelectedTaskId(null);
  };

  // Znajdz wybrany pomysl/problem
  const selectedItemData: DashboardItem | null = selectedItem
    ? (selectedItem.kind === "idea"
        ? ideas.find(i => i.id === selectedItem.id)
        : problems.find(p => p.id === selectedItem.id)) ?? null
    : null;

  // Skroty klawiszowe
  const hotkeys = useMemo(() => ({
    Escape: () => { setSelectedTaskId(null); setSelectedItem(null); },
  }), []);
  useHotkeys(hotkeys);

  const title = data.current?.name ?? "Wszystko";
  const color = data.current?.color ?? "#64748b";

  // ===== DnD =====
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Znajdz kontener dla taska: "loose" albo "project:xxx"
  const findContainerForTask = (taskIdRaw: string): string | null => {
    for (const p of projects) {
      if (p.tasks.some((t) => t.id === taskIdRaw)) return `project:${p.id}`;
    }
    if (looseTasks.some((t) => t.id === taskIdRaw)) return "loose";
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    // --- Projekty ---
    if (activeStr.startsWith("project:") && overStr.startsWith("project:")) {
      const fromIdx = projects.findIndex((p) => `project:${p.id}` === activeStr);
      const toIdx = projects.findIndex((p) => `project:${p.id}` === overStr);
      if (fromIdx < 0 || toIdx < 0) return;
      const next = arrayMove(projects, fromIdx, toIdx);
      setProjects(next);
      startTransition(async () => {
        await reorderProjects(next.map((p) => p.id));
        router.refresh();
      });
      return;
    }

    // --- Pomysly ---
    if (activeStr.startsWith("idea:") && overStr.startsWith("idea:")) {
      const fromIdx = ideas.findIndex((i) => `idea:${i.id}` === activeStr);
      const toIdx = ideas.findIndex((i) => `idea:${i.id}` === overStr);
      if (fromIdx < 0 || toIdx < 0) return;
      const next = arrayMove(ideas, fromIdx, toIdx);
      setIdeas(next);
      startTransition(async () => {
        await reorderIdeas(next.map((i) => i.id));
        router.refresh();
      });
      return;
    }

    // --- Problemy ---
    if (activeStr.startsWith("problem:") && overStr.startsWith("problem:")) {
      const fromIdx = problems.findIndex((p) => `problem:${p.id}` === activeStr);
      const toIdx = problems.findIndex((p) => `problem:${p.id}` === overStr);
      if (fromIdx < 0 || toIdx < 0) return;
      const next = arrayMove(problems, fromIdx, toIdx);
      setProblems(next);
      startTransition(async () => {
        await reorderProblems(next.map((p) => p.id));
        router.refresh();
      });
      return;
    }

    // --- Taski ---
    if (activeStr.startsWith("task:")) {
      const taskId = activeStr.replace("task:", "");
      const fromContainer = findContainerForTask(taskId);
      if (!fromContainer) return;

      let toContainer: string | null = null;
      if (overStr.startsWith("task:")) {
        const overTaskId = overStr.replace("task:", "");
        toContainer = findContainerForTask(overTaskId);
      } else if (overStr.startsWith("project:")) {
        toContainer = overStr; // drop na projekt header = dodaj do tego projektu
      }
      if (!toContainer) return;

      if (fromContainer === toContainer) {
        // Reorder w ramach kontenera
        if (toContainer === "loose") {
          const fromIdx = looseTasks.findIndex((t) => t.id === taskId);
          const overTaskId = overStr.replace("task:", "");
          const toIdx = looseTasks.findIndex((t) => t.id === overTaskId);
          if (fromIdx < 0 || toIdx < 0) return;
          const next = arrayMove(looseTasks, fromIdx, toIdx);
          setLooseTasks(next);
          startTransition(async () => {
            await reorderTasks(next.map((t) => t.id));
            router.refresh();
          });
        } else {
          const projectId = toContainer.replace("project:", "");
          const project = projects.find((p) => p.id === projectId);
          if (!project) return;
          const fromIdx = project.tasks.findIndex((t) => t.id === taskId);
          const overTaskId = overStr.replace("task:", "");
          const toIdx = project.tasks.findIndex((t) => t.id === overTaskId);
          if (fromIdx < 0 || toIdx < 0) return;
          const nextTasks = arrayMove(project.tasks, fromIdx, toIdx);
          setProjects(
            projects.map((p) =>
              p.id === projectId ? { ...p, tasks: nextTasks } : p
            )
          );
          startTransition(async () => {
            await reorderTasks(nextTasks.map((t) => t.id));
            router.refresh();
          });
        }
      } else {
        // Cross-container — przenies task
        const target = toContainer;
        startTransition(async () => {
          if (target.startsWith("project:")) {
            const projectId = target.replace("project:", "");
            await moveTaskToProject(taskId, projectId);
          } else {
            await releaseTaskFromProject(taskId);
          }
          router.refresh();
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="t-main-grid">
        {/* ============ SRODEK ============ */}
        <main className="t-main-content">
          {/* Top bar */}
          <div className="t-content-header">
            <span className="t-breadcrumb">
              Konteksty / <b>{title}</b>
              <span
                className="t-context-pill"
                style={{ background: `${color}22`, color }}
              >
                ● {title}
              </span>
            </span>
            <div className="t-header-actions">
              {hasActiveFilters && (
                <button className="t-btn-ghost" onClick={clearFilters} style={{ fontSize: 12 }}>
                  ✕ Wyczyść
                </button>
              )}
              <div style={{ position: "relative" }}>
                <button className="t-btn-secondary" onClick={() => setShowFilterMenu(v => !v)}>
                  Filtry{hasActiveFilters ? ` (${filterStatuses.size + filterPriorities.size})` : ""}
                </button>
                {showFilterMenu && (
                  <div className="t-panel-dropdown" style={{ right: 0, left: "auto", minWidth: 200 }}>
                    <div className="t-filter-group-label">Status</div>
                    {([["todo", "Do zrobienia"], ["done", "Zrobione"]] as const).map(([val, label]) => (
                      <button
                        key={val}
                        className={`t-panel-dropdown-item${filterStatuses.has(val) ? " t-panel-dropdown-item--active" : ""}`}
                        onClick={() => toggleFilter(filterStatuses, val, setFilterStatuses)}
                      >
                        {filterStatuses.has(val) ? "☑" : "☐"} {label}
                      </button>
                    ))}
                    <div className="t-filter-group-label">Priorytet</div>
                    {([[3, "Pilny"], [2, "Wysoki"], [1, "Średni"], [0, "Niski"]] as const).map(([val, label]) => (
                      <button
                        key={val}
                        className={`t-panel-dropdown-item${filterPriorities.has(val) ? " t-panel-dropdown-item--active" : ""}`}
                        onClick={() => toggleFilter(filterPriorities, val, setFilterPriorities)}
                      >
                        {filterPriorities.has(val) ? "☑" : "☐"} {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {data.current ? (
                <LinearNewProjectButton
                  contextId={data.current.id}
                  variant="ghost"
                />
              ) : null}
            </div>
          </div>

          <ProjectsSection
            projects={filteredProjects}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            contextId={currentId}
            currentContextId={currentId}
          />

          <TasksSection
            looseTasks={filteredLoose}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            contextId={currentId}
            currentContextId={currentId}
          />

          <IdeasSection ideas={ideas} contextId={currentId} currentContextId={currentId} onSelectItem={(id) => handleSelectItem(id, "idea")} selectedItemId={selectedItem?.kind === "idea" ? selectedItem.id : null} />

          <ProblemsSection problems={problems} contextId={currentId} currentContextId={currentId} onSelectItem={(id) => handleSelectItem(id, "problem")} selectedItemId={selectedItem?.kind === "problem" ? selectedItem.id : null} />

          <div className="t-spacer" />
        </main>

        {/* ============ PRAWY PANEL ============ */}
        {selectedItem ? (
          <ItemDetailPanel
            key={`${selectedItem.kind}:${selectedItem.id}`}
            item={selectedItemData}
            kind={selectedItem.kind}
            onClosed={() => setSelectedItem(null)}
          />
        ) : (
          <TaskDetailPanel
            key={selectedTaskId ?? "none"}
            task={selected?.task ?? null}
            projectName={selected?.projectName ?? null}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            onDeleted={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </DndContext>
  );
}
