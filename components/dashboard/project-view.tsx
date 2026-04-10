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
    <div className="lsec">
      <div className="lsec-head">
        <FileText size={14} style={{ opacity: 0.5 }} />
        <span>Notatki</span>
        <span className="cnt">{notes.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
        {notes.map((n) => (
          <div
            key={n.id}
            style={{
              padding: "10px 12px",
              background: "var(--l-bg-soft, #fafafa)",
              borderRadius: 6,
              border: "1px solid var(--l-line, #e5e5e5)",
              position: "relative",
            }}
          >
            {editingId === n.id ? (
              <textarea
                autoFocus
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
                style={{
                  width: "100%",
                  minHeight: 60,
                  font: "inherit",
                  fontSize: 13,
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            ) : (
              <div
                onClick={() => setEditingId(n.id)}
                style={{
                  cursor: "text",
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {n.content}
              </div>
            )}
            <button
              onClick={() => handleDelete(n.id)}
              disabled={pending}
              title="Usun notatke"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                padding: "2px 6px",
                border: "1px solid var(--l-line, #e5e5e5)",
                background: "#fff",
                borderRadius: 4,
                cursor: "pointer",
                color: "var(--l-muted, #888)",
                font: "inherit",
                fontSize: 11,
                opacity: 0.6,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {adding ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: 8,
              border: "1px solid var(--l-line, #e5e5e5)",
              borderRadius: 6,
              background: "var(--l-bg-soft, #fafafa)",
            }}
          >
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
              style={{
                width: "100%",
                minHeight: 60,
                font: "inherit",
                fontSize: 13,
                padding: "6px 8px",
                border: "1px solid var(--l-line, #e5e5e5)",
                borderRadius: 4,
                background: "#fff",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleAdd}
                disabled={pending || !newContent.trim()}
                style={{
                  padding: "4px 10px",
                  background: "var(--accent)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13,
                }}
              >
                Dodaj
              </button>
              <button
                onClick={() => { setAdding(false); setNewContent(""); }}
                style={{
                  padding: "4px 10px",
                  background: "#fff",
                  border: "1px solid var(--l-line, #e5e5e5)",
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13,
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "transparent",
              border: 0,
              font: "inherit",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              padding: "4px 0",
              color: "var(--l-muted, #888)",
            }}
          >
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
    <div className="lsec">
      <div className="lsec-head">
        <Link2 size={14} style={{ opacity: 0.5 }} />
        <span>Linki</span>
        <span className="cnt">{links.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 16px" }}>
        {links.map((l) => {
          let host = "";
          try { host = new URL(l.url).hostname.replace("www.", ""); }
          catch { host = l.url; }
          return (
            <div
              key={l.id}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="ln"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 0",
                  fontSize: 13,
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                <span style={{ opacity: 0.5 }}>🔗</span>
                {l.label}
                <span style={{ color: "var(--l-muted, #888)", fontSize: 11 }}>
                  {host}
                </span>
              </a>
              <button
                onClick={() => handleDelete(l.id)}
                disabled={pending}
                title="Usun link"
                style={{
                  padding: "2px 6px",
                  border: "1px solid var(--l-line, #e5e5e5)",
                  background: "#fff",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--l-muted, #888)",
                  font: "inherit",
                  fontSize: 11,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        {adding ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 8,
              border: "1px solid var(--l-line, #e5e5e5)",
              borderRadius: 6,
              background: "var(--l-bg-soft, #fafafa)",
            }}
          >
            <input
              autoFocus
              placeholder="Etykieta (np. Figma)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={pending}
              style={{
                font: "inherit",
                fontSize: 13,
                padding: "4px 6px",
                border: "1px solid var(--l-line, #e5e5e5)",
                borderRadius: 4,
                background: "#fff",
              }}
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
              style={{
                font: "inherit",
                fontSize: 13,
                padding: "4px 6px",
                border: "1px solid var(--l-line, #e5e5e5)",
                borderRadius: 4,
                background: "#fff",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleAdd}
                disabled={pending || !label.trim() || !url.trim()}
                style={{
                  padding: "4px 10px",
                  background: "var(--accent)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13,
                }}
              >
                Dodaj
              </button>
              <button
                onClick={() => { setAdding(false); setLabel(""); setUrl(""); }}
                style={{
                  padding: "4px 10px",
                  background: "#fff",
                  border: "1px solid var(--l-line, #e5e5e5)",
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13,
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "transparent",
              border: 0,
              font: "inherit",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              padding: "4px 0",
              color: "var(--l-muted, #888)",
            }}
          >
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          minHeight: "100vh",
        }}
      >
        {/* ============ SRODEK ============ */}
        <main style={{ overflow: "auto", background: "#ffffff" }}>
          {/* Top bar */}
          <div className="lbar">
            <span className="crumb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link
                href={`/c/${project.context.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--l-muted, #888)",
                  textDecoration: "none",
                  fontSize: 13,
                }}
                title="Wróć do kontekstu"
              >
                <ArrowLeft size={14} />
              </Link>
              {project.breadcrumb.map((b, i) => (
                <span key={b.id}>
                  {i > 0 && <span style={{ margin: "0 2px", opacity: 0.4 }}>/</span>}
                  <Link
                    href={`/c/${b.id}`}
                    style={{ color: "var(--l-muted, #888)", textDecoration: "none", fontSize: 13 }}
                  >
                    {b.name}
                  </Link>
                </span>
              ))}
              <span style={{ margin: "0 2px", opacity: 0.4 }}>/</span>
              <b style={{ fontSize: 14 }}>{project.name}</b>
            </span>
          </div>

          {/* Header projektu */}
          <div style={{ padding: "20px 24px 16px" }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 8px",
              color: "var(--l-fg, #1f1f2e)",
            }}>
              {project.name}
            </h2>

            {project.description && (
              <p style={{
                fontSize: 14,
                color: "var(--l-muted, #888)",
                margin: "0 0 12px",
                lineHeight: 1.5,
              }}>
                {project.description}
              </p>
            )}

            {/* Meta row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 13,
            }}>
              {/* Status */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setEditingStatus((v) => !v)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 4,
                    border: "1px solid var(--l-line, #e5e5e5)",
                    background: `${STATUS_COLORS[project.status] ?? "#64748b"}15`,
                    color: STATUS_COLORS[project.status] ?? "#64748b",
                    fontWeight: 600,
                    font: "inherit",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {STATUS_LABELS[project.status] ?? project.status}
                </button>
                {editingStatus && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid var(--l-line, #e5e5e5)",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    minWidth: 140,
                    zIndex: 10,
                  }}>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "6px 10px",
                          textAlign: "left",
                          background: key === project.status ? "var(--l-hover, #f5f5f5)" : "transparent",
                          border: 0,
                          font: "inherit",
                          fontSize: 12,
                          cursor: "pointer",
                          color: STATUS_COLORS[key],
                          fontWeight: key === project.status ? 600 : 400,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--l-hover, #f5f5f5)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = key === project.status ? "var(--l-hover, #f5f5f5)" : "transparent"; }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kontekst */}
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: `${color}22`,
                  color,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                ● {project.context.name}
              </span>

              {/* Deadline */}
              {due && (
                <span style={{
                  fontSize: 12,
                  color: due.late ? "#b91c1c" : "var(--l-muted, #888)",
                  fontWeight: due.late ? 600 : 400,
                }}>
                  {due.text}
                </span>
              )}

              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  background: "var(--l-line, #e5e5e5)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: percent === 100 ? "#16a34a" : color,
                    borderRadius: 2,
                    transition: "width 200ms",
                  }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--l-muted, #888)" }}>
                  {project.taskDone}/{project.taskTotal}
                </span>
              </div>
            </div>
          </div>

          {/* ---- Sekcja: Zadania ---- */}
          <div className="lsec">
            <div className="lsec-head">
              <span>Zadania</span>
              <span className="cnt">{activeTasks.length}</span>
            </div>
            <SortableContext
              items={taskItemIds}
              strategy={verticalListSortingStrategy}
            >
              {activeTasks.length === 0 && doneTasks.length === 0 ? (
                <div style={{
                  padding: "12px 16px",
                  color: "var(--l-muted, #888)",
                  fontSize: 13,
                }}>
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
          <div className="lsec">
            <div className="lsec-head">
              <MessageSquare size={14} style={{ opacity: 0.5 }} />
              <span>Historia rozmów</span>
            </div>
            <div style={{
              padding: "16px",
              color: "var(--l-muted, #888)",
              fontSize: 13,
              fontStyle: "italic",
            }}>
              Wbudowany czat z Claude — pojawi sie w Etapie 10.
            </div>
          </div>

          <div style={{ height: 40 }} />
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
    <div className="lsec">
      <div
        className="lsec-head"
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <span>{expanded ? "▾" : "▸"} Zrobione</span>
        <span className="cnt">{tasks.length}</span>
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
