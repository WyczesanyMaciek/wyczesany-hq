"use client";

// Client side akcji debug — formularze + przyciski wywolujace
// server actions z /c/[id]/actions.ts.

import { useState, useTransition } from "react";
import {
  reorderTasks,
  moveTaskToProject,
  releaseTaskFromProject,
  updateTaskDetails,
  toggleTaskDone,
  deleteTask,
  addTaskLink,
  removeTaskLink,
  addTaskAttachment,
  removeTaskAttachment,
  reorderProjects,
  moveProjectToContext,
} from "@/app/(app)/c/[id]/actions";

type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  order: number;
  priority: number;
  assigneeId: string | null;
  notes: string | null;
  contextName: string;
  projectName: string | null;
  projectId: string | null;
  linksCount: number;
  attachmentsCount: number;
};

type ProjectRow = {
  id: string;
  name: string;
  order: number;
  contextId: string;
  contextName: string;
};

type ContextRow = { id: string; name: string; color: string };

export function ActionsTestClient({
  tasks,
  projects,
  contexts,
}: {
  tasks: TaskRow[];
  projects: ProjectRow[];
  contexts: ContextRow[];
}) {
  const [log, setLog] = useState<string[]>([]);
  const [pending, start] = useTransition();

  const run = (label: string, fn: () => Promise<unknown>) => {
    start(async () => {
      const r = await fn();
      const line = `${new Date().toLocaleTimeString()} · ${label} → ${JSON.stringify(
        r
      )}`;
      console.log(line);
      setLog((l) => [line, ...l].slice(0, 20));
    });
  };

  const firstTask = tasks[0];
  const firstProject = projects[0];

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1100 }}>
      {/* LOG */}
      <section
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          padding: 12,
          borderRadius: 8,
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          minHeight: 80,
          maxHeight: 220,
          overflow: "auto",
        }}
      >
        <div style={{ opacity: 0.6, marginBottom: 4 }}>
          log {pending ? "(pending...)" : ""}
        </div>
        {log.length === 0 ? (
          <div style={{ opacity: 0.4 }}>brak wynikow</div>
        ) : (
          log.map((l, i) => (
            <div key={i} style={{ whiteSpace: "pre-wrap" }}>
              {l}
            </div>
          ))
        )}
      </section>

      {/* TASKS */}
      <section>
        <h3>Taski ({tasks.length})</h3>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f3f4f6" }}>
              <th style={th}>tytul</th>
              <th style={th}>ctx</th>
              <th style={th}>proj</th>
              <th style={th}>ord</th>
              <th style={th}>prio</th>
              <th style={th}>who</th>
              <th style={th}>L/A</th>
              <th style={th}>akcje</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={td}>
                  {t.done ? "✓ " : ""}
                  {t.title}
                </td>
                <td style={td}>{t.contextName}</td>
                <td style={td}>{t.projectName ?? "—"}</td>
                <td style={td}>{t.order}</td>
                <td style={td}>{t.priority}</td>
                <td style={td}>{t.assigneeId ?? "—"}</td>
                <td style={td}>
                  {t.linksCount}/{t.attachmentsCount}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <button
                    style={btn}
                    onClick={() => run(`toggleTaskDone(${t.id})`, () => toggleTaskDone(t.id))}
                  >
                    toggle
                  </button>
                  {t.projectId ? (
                    <button
                      style={btn}
                      onClick={() =>
                        run(`releaseTaskFromProject(${t.id})`, () =>
                          releaseTaskFromProject(t.id)
                        )
                      }
                    >
                      zwolnij
                    </button>
                  ) : (
                    <button
                      style={btn}
                      onClick={() => {
                        const pid = firstProject?.id;
                        if (!pid) return;
                        run(`moveTaskToProject(${t.id}, ${pid})`, () =>
                          moveTaskToProject(t.id, pid)
                        );
                      }}
                    >
                      → proj
                    </button>
                  )}
                  <button
                    style={btn}
                    onClick={() =>
                      run(`updateTaskDetails notes`, () =>
                        updateTaskDetails(t.id, {
                          notes: `test ${new Date().toLocaleTimeString()}`,
                        })
                      )
                    }
                  >
                    notes
                  </button>
                  <button
                    style={btn}
                    onClick={() =>
                      run(`addTaskLink(${t.id})`, () =>
                        addTaskLink(t.id, {
                          label: "test link",
                          url: "https://example.com",
                        })
                      )
                    }
                  >
                    +link
                  </button>
                  <button
                    style={btn}
                    onClick={() =>
                      run(`addTaskAttachment(${t.id})`, () =>
                        addTaskAttachment(t.id, {
                          kind: "image",
                          name: "test.jpg",
                          url: "https://placehold.co/200",
                        })
                      )
                    }
                  >
                    +att
                  </button>
                  <button
                    style={btnDanger}
                    onClick={() => run(`deleteTask(${t.id})`, () => deleteTask(t.id))}
                  >
                    del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* PROJECT REORDER */}
      <section>
        <h3>Projekty — reorder + move</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button
            style={btn}
            onClick={() => {
              const ids = [...projects].reverse().map((p) => p.id);
              run(`reorderProjects reverse`, () => reorderProjects(ids));
            }}
          >
            reorderProjects reverse
          </button>
          {firstProject && contexts[0] ? (
            <button
              style={btn}
              onClick={() =>
                run(
                  `moveProjectToContext(${firstProject.id}, ${contexts[0].id})`,
                  () => moveProjectToContext(firstProject.id, contexts[0].id)
                )
              }
            >
              przenies pierwszy projekt do {contexts[0].name}
            </button>
          ) : null}
        </div>
        <ul style={{ fontSize: 13 }}>
          {projects.map((p) => (
            <li key={p.id}>
              [{p.order}] <b>{p.name}</b> — {p.contextName}
            </li>
          ))}
        </ul>
      </section>

      {/* TASK REORDER */}
      <section>
        <h3>Reorder taskow pierwszego projektu (reverse)</h3>
        {firstProject ? (
          <button
            style={btn}
            onClick={() => {
              const ids = tasks
                .filter((t) => t.projectId === firstProject.id)
                .reverse()
                .map((t) => t.id);
              if (ids.length === 0) return;
              run(`reorderTasks reverse (${ids.length})`, () => reorderTasks(ids));
            }}
          >
            reorderTasks w {firstProject.name}
          </button>
        ) : null}
      </section>

      {/* LINKI / ATTACHMENTY cleanup */}
      <section>
        <h3>Czyszczenie linkow/zalacznikow</h3>
        {firstTask ? (
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Kliknij „+link&quot; / „+att&quot; wyzej. Zeby usunac pojedynczy rekord — uruchom
            removeTaskLink/removeTaskAttachment z konsoli (signature: (id)).
          </p>
        ) : null}
      </section>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "6px 8px",
  fontWeight: 600,
  borderBottom: "1px solid #e5e7eb",
};
const td: React.CSSProperties = {
  padding: "6px 8px",
};
const btn: React.CSSProperties = {
  fontSize: 11,
  padding: "3px 8px",
  marginRight: 4,
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 4,
  cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  ...btn,
  borderColor: "#fca5a5",
  color: "#b91c1c",
};

// Re-export do testow z konsoli.
declare global {
  interface Window {
    __wqActions?: {
      removeTaskLink: typeof removeTaskLink;
      removeTaskAttachment: typeof removeTaskAttachment;
    };
  }
}
if (typeof window !== "undefined") {
  window.__wqActions = { removeTaskLink, removeTaskAttachment };
}
