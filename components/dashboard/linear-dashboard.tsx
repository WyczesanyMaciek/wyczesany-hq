"use client";

// LinearDashboard — widok dashboardu w stylu Linear v2.
// Dwie kolumny: srodek (sekcje: projekty, luzne taski, pomysly, problemy)
// + prawy panel szczegolow klikanego taska (320px).
//
// Orchestrator: trzyma state (selectedTaskId, collapsed, optimistic projects/tasks),
// owija w DndProvider, sklada sekcje i TaskDetailPanel. Caly DnD i logika
// renderowania sekcji siedza w ../sections i ../shared.
//
// Propy:
// - readOnly: wylacza edycje, DnD, guziki dodawania, chowa TaskDetailPanel.
// - isGlobal: naglowek bez breadcrumbu kontekstu, badge'y kontekstu zawsze widoczne.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData, DashboardTask } from "@/lib/queries/dashboard";
import { LinearNewProjectButton } from "./linear-new-project";
import { DndProvider } from "./shared/dnd/dnd-provider";
import { useDndHandlers } from "./shared/dnd/use-dnd-handlers";
import { TaskDetailPanel } from "./shared/task-detail-panel";
import { ProjectsSection } from "./sections/projects-section";
import { TasksSection } from "./sections/tasks-section";
import { IdeasSection } from "./sections/ideas-section";
import { ProblemsSection } from "./sections/problems-section";

export function LinearDashboard({
  data,
  readOnly = false,
  isGlobal = false,
}: {
  data: DashboardData;
  readOnly?: boolean;
  isGlobal?: boolean;
}) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const currentId = data.current?.id ?? null;

  // Optimistic state dla DnD — synchronizowany z `data` na zmiany servera
  const [projects, setProjects] = useState(data.projects);
  const [looseTasks, setLooseTasks] = useState(data.looseTasks);
  useEffect(() => {
    setProjects(data.projects);
    setLooseTasks(data.looseTasks);
  }, [data]);

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

  // W read-only klik w task → navigate do kontekstu taska zamiast panelu
  const handleSelectTask = (id: string) => {
    if (!readOnly) {
      setSelectedTaskId(id);
      return;
    }
    const t = taskMap.get(id)?.task;
    if (t) router.push(`/c/${t.context.id}`);
  };

  const title = isGlobal ? "Wszystko" : data.current?.name ?? "Wszystko";
  const color = data.current?.color ?? "#64748b";

  // DnD — caly handleDragEnd jest w hooku
  const { handleDragEnd } = useDndHandlers({
    projects,
    looseTasks,
    setProjects,
    setLooseTasks,
  });

  // W read-only DndProvider zostaje (zeby useSortable wewnatrz komponentow nie padl),
  // ale onDragEnd jest no-op (komponenty maja disabled: readOnly wewnatrz).
  const onDragEnd = readOnly ? () => {} : handleDragEnd;

  return (
    <DndProvider onDragEnd={onDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: readOnly ? "1fr" : "1fr 320px",
          minHeight: "100vh",
        }}
      >
        {/* ============ SRODEK ============ */}
        <main style={{ overflow: "auto", background: "#ffffff" }}>
          {/* Top bar */}
          <div className="lbar">
            <span className="crumb">
              {isGlobal ? (
                <b>{title}</b>
              ) : (
                <>
                  Konteksty / <b>{title}</b>
                  <span
                    className="pill-ctx"
                    style={{ background: `${color}22`, color }}
                  >
                    ● {title}
                  </span>
                </>
              )}
            </span>
            <div className="spacer">
              <button className="lbtn ghost">Filtry</button>
              {!readOnly && data.current ? (
                <LinearNewProjectButton
                  contextId={data.current.id}
                  variant="ghost"
                />
              ) : null}
            </div>
          </div>

          <ProjectsSection
            projects={projects}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            contextId={currentId}
            readOnly={readOnly}
            isGlobal={isGlobal}
            currentContextId={currentId}
          />

          <TasksSection
            looseTasks={looseTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            contextId={currentId}
            readOnly={readOnly}
            isGlobal={isGlobal}
            currentContextId={currentId}
          />

          <IdeasSection
            ideas={data.ideas}
            contextId={currentId}
            readOnly={readOnly}
          />

          <ProblemsSection
            problems={data.problems}
            contextId={currentId}
            readOnly={readOnly}
          />

          {/* odstep na dole */}
          <div style={{ height: 40 }} />
        </main>

        {/* ============ PRAWY PANEL ============ */}
        {!readOnly && (
          <TaskDetailPanel
            key={selectedTaskId ?? "none"}
            task={selected?.task ?? null}
            projectName={selected?.projectName ?? null}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            onDeleted={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </DndProvider>
  );
}
