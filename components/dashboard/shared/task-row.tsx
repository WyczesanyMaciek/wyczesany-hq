"use client";

// TaskRow — DS v1 CSS classes (t-task-row, t-task-checkbox, etc.)
// Zero inline styles na layoutowych elementach. Dynamiczne wartości przez style={}.

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
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
  const due = formatDue(task.deadline);

  const { attributes, setNodeRef, transform, transition, isDragging } =
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

  return (
    <div
      ref={setNodeRef}
      className={rowClass}
      style={dndStyle}
      {...attributes}
      onClick={() => { if (!editingName) onSelect(task.id); }}
    >
      {/* 1: Checkbox */}
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

      {/* 2: Priority dot */}
      <div className={prioDotClass(task.priority)} />

      {/* 3: Title */}
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
          style={{
            fontSize: 14, fontWeight: 600, padding: "2px 6px",
            border: "1.5px solid var(--accent)", borderRadius: 6,
            background: "var(--bg-surface)", minWidth: 0,
            fontFamily: "inherit", outline: "none",
          }}
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

      {/* 4: Status badge */}
      <span className={badgeClass(task.done)}>
        <span className="t-badge-dot" />
        {task.done ? "Zrobione" : "Do zrobienia"}
      </span>

      {/* 5: Date */}
      <span className={`t-task-date${due?.late ? " t-task-date--overdue" : ""}`}>
        {due?.text ?? "—"}
      </span>

      {/* 6: Avatar */}
      <div className="t-avatar">
        {task.assigneeId ? task.assigneeId.slice(0, 2).toUpperCase() : ""}
      </div>
    </div>
  );
});
