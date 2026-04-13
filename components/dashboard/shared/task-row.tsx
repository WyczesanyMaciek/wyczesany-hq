"use client";

// TaskRow — CSS Grid 9 kolumn + popovery przez Portal
// Bugi UI naprawione: z-index, 1 popover naraz, hover blokada, portal rendering

import { memo, useState, useTransition, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
import { toggleSubtask, addSubtask, updateSubtaskTitle } from "@/app/(app)/c/[id]/actions";
import { formatDue } from "./format";

function prioEmoji(p: number) {
  if (p >= 3) return "🔥";
  if (p >= 1) return "🔘";
  return "🧊";
}

function prioLabel(p: number) {
  if (p >= 3) return "Pilne";
  if (p >= 1) return "Normalne";
  return "Niskie";
}

function badgeClass(done: boolean) {
  return done ? "t-badge t-badge--done" : "t-badge t-badge--todo";
}

type PopoverType = "priority" | "assignee" | "status" | "date" | null;

// Portal popover — renderowany do body, pozycjonowany absolutnie
function Popover({
  anchorRef,
  children,
  onClose,
  className = "",
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left + rect.width / 2,
    });
  }, [anchorRef]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className={`t-inline-popover ${className}`}
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}

export const TaskRow = memo(function TaskRow({
  task,
  selected,
  onSelect,
  readOnly = false,
  showContextBadge = false,
}: {
  task: DashboardTask;
  selected: boolean;
  onSelect: (id: string) => void;
  readOnly?: boolean;
  showContextBadge?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingName, setEditingName] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const due = formatDue(task.deadline);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasPopover = activePopover !== null;

  // Anchory dla popoverów
  const prioRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);

  const closePopover = useCallback(() => setActivePopover(null), []);

  const togglePopover = (type: PopoverType) => {
    setActivePopover(prev => prev === type ? null : type);
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `task:${task.id}`, disabled: readOnly });

  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    startTransition(async () => {
      await toggleTask(task.id);
      router.refresh();
    });
  };

  const saveField = (patch: Parameters<typeof updateTaskDetails>[1]) => {
    startTransition(async () => {
      await updateTaskDetails(task.id, patch);
      router.refresh();
    });
  };

  const handleSaveName = (v: string) => {
    const title = v.trim();
    setEditingName(false);
    if (!title || title === task.title) return;
    startTransition(async () => {
      await updateTaskDetails(task.id, { title });
      router.refresh();
    });
  };

  const rowClass = [
    "t-task-row",
    task.done ? "t-task-row--done" : "",
    selected ? "t-task-row--selected" : "",
    hasPopover ? "t-task-row--popover-open" : "",
  ].filter(Boolean).join(" ");

  const handleToggleSubtask = (subtaskId: string) => {
    startTransition(async () => {
      await toggleSubtask(subtaskId);
      router.refresh();
    });
  };

  const handleAddSubtask = (title: string) => {
    if (!title.trim()) return;
    startTransition(async () => {
      await addSubtask(task.id, title.trim());
      setAddingSubtask(false);
      router.refresh();
    });
  };

  return (
    <div ref={setNodeRef} style={dndStyle} {...attributes}>
      <div
        className={rowClass}
        onClick={() => { if (!editingName) onSelect(task.id); }}
      >
        {/* 1: Grip handle */}
        {readOnly ? (
          <span className="t-task-grip--hidden" />
        ) : (
          <span
            className="t-task-grip"
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Przeciągnij task"
          >
            <GripVertical size={14} />
          </span>
        )}

        {/* 2: Chevron */}
        {hasSubtasks ? (
          <button
            type="button"
            className="t-subtask-toggle"
            title="Rozwiń subtaski"
            onClick={(e) => { e.stopPropagation(); setSubtasksOpen(!subtasksOpen); }}
          >
            <ChevronRight size={12} style={{ transform: subtasksOpen ? "rotate(90deg)" : "none", transition: "transform 120ms ease" }} />
          </button>
        ) : !readOnly ? (
          <button
            type="button"
            className="t-subtask-add-chevron"
            onClick={(e) => { e.stopPropagation(); setSubtasksOpen(true); setAddingSubtask(true); }}
          >
            <Plus size={14} />
          </button>
        ) : <span />}

        {/* 3: Checkbox */}
        <button
          type="button"
          className={`t-task-checkbox${task.done ? " t-task-checkbox--done" : ""}`}
          onClick={handleToggle}
          disabled={pending || readOnly}
          aria-label={task.done ? "Cofnij" : "Zrobione"}
        >
          {task.done && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          )}
        </button>

        {/* 4: Nazwa */}
        <div className="t-task-name">
          {editingName ? (
            <input
              autoFocus
              defaultValue={task.title}
              disabled={pending}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => handleSaveName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                else if (e.key === "Escape") setEditingName(false);
              }}
              className="t-edit-inline"
            />
          ) : (
            <span
              className={`t-task-title${task.done ? " t-task-title--done" : ""}`}
              onDoubleClick={(e) => {
                if (readOnly) return;
                e.stopPropagation();
                setEditingName(true);
              }}
              title={readOnly ? task.title : "Dwuklik zeby edytowac"}
            >
              {task.title}
              {showContextBadge && (
                <span
                  className="t-context-badge"
                  style={{ background: `${task.context.color}22`, color: task.context.color, marginLeft: 6 }}
                >
                  {task.context.name}
                </span>
              )}
            </span>
          )}
        </div>

        {/* 5: Priority emoji */}
        <div className="t-task-col-center">
          <button
            ref={prioRef}
            type="button"
            className="t-task-inline-btn"
            onClick={(e) => { e.stopPropagation(); if (!readOnly) togglePopover("priority"); }}
            title={prioLabel(task.priority)}
          >
            {prioEmoji(task.priority)}
          </button>
        </div>

        {/* 6: Assignee */}
        <div className="t-task-col-center">
          <button
            ref={assigneeRef}
            type="button"
            className="t-task-inline-btn"
            onClick={(e) => { e.stopPropagation(); if (!readOnly) togglePopover("assignee"); }}
          >
            {task.assigneeId ? (
              <div className="t-avatar">{task.assigneeId.slice(0, 2).toUpperCase()}</div>
            ) : (
              <span className="t-task-empty">—</span>
            )}
          </button>
        </div>

        {/* 7: Status */}
        <div className="t-task-col-center">
          <button
            ref={statusRef}
            type="button"
            className="t-task-inline-btn"
            onClick={(e) => { e.stopPropagation(); if (!readOnly) togglePopover("status"); }}
          >
            <span className={badgeClass(task.done)}>
              <span className="t-badge-dot" />
              {task.done ? "Zrobione" : "Do zrobienia"}
            </span>
          </button>
        </div>

        {/* 8: Date */}
        <div className="t-task-col-center">
          <button
            ref={dateRef}
            type="button"
            className="t-task-inline-btn"
            onClick={(e) => { e.stopPropagation(); if (!readOnly) togglePopover("date"); }}
          >
            <span className={`t-task-date${due?.late ? " t-task-date--overdue" : ""}`}>
              {due?.text ?? "—"}
            </span>
          </button>
        </div>

        {/* 9: Subtask count */}
        <div className="t-task-col-center">
          {hasSubtasks ? (
            <span className="t-subtask-count" onClick={(e) => { e.stopPropagation(); setSubtasksOpen(!subtasksOpen); }}>
              {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
            </span>
          ) : (
            <span className="t-task-empty">—</span>
          )}
        </div>
      </div>

      {/* ===== PORTALED POPOVERS ===== */}

      {activePopover === "priority" && (
        <Popover anchorRef={prioRef} onClose={closePopover}>
          {([
            [3, "🔥", "Pilne"],
            [1, "🔘", "Normalne"],
            [0, "🧊", "Niskie"],
          ] as const).map(([val, emoji, label]) => (
            <button
              key={val}
              className={`t-inline-popover-item${(task.priority === val || (task.priority >= 3 && val === 3) || (task.priority >= 1 && task.priority < 3 && val === 1)) ? " t-inline-popover-item--active" : ""}`}
              onClick={() => { saveField({ priority: val }); closePopover(); }}
            >
              {emoji} {label}
            </button>
          ))}
        </Popover>
      )}

      {activePopover === "assignee" && (
        <Popover anchorRef={assigneeRef} onClose={closePopover}>
          <input
            autoFocus
            className="t-inline-popover-input"
            placeholder="Inicjały (np. MK)"
            defaultValue={task.assigneeId ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = e.currentTarget.value.trim() || null;
                saveField({ assigneeId: v });
                closePopover();
              } else if (e.key === "Escape") closePopover();
            }}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim() || null;
              if (v !== (task.assigneeId ?? null)) saveField({ assigneeId: v });
              closePopover();
            }}
          />
        </Popover>
      )}

      {activePopover === "status" && (
        <Popover anchorRef={statusRef} onClose={closePopover}>
          {([
            [false, "Do zrobienia"],
            [true, "Zrobione"],
          ] as const).map(([done, label]) => (
            <button
              key={String(done)}
              className={`t-inline-popover-item${task.done === done ? " t-inline-popover-item--active" : ""}`}
              onClick={() => {
                if (task.done !== done) {
                  startTransition(async () => {
                    await toggleTask(task.id);
                    router.refresh();
                  });
                }
                closePopover();
              }}
            >
              <span className={`t-badge-dot t-badge-dot--${done ? "done" : "todo"}`} /> {label}
            </button>
          ))}
        </Popover>
      )}

      {activePopover === "date" && (
        <Popover anchorRef={dateRef} onClose={closePopover} className="t-inline-popover--date">
          <input
            type="date"
            autoFocus
            defaultValue={task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const v = e.currentTarget.value;
              saveField({ deadline: v || null });
              closePopover();
            }}
            className="t-inline-popover-input"
          />
          {task.deadline && (
            <button
              className="t-inline-popover-item"
              onClick={() => { saveField({ deadline: null }); closePopover(); }}
            >
              ✕ Usuń datę
            </button>
          )}
        </Popover>
      )}

      {/* Inline subtaski */}
      {subtasksOpen && (hasSubtasks || addingSubtask) && (
        <div className="t-inline-subtasks">
          {task.subtasks.map((s, i) => (
            <SubtaskRow
              key={s.id}
              subtask={s}
              isLast={i === task.subtasks.length - 1}
              onToggle={() => handleToggleSubtask(s.id)}
              pending={pending}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && !addingSubtask && (
            <button className="t-inline-subtask-add" onClick={() => setAddingSubtask(true)}>
              + Dodaj krok
            </button>
          )}
          {addingSubtask && (
            <input
              autoFocus
              className="t-inline-subtask-input"
              placeholder="Nowy krok..."
              onBlur={(e) => { handleAddSubtask(e.currentTarget.value); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubtask(e.currentTarget.value);
                else if (e.key === "Escape") setAddingSubtask(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
});

function SubtaskRow({
  subtask,
  isLast,
  onToggle,
  pending,
  readOnly,
}: {
  subtask: { id: string; title: string; done: boolean };
  isLast: boolean;
  onToggle: () => void;
  pending: boolean;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  const handleSave = (v: string) => {
    const title = v.trim();
    setEditing(false);
    if (!title || title === subtask.title) return;
    startTransition(async () => {
      await updateSubtaskTitle(subtask.id, title);
      router.refresh();
    });
  };

  return (
    <div className="t-inline-subtask">
      <span className="t-inline-subtask-tree">{isLast ? "└" : "├"}</span>
      <button
        type="button"
        className={`t-subtask-checkbox${subtask.done ? " t-subtask-checkbox--done" : ""}`}
        onClick={onToggle}
        disabled={pending}
      />
      {editing ? (
        <input
          autoFocus
          defaultValue={subtask.title}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => handleSave(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            else if (e.key === "Escape") setEditing(false);
          }}
          className="t-edit-inline t-edit-inline--subtask"
        />
      ) : (
        <span
          className={`t-inline-subtask-title${subtask.done ? " t-inline-subtask-title--done" : ""}`}
          onDoubleClick={() => { if (!readOnly) setEditing(true); }}
          title={readOnly ? subtask.title : "Dwuklik żeby edytować"}
        >
          {subtask.title}
        </span>
      )}
    </div>
  );
}
