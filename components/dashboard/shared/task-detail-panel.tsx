"use client";

// TaskDetailPanel — prawy panel szczegolow taska (320px).
// Edycja inline: tytul, deadline, priorytet, assignee, notatki.
// Przyciski: toggle done, usun, przenies do projektu / zwolnij.
// Sekcja linkow + sekcja zalacznikow (add/remove).
//
// Reusable: dashboard kontekstu, strona projektu (Etap 6).
// Przyjmuje task, projectName, liste dostepnych projektow i callback onDeleted.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { springSoft } from "@/lib/motion";
import {
  toggleTask,
  deleteTask,
  updateTaskDetails,
  moveTaskToProject,
  releaseTaskFromProject,
  addTaskLink,
  removeTaskLink,
  addTaskAttachment,
  removeTaskAttachment,
} from "@/app/(app)/c/[id]/actions";
import { toDateInput, formatDue, formatDateLong, prioLabel } from "./format";

export function TaskDetailPanel({
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
  const [addingAttachment, setAddingAttachment] = useState(false);
  const [attKind, setAttKind] = useState<"image" | "video" | "file">("image");
  const [attName, setAttName] = useState("");
  const [attUrl, setAttUrl] = useState("");
  // Reset edit state przy zmianie taska jest zalatwiony przez `key`
  // na TaskDetailPanel w rodzicu (React re-mountuje komponente).

  if (!task) {
    return (
      <div className="lright">
        <div className="lempty">Kliknij zadanie żeby zobaczyć szczegóły</div>
      </div>
    );
  }

  // Wrapper z animacja slide-in z prawej
  const MotionWrap = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springSoft}
    >
      {children}
    </motion.div>
  );

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

  const handleAddAttachment = () => {
    const id = task.id;
    const name = attName.trim();
    const url = attUrl.trim();
    if (!name || !url) return;
    startTransition(async () => {
      await addTaskAttachment(id, { kind: attKind, name, url });
      setAttName("");
      setAttUrl("");
      setAttKind("image");
      setAddingAttachment(false);
      router.refresh();
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!confirm("Usunac zalacznik?")) return;
    startTransition(async () => {
      await removeTaskAttachment(attId);
      router.refresh();
    });
  };

  return (
    <div className="lright">
      <MotionWrap>
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
          <div
            key={a.id}
            className={`tile ${a.kind === "video" ? "vid" : "img"}`}
            onClick={() => handleRemoveAttachment(a.id)}
            title="Kliknij zeby usunac"
            style={{ cursor: "pointer", position: "relative" }}
          >
            {a.kind === "video" ? "▶" : a.kind === "file" ? "📄" : "IMG"}
            <br />
            {a.name}
          </div>
        ))}
        <div
          className="tile add"
          onClick={() => setAddingAttachment(true)}
          style={{ cursor: "pointer" }}
        >
          + dodaj
        </div>
      </div>
      {addingAttachment ? (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            border: "1px solid var(--l-line)",
            borderRadius: 6,
            background: "var(--l-bg-soft)",
          }}
        >
          <select
            value={attKind}
            onChange={(e) =>
              setAttKind(e.target.value as "image" | "video" | "file")
            }
            disabled={pending}
            style={{
              font: "inherit",
              padding: "4px 6px",
              border: "1px solid var(--l-line)",
              borderRadius: 4,
              background: "#fff",
            }}
          >
            <option value="image">Zdjecie</option>
            <option value="video">Wideo</option>
            <option value="file">Plik</option>
          </select>
          <input
            placeholder="Nazwa"
            value={attName}
            onChange={(e) => setAttName(e.target.value)}
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
            placeholder="URL"
            value={attUrl}
            onChange={(e) => setAttUrl(e.target.value)}
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddAttachment();
              else if (e.key === "Escape") {
                setAddingAttachment(false);
                setAttName("");
                setAttUrl("");
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
              onClick={handleAddAttachment}
              disabled={pending || !attName.trim() || !attUrl.trim()}
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
                setAddingAttachment(false);
                setAttName("");
                setAttUrl("");
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
      ) : null}

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
      </MotionWrap>
    </div>
  );
}
