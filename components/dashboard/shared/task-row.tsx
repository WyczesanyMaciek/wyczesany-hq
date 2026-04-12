"use client";

// TaskRow — CSS Grid z fixed kolumnami (spec: tasker-task-row-grid.md)
// Grid: grip(24) chevron(20) checkbox(24) name(1fr) assignee(60) status(120) date(80) subtasks(50)

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
import { toggleSubtask, addSubtask, updateSubtaskTitle } from "@/app/(app)/c/[id]/actions";
import { formatDue } from "./format";

function prioDotClass(p: number) {
  if (p >= 3) return "t-priority-dot t-priority-dot--critical";
  if (p === 2) return "t-priority-dot t-priority-dot--high";
  if (p === 1) return "t-priority-dot t-priority-dot--medium";
  return "t-priority-dot t-priority-dot--low";
}

function badgeClass(done: boolean) {
  return done ? "t-badge t-badge--done" : "t-badge t-badge--todo";
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
  const due = formatDue(task.deadline);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

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

        {/* 2: Chevron (subtask expand) / + (add subtask on hover) */}
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

        {/* 4: Nazwa + priority dot */}
        <div className="t-task-name">
          <div className={prioDotClass(task.priority)} />
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

        {/* 5: Assignee */}
        <div className="t-task-col-center">
          {task.assigneeId ? (
            <div className="t-avatar">{task.assigneeId.slice(0, 2).toUpperCase()}</div>
          ) : (
            <span className="t-task-empty">—</span>
          )}
        </div>

        {/* 6: Status */}
        <div className="t-task-col-center">
          <span className={badgeClass(task.done)}>
            <span className="t-badge-dot" />
            {task.done ? "Zrobione" : "Do zrobienia"}
          </span>
        </div>

        {/* 7: Date */}
        <div className="t-task-col-center">
          <span className={`t-task-date${due?.late ? " t-task-date--overdue" : ""}`}>
            {due?.text ?? "—"}
          </span>
        </div>

        {/* 8: Subtask count */}
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
