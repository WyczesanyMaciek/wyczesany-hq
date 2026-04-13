"use client";

// ItemDetailPanel — prawy panel szczegolow pomyslu lub problemu.
// Edycja tytulu, notatki (description), priorytet (problemy), usun, konwertuj.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { DashboardItem } from "@/lib/queries/dashboard";
import { springSoft } from "@/lib/motion";
import {
  updateIdea,
  updateProblem,
  deleteIdea,
  deleteProblem,
  convertIdeaToTask,
  convertIdeaToProject,
  convertProblemToTask,
  convertProblemToProject,
} from "@/app/(app)/c/[id]/actions";

const prioLabels = ["Brak", "Niski", "Normalny", "Pilny"];

export function ItemDetailPanel({
  item,
  kind,
  onClosed,
}: {
  item: DashboardItem | null;
  kind: "idea" | "problem";
  onClosed: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingTitle, setEditingTitle] = useState(false);

  if (!item) {
    return (
      <div className="t-panel">
        <div className="t-placeholder" style={{ padding: "60px 20px", textAlign: "center" }}>
          Kliknij {kind === "idea" ? "pomysł" : "problem"} żeby zobaczyć szczegóły
        </div>
      </div>
    );
  }

  const icon = kind === "idea" ? "💡" : "⚠";
  const label = kind === "idea" ? "Pomysł" : "Problem";
  const updateFn = kind === "idea" ? updateIdea : updateProblem;
  const deleteFn = kind === "idea" ? deleteIdea : deleteProblem;
  const convertToTaskFn = kind === "idea" ? convertIdeaToTask : convertProblemToTask;
  const convertToProjectFn = kind === "idea" ? convertIdeaToProject : convertProblemToProject;

  const handleSaveTitle = (v: string) => {
    const content = v.trim();
    setEditingTitle(false);
    if (!content || content === item.content) return;
    startTransition(async () => {
      await updateFn(item.id, { content });
      router.refresh();
    });
  };

  const handleSaveDescription = (v: string) => {
    const desc = v.trim() || null;
    if (desc === (item.description ?? null)) return;
    startTransition(async () => {
      await updateFn(item.id, { description: desc });
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(`Usunąć ten ${label.toLowerCase()}? Akcji nie da się cofnąć.`)) return;
    startTransition(async () => {
      await deleteFn(item.id);
      onClosed();
      router.refresh();
    });
  };

  const handleConvertToTask = () => {
    startTransition(async () => {
      await convertToTaskFn(item.id);
      onClosed();
      router.refresh();
    });
  };

  const handleConvertToProject = () => {
    startTransition(async () => {
      await convertToProjectFn(item.id);
      onClosed();
      router.refresh();
    });
  };

  const handleChangePriority = (val: number) => {
    if (kind !== "problem") return;
    startTransition(async () => {
      await updateProblem(item.id, { priority: val });
      router.refresh();
    });
  };

  return (
    <div className="t-panel">
      <div className="t-panel-tabs">
        <button className="t-panel-tab t-panel-tab--active">Szczegóły</button>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springSoft}
      >
        <div className="t-panel-header">
          <div className="t-panel-breadcrumb">
            <span>{icon} {label} · {item.context.name}</span>
          </div>

          {editingTitle ? (
            <input
              autoFocus
              defaultValue={item.content}
              disabled={pending}
              onBlur={(e) => handleSaveTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                else if (e.key === "Escape") setEditingTitle(false);
              }}
              className="t-panel-edit-input t-panel-edit-input--title"
            />
          ) : (
            <h4
              onClick={() => setEditingTitle(true)}
              className="t-panel-title--editable"
              title="Kliknij żeby edytować"
            >
              {item.content}
            </h4>
          )}

          {/* Chipy */}
          <div className="t-panel-chips">
            <span
              className="t-panel-chip"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
            >
              {icon} {label}
            </span>
            {kind === "problem" && (item.priority ?? 0) > 0 && (
              <span
                className="t-panel-chip"
                style={{
                  background: (item.priority ?? 0) >= 3 ? "var(--status-danger-light)" : (item.priority ?? 0) === 2 ? "var(--status-warning-light)" : "var(--status-info-light)",
                  color: (item.priority ?? 0) >= 3 ? "#C0533A" : (item.priority ?? 0) === 2 ? "#B8860B" : "#3A8FD6",
                }}
              >
                {prioLabels[item.priority ?? 0]}
              </span>
            )}
          </div>

          {/* Akcje */}
          <div className="t-panel-actions">
            <button className="t-btn-primary" onClick={handleConvertToTask} disabled={pending}>
              ✓ Zrób task
            </button>
            <button className="t-btn-ghost" onClick={handleConvertToProject} disabled={pending}>
              📋 Zrób projekt
            </button>
            <button className="t-btn-ghost" onClick={handleDelete} disabled={pending} title="Usuń">
              🗑 Usuń
            </button>
          </div>
        </div>

        {/* Pola */}
        <div>
          <div className="t-field-row">
            <label className="t-field-label">Kontekst</label>
            <span className="t-field-value">
              <span
                className="t-context-badge"
                style={{ background: `${item.context.color}22`, color: item.context.color }}
              >
                {item.context.name}
              </span>
            </span>
          </div>
          {kind === "problem" && (
            <div className="t-field-row">
              <label className="t-field-label">Priorytet</label>
              <select
                value={String(item.priority ?? 0)}
                onChange={(e) => handleChangePriority(Number(e.target.value))}
                disabled={pending}
                className="t-panel-edit-input"
              >
                <option value="0">Brak</option>
                <option value="1">Niski</option>
                <option value="2">Normalny</option>
                <option value="3">Pilny</option>
              </select>
            </div>
          )}
        </div>

        {/* Notatki */}
        {item.description ? (
          <>
            <div className="t-panel-section-header">Notatki</div>
            <textarea
              className="t-panel-notes"
              defaultValue={item.description}
              disabled={pending}
              onBlur={(e) => handleSaveDescription(e.currentTarget.value)}
            />
          </>
        ) : (
          <div className="t-panel-section-header">
            <span>Notatki</span>
            <button className="t-btn-add-text" onClick={() => {
              startTransition(async () => {
                await updateFn(item.id, { description: " " });
                router.refresh();
              });
            }}>
              + Dodaj
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
