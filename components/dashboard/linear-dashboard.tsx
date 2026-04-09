"use client";

// LinearDashboard — widok dashboardu kontekstu w stylu Linear v2.
// Dwie kolumny: srodek (projekty / luzne taski / pomysly / problemy)
// + prawy panel szczegolow klikanego taska (320px).
// Interakcje CRUD podlaczone do server actions z /c/[id]/actions.ts.

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData, DashboardTask } from "@/lib/queries/dashboard";
import {
  toggleTask,
  deleteTask,
  updateTaskDetails,
  moveTaskToProject,
  releaseTaskFromProject,
  addTaskLink,
  removeTaskLink,
} from "@/app/(app)/c/[id]/actions";

// YYYY-MM-DD z Date, pod <input type="date">.
function toDateInput(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ============================================================
// Helpery formatujace
// ============================================================

// Krotki format daty po polsku: "9 kwi", "dziś", "jutro", "wczoraj", "zaległe".
function formatDue(d: Date | null): { text: string; late: boolean } | null {
  if (!d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: "zaległe", late: true };
  if (diff === 0) return { text: "dziś", late: true };
  if (diff === 1) return { text: "jutro", late: false };
  const months = [
    "sty",
    "lut",
    "mar",
    "kwi",
    "maj",
    "cze",
    "lip",
    "sie",
    "wrz",
    "paź",
    "lis",
    "gru",
  ];
  return { text: `${d.getDate()} ${months[d.getMonth()]}`, late: false };
}

// Dlugi format daty: "9 kwietnia".
function formatDateLong(d: Date | null): string {
  if (!d) return "—";
  const months = [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// Priorytet -> klasa CSS (hi/md/lo/""); 3 = wysoki, 2 = srodek, 1 = niski.
function prioClass(p: number): string {
  if (p >= 3) return "hi";
  if (p === 2) return "md";
  if (p === 1) return "lo";
  return "";
}

function prioLabel(p: number): string {
  if (p >= 3) return "Wysoki";
  if (p === 2) return "Średni";
  if (p === 1) return "Niski";
  return "Brak";
}

// ============================================================
// Komponenty prezentacyjne
// ============================================================

function TaskRow({
  task,
  selected,
  onSelect,
}: {
  task: DashboardTask;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const due = formatDue(task.deadline);
  return (
    <div
      className={`ltask ${task.done ? "done" : ""} ${selected ? "selected" : ""}`}
      onClick={() => onSelect(task.id)}
    >
      <span className="grip">⋮⋮</span>
      <span className="ck" />
      <span className="name">{task.title}</span>
      <span className={`due ${due?.late ? "late" : ""}`}>{due?.text ?? ""}</span>
      <span className={`prio ${prioClass(task.priority)}`}>
        <i />
        <i />
        <i />
      </span>
      <span className="who">{task.assigneeId ?? ""}</span>
    </div>
  );
}

function ProjectCard({
  project,
  collapsed,
  onToggle,
  selectedTaskId,
  onSelectTask,
}: {
  project: DashboardData["projects"][number];
  collapsed: boolean;
  onToggle: () => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}) {
  const percent =
    project.taskTotal > 0
      ? Math.round((project.taskDone / project.taskTotal) * 100)
      : 0;
  const due = formatDue(project.deadline);

  return (
    <div className="lprj">
      <div
        className="head"
        onClick={(e) => {
          // Klik w grip nie zwija
          if ((e.target as HTMLElement).classList.contains("grip")) return;
          onToggle();
        }}
      >
        <span className="grip">⋮⋮</span>
        <div>
          <b>{project.name}</b>{" "}
          <span
            className="ctx"
            style={{ background: `${project.context.color}22`, color: project.context.color }}
          >
            {project.context.name}
          </span>
        </div>
        <div className="meta">
          <div className="progbar">
            <i style={{ width: `${percent}%` }} />
          </div>
          {project.taskDone}/{project.taskTotal}
          {due ? ` · ${due.text}` : ""}
        </div>
        <span className="chev">{collapsed ? "▸" : "▾"}</span>
      </div>
      {!collapsed ? (
        <div className="body">
          {project.tasks.length === 0 ? (
            <div className="add-row">Brak zadań</div>
          ) : (
            project.tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                selected={selectedTaskId === t.id}
                onSelect={onSelectTask}
              />
            ))
          )}
          <div className="add-row">+ Dodaj zadanie</div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// Prawy panel — szczegoly taska
// ============================================================

function TaskDetailPanel({
  task,
  projectName,
  projects,
  onDeleted,
}: {
  task: DashboardTask | null;
  projectName: string | null;
  projects: Array<{ id: string; name: string }>;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<
    null | "title" | "deadline" | "priority" | "assignee"
  >(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  // Reset edit state przy zmianie taska jest zalatwiony przez `key`
  // na TaskDetailPanel w rodzicu (React re-mountuje komponente).

  if (!task) {
    return (
      <div className="lright">
        <div className="lempty">Kliknij zadanie żeby zobaczyć szczegóły</div>
      </div>
    );
  }

  const due = formatDue(task.deadline);

  const handleToggle = () => {
    const id = task.id;
    startTransition(async () => {
      await toggleTask(id);
      router.refresh();
    });
  };

  const handleDelete = () => {
    const id = task.id;
    if (!confirm("Usunac ten task? Akcji nie da sie cofnac.")) return;
    startTransition(async () => {
      await deleteTask(id);
      onDeleted();
      router.refresh();
    });
  };

  // Uniwersalny save: wywoluje updateTaskDetails i odswieza dane.
  const saveField = (
    patch: Parameters<typeof updateTaskDetails>[1]
  ) => {
    const id = task.id;
    startTransition(async () => {
      await updateTaskDetails(id, patch);
      setEditing(null);
      router.refresh();
    });
  };

  const handleMoveToProject = (projectId: string) => {
    const id = task.id;
    startTransition(async () => {
      await moveTaskToProject(id, projectId);
      setShowProjectMenu(false);
      router.refresh();
    });
  };

  const handleRelease = () => {
    const id = task.id;
    startTransition(async () => {
      await releaseTaskFromProject(id);
      router.refresh();
    });
  };

  const handleAddLink = () => {
    const id = task.id;
    const label = linkLabel.trim();
    const url = linkUrl.trim();
    if (!label || !url) return;
    startTransition(async () => {
      await addTaskLink(id, { label, url });
      setLinkLabel("");
      setLinkUrl("");
      setAddingLink(false);
      router.refresh();
    });
  };

  const handleRemoveLink = (linkId: string) => {
    startTransition(async () => {
      await removeTaskLink(linkId);
      router.refresh();
    });
  };

  return (
    <div className="lright">
      <div className="head">
        <div className="topline">
          ZADANIE ·{" "}
          <span className="path">
            {projectName ? `${projectName} / ` : ""}
            {task.context.name}
          </span>
        </div>
        {editing === "title" ? (
          <input
            autoFocus
            defaultValue={task.title}
            disabled={pending}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (v && v !== task.title) saveField({ title: v });
              else setEditing(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                setEditing(null);
              }
            }}
            className="edit-title"
            style={{
              width: "100%",
              font: "inherit",
              fontSize: 15,
              fontWeight: 600,
              padding: "4px 6px",
              border: "1px solid var(--l-accent)",
              borderRadius: 4,
              background: "#fff",
            }}
          />
        ) : (
          <h4
            onClick={() => setEditing("title")}
            style={{ cursor: "text" }}
            title="Kliknij zeby edytowac"
          >
            {task.title}
          </h4>
        )}
        <div className="dactions">
          <button
            className="primary"
            onClick={handleToggle}
            disabled={pending}
          >
            ✓ {task.done ? "Zrobione" : "Oznacz jako zrobione"}
          </button>
          {task.projectId ? (
            <button onClick={handleRelease} disabled={pending}>
              ↶ Zwolnij z projektu
            </button>
          ) : (
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={() => setShowProjectMenu((v) => !v)}
                disabled={pending || projects.length === 0}
                title={projects.length === 0 ? "Brak projektow" : "Wybierz projekt"}
              >
                → Do projektu
              </button>
              {showProjectMenu && projects.length > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid var(--l-line)",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    minWidth: 180,
                    maxHeight: 240,
                    overflow: "auto",
                    zIndex: 10,
                  }}
                >
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleMoveToProject(p.id)}
                      disabled={pending}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "6px 10px",
                        textAlign: "left",
                        background: "transparent",
                        border: 0,
                        font: "inherit",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--l-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={pending}
            title="Usun task"
          >
            🗑 Usuń
          </button>
        </div>
      </div>

      <div className="lmeta">
        {projectName ? (
          <div className="mrow">
            <label>Projekt</label>
            <span className="v">
              <span className="pill">{projectName}</span>
            </span>
          </div>
        ) : null}
        <div className="mrow">
          <label>Kontekst</label>
          <span className="v">
            <span
              className="pill"
              style={{
                background: `${task.context.color}22`,
                color: task.context.color,
              }}
            >
              {task.context.name}
            </span>
          </span>
        </div>
        <div className="mrow">
          <label>Przypisane</label>
          {editing === "assignee" ? (
            <input
              autoFocus
              defaultValue={task.assigneeId ?? ""}
              disabled={pending}
              placeholder="imie lub inicjaly"
              onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                const next = v || null;
                if (next !== (task.assigneeId ?? null)) {
                  saveField({ assigneeId: next });
                } else {
                  setEditing(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                else if (e.key === "Escape") setEditing(null);
              }}
              style={{
                font: "inherit",
                padding: "2px 6px",
                border: "1px solid var(--l-accent)",
                borderRadius: 4,
                background: "#fff",
                maxWidth: 160,
              }}
            />
          ) : (
            <span
              className="v"
              onClick={() => setEditing("assignee")}
              style={{ cursor: "text" }}
              title="Kliknij zeby edytowac"
            >
              {task.assigneeId ? (
                <>
                  <span className="av">{task.assigneeId}</span>
                  {task.assigneeId}
                </>
              ) : (
                "—"
              )}
            </span>
          )}
        </div>
        <div className="mrow">
          <label>Deadline</label>
          {editing === "deadline" ? (
            <input
              type="date"
              autoFocus
              defaultValue={toDateInput(task.deadline)}
              disabled={pending}
              onBlur={(e) => {
                const v = e.currentTarget.value; // "" albo YYYY-MM-DD
                const current = toDateInput(task.deadline);
                if (v !== current) {
                  saveField({ deadline: v ? v : null });
                } else {
                  setEditing(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(null);
              }}
              style={{
                font: "inherit",
                padding: "2px 6px",
                border: "1px solid var(--l-accent)",
                borderRadius: 4,
                background: "#fff",
              }}
            />
          ) : (
            <span
              className="v"
              onClick={() => setEditing("deadline")}
              style={{
                cursor: "text",
                ...(due?.late
                  ? { color: "#b91c1c", fontWeight: 600 }
                  : undefined),
              }}
              title="Kliknij zeby edytowac"
            >
              {task.deadline ? formatDateLong(task.deadline) : "—"}
            </span>
          )}
        </div>
        <div className="mrow">
          <label>Priorytet</label>
          {editing === "priority" ? (
            <select
              autoFocus
              defaultValue={String(task.priority)}
              disabled={pending}
              onBlur={() => setEditing(null)}
              onChange={(e) => {
                const v = Number(e.currentTarget.value);
                if (v !== task.priority) saveField({ priority: v });
                else setEditing(null);
              }}
              style={{
                font: "inherit",
                padding: "2px 6px",
                border: "1px solid var(--l-accent)",
                borderRadius: 4,
                background: "#fff",
              }}
            >
              <option value="0">Brak</option>
              <option value="1">Niski</option>
              <option value="2">Sredni</option>
              <option value="3">Wysoki</option>
            </select>
          ) : (
            <span
              className="v"
              onClick={() => setEditing("priority")}
              style={{ cursor: "pointer" }}
              title="Kliknij zeby zmienic"
            >
              {prioLabel(task.priority)}
            </span>
          )}
        </div>
      </div>

      <div className="sect-h">Notatki</div>
      <textarea
        className="notes"
        defaultValue={task.notes ?? ""}
        disabled={pending}
        placeholder="Brak notatek — kliknij zeby dopisac"
        onBlur={(e) => {
          const v = e.currentTarget.value;
          const current = task.notes ?? "";
          if (v !== current) {
            saveField({ notes: v.trim() ? v : null });
          }
        }}
        style={{
          width: "100%",
          minHeight: 80,
          font: "inherit",
          padding: "8px 10px",
          border: "1px solid var(--l-line)",
          borderRadius: 6,
          background: "#fff",
          resize: "vertical",
        }}
      />

      <div className="sect-h">Pliki i zdjęcia</div>
      <div className="files">
        {task.attachments.map((a) => (
          <div key={a.id} className={`tile ${a.kind === "video" ? "vid" : "img"}`}>
            {a.kind === "video" ? "▶" : "IMG"}
            <br />
            {a.name}
          </div>
        ))}
        <div className="tile add">+ dodaj</div>
      </div>

      <div className="sect-h">Linki</div>
      <div className="llinks">
        {task.links.map((l) => {
          let host = "";
          try {
            host = new URL(l.url).hostname.replace("www.", "");
          } catch {
            host = l.url;
          }
          return (
            <div
              key={l.id}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="ln"
                style={{ flex: 1 }}
              >
                <span className="ic">🔗</span>
                {l.label}
                <span className="url">{host}</span>
              </a>
              <button
                onClick={() => handleRemoveLink(l.id)}
                disabled={pending}
                title="Usun link"
                style={{
                  padding: "2px 6px",
                  border: "1px solid var(--l-line)",
                  background: "#fff",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--l-muted)",
                  font: "inherit",
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        {addingLink ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 6,
              border: "1px solid var(--l-line)",
              borderRadius: 6,
              background: "var(--l-bg-soft)",
            }}
          >
            <input
              autoFocus
              placeholder="Etykieta (np. Figma)"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              disabled={pending}
              style={{
                font: "inherit",
                padding: "4px 6px",
                border: "1px solid var(--l-line)",
                borderRadius: 4,
                background: "#fff",
              }}
            />
            <input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={pending}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddLink();
                else if (e.key === "Escape") {
                  setAddingLink(false);
                  setLinkLabel("");
                  setLinkUrl("");
                }
              }}
              style={{
                font: "inherit",
                padding: "4px 6px",
                border: "1px solid var(--l-line)",
                borderRadius: 4,
                background: "#fff",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleAddLink}
                disabled={pending || !linkLabel.trim() || !linkUrl.trim()}
                style={{
                  padding: "4px 10px",
                  background: "var(--l-accent)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                Dodaj
              </button>
              <button
                onClick={() => {
                  setAddingLink(false);
                  setLinkLabel("");
                  setLinkUrl("");
                }}
                style={{
                  padding: "4px 10px",
                  background: "#fff",
                  border: "1px solid var(--l-line)",
                  borderRadius: 4,
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingLink(true)}
            className="add"
            style={{
              background: "transparent",
              border: 0,
              font: "inherit",
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
              color: "var(--l-muted)",
            }}
          >
            + Dodaj link
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Root
// ============================================================

export function LinearDashboard({ data }: { data: DashboardData }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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
    for (const p of data.projects) {
      for (const t of p.tasks) {
        map.set(t.id, { task: t, projectName: p.name });
      }
    }
    for (const t of data.looseTasks) map.set(t.id, { task: t, projectName: null });
    for (const t of data.doneTasks) map.set(t.id, { task: t, projectName: null });
    return map;
  }, [data]);

  const selected = selectedTaskId ? taskMap.get(selectedTaskId) ?? null : null;

  const title = data.current?.name ?? "Wszystko";
  const color = data.current?.color ?? "#64748b";

  return (
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
          <span className="crumb">
            Konteksty / <b>{title}</b>
            <span
              className="pill-ctx"
              style={{ background: `${color}22`, color }}
            >
              ● {title}
            </span>
          </span>
          <div className="spacer">
            <button className="lbtn ghost">Filtry</button>
            <button className="lbtn ghost">+ Nowy projekt</button>
            <button className="lbtn">+ Nowy task</button>
          </div>
        </div>

        {/* ===== PROJEKTY ===== */}
        <div className="lsec">
          <h3>Projekty</h3>
          <span className="n">{data.projects.length}</span>
          <button className="add">+ dodaj projekt</button>
        </div>
        {data.projects.length === 0 ? (
          <div style={{ margin: "6px 12px", color: "#94a3b8", fontSize: 12.5 }}>
            Brak projektów
          </div>
        ) : (
          data.projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              collapsed={collapsed.has(p.id)}
              onToggle={() => toggleCollapse(p.id)}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
          ))
        )}

        {/* ===== LUZNE TASKI ===== */}
        <div className="lsec" style={{ marginTop: 22 }}>
          <h3>Luźne taski</h3>
          <span className="n">{data.looseTasks.length}</span>
          <button className="add">+ dodaj task</button>
        </div>
        {data.looseTasks.length === 0 ? (
          <div style={{ margin: "6px 12px", color: "#94a3b8", fontSize: 12.5 }}>
            Brak luźnych tasków
          </div>
        ) : (
          <div
            style={{
              margin: "0 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#fff",
              padding: "4px 6px",
            }}
          >
            {data.looseTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                selected={selectedTaskId === t.id}
                onSelect={setSelectedTaskId}
              />
            ))}
            <div className="add-row">+ Dodaj zadanie</div>
          </div>
        )}

        {/* ===== POMYSLY ===== */}
        <div className="lsec" style={{ marginTop: 22 }}>
          <h3>Pomysły</h3>
          <span className="n">{data.ideas.length}</span>
          <button className="add">+ dodaj pomysł</button>
        </div>
        {data.ideas.map((i) => (
          <div key={i.id} className="chip-row">
            <span className="icn i">💡</span>
            <div className="txt">
              {i.content}
              <div className="meta">{i.context.name}</div>
            </div>
          </div>
        ))}

        {/* ===== PROBLEMY ===== */}
        <div className="lsec" style={{ marginTop: 22 }}>
          <h3>Problemy</h3>
          <span className="n">{data.problems.length}</span>
          <button className="add">+ dodaj problem</button>
        </div>
        {data.problems.map((p) => (
          <div key={p.id} className="chip-row" style={{ marginBottom: 12 }}>
            <span className="icn p">!</span>
            <div className="txt">
              {p.content}
              <div className="meta">{p.context.name}</div>
            </div>
          </div>
        ))}

        {/* odstep na dole */}
        <div style={{ height: 40 }} />
      </main>

      {/* ============ PRAWY PANEL ============ */}
      <TaskDetailPanel
        key={selectedTaskId ?? "none"}
        task={selected?.task ?? null}
        projectName={selected?.projectName ?? null}
        projects={data.projects.map((p) => ({ id: p.id, name: p.name }))}
        onDeleted={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
