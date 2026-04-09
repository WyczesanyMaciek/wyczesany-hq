"use client";

// LinearDashboard — nowy widok dashboardu w stylu Linear v2.
// Dwie kolumny: srodek (projekty / luzne taski / pomysly / problemy)
// + prawy panel szczegolow klikanego taska (320px).
// Zero DnD i zero edycji CRUD w tym etapie — to jest Etap 2.

import { useMemo, useState } from "react";
import type { DashboardData, DashboardTask } from "@/lib/queries/dashboard";

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
}: {
  task: DashboardTask | null;
  projectName: string | null;
}) {
  if (!task) {
    return (
      <div className="lright">
        <div className="lempty">Kliknij zadanie żeby zobaczyć szczegóły</div>
      </div>
    );
  }

  const due = formatDue(task.deadline);

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
        <h4>{task.title}</h4>
        <div className="dactions">
          <button className="primary">✓ {task.done ? "Zrobione" : "Oznacz jako zrobione"}</button>
          {task.projectId ? <button>↶ Zwolnij z projektu</button> : <button>→ Do projektu</button>}
          <button>⋯</button>
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
          <span className="v">
            {task.assigneeId ? (
              <>
                <span className="av">{task.assigneeId}</span>
                {task.assigneeId}
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="mrow">
          <label>Deadline</label>
          <span
            className="v"
            style={
              due?.late
                ? { color: "#b91c1c", fontWeight: 600 }
                : undefined
            }
          >
            {task.deadline ? formatDateLong(task.deadline) : "—"}
          </span>
        </div>
        <div className="mrow">
          <label>Priorytet</label>
          <span className="v">{prioLabel(task.priority)}</span>
        </div>
      </div>

      <div className="sect-h">Notatki</div>
      <div className="notes">
        {task.notes ?? <span style={{ color: "#94a3b8" }}>Brak notatek</span>}
      </div>

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
        {task.links.map((l) => (
          <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="ln">
            <span className="ic">🔗</span>
            {l.label}
            <span className="url">{new URL(l.url).hostname.replace("www.", "")}</span>
          </a>
        ))}
        <div className="add">+ Dodaj link</div>
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
        task={selected?.task ?? null}
        projectName={selected?.projectName ?? null}
      />
    </div>
  );
}
