"use client";

// QuickAddModal — szybkie dodawanie z klawiatury (N).
// Typy: Zadanie | Projekt | Pomysł | Problem.
// Enter = zapisz + zamknij, Shift+Enter = zapisz + wyczysc (zostan), Esc = zamknij.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  createTask,
  createProject,
  createIdea,
  createProblem,
} from "@/app/(app)/c/[id]/actions";

type ItemType = "task" | "project" | "idea" | "problem";

const TYPE_LABELS: Record<ItemType, string> = {
  task: "Zadanie",
  project: "Projekt",
  idea: "Pomysł",
  problem: "Problem",
};

type ContextOption = { id: string; name: string; color: string };
type ProjectOption = { id: string; name: string };

export function QuickAddModal({
  open,
  onClose,
  contexts,
  projects,
  defaultContextId,
}: {
  open: boolean;
  onClose: () => void;
  contexts: ContextOption[];
  projects: ProjectOption[];
  defaultContextId: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<ItemType>("task");
  const [title, setTitle] = useState("");
  const [contextId, setContextId] = useState(defaultContextId ?? contexts[0]?.id ?? "");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTitle("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset context when opening
  useEffect(() => {
    if (open && defaultContextId) {
      setContextId(defaultContextId);
    }
  }, [open, defaultContextId]);

  const submit = (keepOpen: boolean) => {
    const t = title.trim();
    if (!t) return;
    if (!contextId) {
      setError("Wybierz kontekst");
      return;
    }

    startTransition(async () => {
      let res: { ok: boolean; error?: string };

      switch (type) {
        case "task":
          res = await createTask({
            title: t,
            contextId,
            projectId: projectId || undefined,
          });
          break;
        case "project":
          res = await createProject(contextId, { name: t });
          break;
        case "idea":
          res = await createIdea(contextId, { content: t });
          break;
        case "problem":
          res = await createProblem(contextId, { content: t });
          break;
      }

      if (!res.ok) {
        setError(res.error ?? "Blad");
        return;
      }

      router.refresh();

      if (keepOpen) {
        setTitle("");
        setError(null);
        inputRef.current?.focus();
      } else {
        onClose();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      submit(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="t-quickadd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="t-quickadd"
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              className="t-quickadd-input"
              placeholder={
                type === "task"
                  ? "Co do zrobienia?"
                  : type === "project"
                    ? "Nazwa projektu..."
                    : type === "idea"
                      ? "Co chodzi Ci po glowie?"
                      : "Co blokuje?"
              }
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={pending}
            />

            <div className="t-quickadd-options">
              {/* Typ chipy */}
              {(Object.keys(TYPE_LABELS) as ItemType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`t-quickadd-chip${type === t ? " t-quickadd-chip--active" : ""}`}
                  onClick={() => setType(t)}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}

              <div className="t-quickadd-sep" />

              {/* Kontekst */}
              <select
                className="t-quickadd-select"
                value={contextId}
                onChange={(e) => {
                  setContextId(e.target.value);
                  setProjectId("");
                }}
              >
                {contexts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Projekt (tylko dla tasków) */}
              {type === "task" && projects.length > 0 && (
                <select
                  className="t-quickadd-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Luzny task</option>
                  {projects
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {error && (
              <div className="t-inline-error" style={{ padding: "0 20px 8px" }}>
                {error}
              </div>
            )}

            <div className="t-quickadd-footer">
              <span className="t-quickadd-hint">
                Enter = zapisz · Shift+Enter = zapisz i zostań �� Esc = zamknij
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
