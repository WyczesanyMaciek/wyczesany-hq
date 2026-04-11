"use client";

// ProjectView — pelny widok projektu (Etap 6).
// Dwie kolumny: srodek (taski + notatki + linki + placeholder historia)
// + prawy panel szczegolow klikanego taska (320px).
//
// Reusuje: TaskRow, TaskDetailPanel, LinearAddTask z dashboardu.
// DnD inline (ten sam pattern co LinearDashboard — bez wydzielania).

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ArrowLeft, FileText, Link2, MessageSquare } from "lucide-react";
import type { ProjectDetail, DashboardTask } from "@/lib/queries/dashboard";
import {
  reorderTasks,
  updateProjectDetails,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
  createProjectLink,
  deleteProjectLink,
} from "@/app/(app)/c/[id]/actions";
import { TaskRow } from "./shared/task-row";
import { TaskDetailPanel } from "./shared/task-detail-panel";
import { LinearAddTask } from "./linear-add-task";
import { formatDue, toDateInput } from "./shared/format";

// ---- Sekcja notatek projektu ----

function NotesSection({
  notes,
  projectId,
}: {
  notes: ProjectDetail["notes"];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const content = newContent.trim();
    if (!content) return;
    startTransition(async () => {
      await createProjectNote(projectId, { content });
      setNewContent("");
      setAdding(false);
      router.refresh();
    });
  };

  const handleUpdate = (noteId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await updateProjectNote(noteId, { content: trimmed });
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = (noteId: string) => {
    if (!confirm("Usunac notatke?")) return;
    startTransition(async () => {
      await deleteProjectNote(noteId);
      router.refresh();
    });
  };

  return (
    <div className="t-section">
      <div className="t-section-header">
        <FileText size={14} style={{ opacity: 0.5 }} />
        <h3 className="t-section-title">Notatki</h3>
        <span className="t-section-counter">{notes.length}</span>
      </div>
      <div className="t-section--padded" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.map((n) => (
          <div key={n.id} className="t-note-card">
            {editingId === n.id ? (
              <textarea
                autoFocus
                className="t-note-card-textarea"
                defaultValue={n.content}
                disabled={pending}
                onBlur={(e) => {
                  const v = e.currentTarget.value.trim();
                  if (v && v !== n.content) handleUpdate(n.id, v);
                  else setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <div
                className="t-note-card-text"
                onClick={() => setEditingId(n.id)}
              >
                {n.content}
              </div>
            )}
            <button
              className="t-note-delete"
              onClick={() => handleDelete(n.id)}
              disabled={pending}
              title="Usun notatke"
            >
              ×
            </button>
          </div>
        ))}
        {adding ? (
          <div className="t-panel-inline-form">
            <textarea
              autoFocus
              placeholder="Tresc notatki..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={pending}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewContent("");
                }
              }}
              className="t-panel-edit-input"
              style={{ minHeight: 60, resize: "vertical" }}
            />
            <div className="t-panel-form-actions">
              <button
                className="t-btn-primary"
                onClick={handleAdd}
                disabled={pending || !newContent.trim()}
              >
                Dodaj
              </button>
              <button
                className="t-btn-secondary"
                onClick={() => { setAdding(false); setNewContent(""); }}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button className="t-btn-add-text" onClick={() => setAdding(true)}>
            + Dodaj notatke
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Sekcja linkow projektu ----

function LinksSection({
  links,
  projectId,
}: {
  links: ProjectDetail["links"];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    const l = label.trim();
    const u = url.trim();
    if (!l || !u) return;
    startTransition(async () => {
      await createProjectLink(projectId, { label: l, url: u });
      setLabel("");
      setUrl("");
      setAdding(false);
      router.refresh();
    });
  };

  const handleDelete = (linkId: string) => {
    startTransition(async () => {
      await deleteProjectLink(linkId);
      router.refresh();
    });
  };

  return (
    <div className="t-section">
      <div className="t-section-header">
        <Link2 size={14} style={{ opacity: 0.5 }} />
        <h3 className="t-section-title">Linki</h3>
        <span className="t-section-counter">{links.length}</span>
      </div>
      <div className="t-section--padded" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((l) => {
          let host = "";
          try { host = new URL(l.url).hostname.replace("www.", ""); }
          catch { host = l.url; }
          return (
            <div key={l.id} className="t-panel-link-row">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="t-panel-link"
              >
                <span style={{ opacity: 0.5 }}>🔗</span>
                {l.label}
                <span className="t-panel-link-host">{host}</span>
              </a>
              <button
                className="t-btn-sm"
                onClick={() => handleDelete(l.id)}
                disabled={pending}
                title="Usun link"
              >
                ×
              </button>
            </div>
          );
        })}
        {adding ? (
          <div className="t-panel-inline-form">
            <input
              autoFocus
              placeholder="Etykieta (np. Figma)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={pending}
              className="t-panel-edit-input"
            />
            <input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={pending}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                else if (e.key === "Escape") {
                  setAdding(false);
                  setLabel("");
                  setUrl("");
                }
              }}
              className="t-panel-edit-input"
            />
            <div className="t-panel-form-actions">
              <button
                className="t-btn-primary"
                onClick={handleAdd}
                disabled={pending || !label.trim() || !url.trim()}
              >
                Dodaj
              </button>
              <button
                className="t-btn-secondary"
                onClick={() => { setAdding(false); setLabel(""); setUrl(""); }}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button className="t-btn-add-text" onClick={() => setAdding(true)}>
            + Dodaj link
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Status label ----

const STATUS_LABELS: Record<string, string> = {
  todo: "Do zrobienia",
  in_progress: "W trakcie",
  done: "Zrobione",
  on_hold: "Wstrzymane",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "#64748b",
  in_progress: "#2563eb",
  done: "#16a34a",
  on_hold: "#d97706",
};

// ---- Glowny komponent ----

export function ProjectView({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState(project.tasks);
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    setTasks(project.tasks);
  }, [project]);

  const taskMap = useMemo(() => {
    const map = new Map<string, { task: DashboardTask; projectName: string | null }>();
    for (const t of tasks) {
      map.set(t.id, { task: t, projectName: project.name });
    }
    return map;
  }, [tasks, project.name]);

  const selected = selectedTaskId ? taskMap.get(selectedTaskId) ?? null : null;

  // Skroty klawiszowe
  const hotkeys = useMemo(() => ({
    Escape: () => setSelectedTaskId(null),
  }), []);
  useHotkeys(hotkeys);

  const percent = project.taskTotal > 0
    ? Math.round((project.taskDone / project.taskTotal) * 100)
    : 0;
  const due = formatDue(project.deadline);
  const color = project.context.color;

  // DnD — taski w ramach projektu
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const taskItemIds = useMemo(
    () => tasks.map((t) => `task:${t.id}`),
    [tasks]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    if (activeStr.startsWith("task:") && overStr.startsWith("task:")) {
      const fromIdx = tasks.findIndex((t) => `task:${t.id}` === activeStr);
      const toIdx = tasks.findIndex((t) => `task:${t.id}` === overStr);
      if (fromIdx < 0 || toIdx < 0) return;
      const next = arrayMove(tasks, fromIdx, toIdx);
      setTasks(next);
      startTransition(async () => {
        await reorderTasks(next.map((t) => t.id));
        router.refresh();
      });
    }
  };

  const handleStatusChange = (status: string) => {
    setEditingStatus(false);
    if (status === project.status) return;
    startTransition(async () => {
      await updateProjectDetails(project.id, { status });
      router.refresh();
    });
  };

  const activeTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

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
          <div className="t-project-bar">
            <Link
              href={`/c/${project.context.id}`}
              className="t-project-bar-back"
              title="Wróć do kontekstu"
            >
              <ArrowLeft size={14} />
            </Link>
            {project.breadcrumb.map((b, i) => (
              <span key={b.id}>
                {i > 0 && <span className="t-project-bar-sep">/</span>}
                <Link href={`/c/${b.id}`} className="t-project-bar-crumb">
                  {b.name}
                </Link>
              </span>
            ))}
            <span className="t-project-bar-sep">/</span>
            <b style={{ fontSize: 14 }}>{project.name}</b>
          </div>

          {/* Header projektu */}
          <div className="t-project-view-header">
            <h2 className="t-project-view-title">{project.name}</h2>

            {project.description && (
              <p className="t-project-view-desc">{project.description}</p>
            )}

            {/* Meta row */}
            <div className="t-project-view-meta">
              {/* Status */}
              <div style={{ position: "relative" }}>
                <button
                  className="t-status-btn"
                  onClick={() => setEditingStatus((v) => !v)}
                  style={{
                    background: `${STATUS_COLORS[project.status] ?? "#64748b"}15`,
                    color: STATUS_COLORS[project.status] ?? "#64748b",
                  }}
                >
                  {STATUS_LABELS[project.status] ?? project.status}
                </button>
                {editingStatus && (
                  <div className="t-status-dropdown">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        className={`t-status-dropdown-item${key === project.status ? " t-status-dropdown-item--active" : ""}`}
                        onClick={() => handleStatusChange(key)}
                        style={{ color: STATUS_COLORS[key] }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kontekst */}
              <span
                className="t-context-pill"
                style={{ background: `${color}22`, color }}
              >
                ● {project.context.name}
              </span>

              {/* Deadline */}
              {due && (
                <span className={`t-task-date${due.late ? " t-task-date--overdue" : ""}`}>
                  {due.text}
                </span>
              )}

              {/* Progress */}
              <div className="t-project-meta">
                <div className="t-progress-bar">
                  <div
                    className="t-progress-fill"
                    style={{
                      width: `${percent}%`,
                      background: percent === 100 ? "#16a34a" : color,
                    }}
                  />
                </div>
                <span className="t-progress-text">
                  {project.taskDone}/{project.taskTotal}
                </span>
              </div>
            </div>
          </div>

          {/* ---- Sekcja: Zadania ---- */}
          <div className="t-section">
            <div className="t-section-header">
              <h3 className="t-section-title">Zadania</h3>
              <span className="t-section-counter">{activeTasks.length}</span>
            </div>
            <SortableContext
              items={taskItemIds}
              strategy={verticalListSortingStrategy}
            >
              {activeTasks.length === 0 && doneTasks.length === 0 ? (
                <div className="t-placeholder">
                  Brak zadan — dodaj pierwsze ponizej
                </div>
              ) : (
                activeTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    selected={selectedTaskId === t.id}
                    onSelect={setSelectedTaskId}
                  />
                ))
              )}
            </SortableContext>
            <LinearAddTask projectId={project.id} />
          </div>

          {/* Zrobione taski (collapsed) */}
          {doneTasks.length > 0 && (
            <DoneTasksSection
              tasks={doneTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
          )}

          {/* ---- Notatki ---- */}
          <NotesSection notes={project.notes} projectId={project.id} />

          {/* ---- Linki ---- */}
          <LinksSection links={project.links} projectId={project.id} />

          {/* ---- Placeholder: Historia rozmow ---- */}
          <div className="t-section">
            <div className="t-section-header">
              <MessageSquare size={14} style={{ opacity: 0.5 }} />
              <h3 className="t-section-title">Historia rozmów</h3>
            </div>
            <div className="t-placeholder">
              Wbudowany czat z Claude — pojawi sie w Etapie 10.
            </div>
          </div>

          <div className="t-spacer" />
        </main>

        {/* ============ PRAWY PANEL ============ */}
        <TaskDetailPanel
          key={selectedTaskId ?? "none"}
          task={selected?.task ?? null}
          projectName={selected?.projectName ?? null}
          projects={[]}
          onDeleted={() => setSelectedTaskId(null)}
        />
      </div>
    </DndContext>
  );
}

// ---- Zrobione taski (zwijane) ----

function DoneTasksSection({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  tasks: DashboardTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="t-section">
      <div
        className="t-section-header"
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <h3 className="t-section-title">{expanded ? "▾" : "▸"} Zrobione</h3>
        <span className="t-section-counter">{tasks.length}</span>
      </div>
      {expanded &&
        tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            selected={selectedTaskId === t.id}
            onSelect={onSelectTask}
            readOnly
          />
        ))}
    </div>
  );
}
