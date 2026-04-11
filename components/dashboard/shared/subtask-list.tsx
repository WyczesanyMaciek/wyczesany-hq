"use client";

// SubtaskList — checklista krokow wewnatrz taska.
// Toggle, inline edit, dodawanie, usuwanie.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import {
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtaskTitle,
} from "@/app/(app)/c/[id]/actions";
import type { SubtaskDTO } from "@/lib/queries/dashboard";

export function SubtaskList({
  taskId,
  subtasks,
}: {
  taskId: string;
  subtasks: SubtaskDTO[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const addRef = useRef<HTMLInputElement>(null);

  const doneCount = subtasks.filter((s) => s.done).length;

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await toggleSubtask(id);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSubtask(id);
      router.refresh();
    });
  };

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    startTransition(async () => {
      await addSubtask(taskId, t);
      setNewTitle("");
      router.refresh();
      setTimeout(() => addRef.current?.focus(), 0);
    });
  };

  const handleRename = (id: string, title: string) => {
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      await updateSubtaskTitle(id, t);
      router.refresh();
    });
  };

  return (
    <div className="t-panel-section">
      <div className="t-panel-section-header">
        <span>Kroki</span>
        <span className="t-subtask-progress">
          {doneCount}/{subtasks.length}
        </span>
      </div>

      <div className="t-subtask-list">
        {subtasks.map((s) => (
          <SubtaskItem
            key={s.id}
            subtask={s}
            disabled={pending}
            onToggle={() => handleToggle(s.id)}
            onDelete={() => handleDelete(s.id)}
            onRename={(title) => handleRename(s.id, title)}
          />
        ))}

        {adding ? (
          <div className="t-subtask-item">
            <div className="t-subtask-checkbox" style={{ opacity: 0.3 }} />
            <input
              ref={addRef}
              className="t-subtask-input"
              placeholder="Nowy krok..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={pending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                } else if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              onBlur={() => {
                if (!newTitle.trim()) {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <button
            className="t-subtask-add"
            onClick={() => {
              setAdding(true);
              setTimeout(() => addRef.current?.focus(), 0);
            }}
          >
            <Plus size={12} /> Dodaj krok
          </button>
        )}
      </div>
    </div>
  );
}

function SubtaskItem({
  subtask,
  disabled,
  onToggle,
  onDelete,
  onRename,
}: {
  subtask: SubtaskDTO;
  disabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="t-subtask-item">
      <button
        className={`t-subtask-checkbox${subtask.done ? " t-subtask-checkbox--done" : ""}`}
        onClick={onToggle}
        disabled={disabled}
      >
        {subtask.done && (
          <svg width="8" height="8" viewBox="0 0 10 10">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          className="t-subtask-input"
          defaultValue={subtask.title}
          disabled={disabled}
          autoFocus
          onBlur={(e) => {
            const v = e.currentTarget.value.trim();
            setEditing(false);
            if (v && v !== subtask.title) onRename(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            else if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span
          className={`t-subtask-title${subtask.done ? " t-subtask-title--done" : ""}`}
          onDoubleClick={() => setEditing(true)}
        >
          {subtask.title}
        </span>
      )}

      <button
        className="t-subtask-delete"
        onClick={onDelete}
        disabled={disabled}
        title="Usun krok"
      >
        <X size={12} />
      </button>
    </div>
  );
}
