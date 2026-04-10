"use client";

// TaskRow — DS v1 Component Map.
// CSS Grid: 18px 8px 1fr 80px 60px 28px
// Hover: translateY(-1px) + border + shadow
// 6 kolumn: checkbox, priority dot, title (ellipsis), status badge, date, avatar

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
import { formatDue } from "./format";

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

  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task:${task.id}`, disabled: readOnly });
  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const id = task.id;
    startTransition(async () => {
      await toggleTask(id);
      router.refresh();
    });
  };

  const handleSaveName = (v: string) => {
    const title = v.trim();
    setEditingName(false);
    if (!title || title === task.title) return;
    const id = task.id;
    startTransition(async () => {
      await updateTaskDetails(id, { title });
      router.refresh();
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`ltask${selected ? " selected" : ""}`}
      style={dndStyle}
      {...attributes}
      onClick={() => {
        if (!editingName) onSelect(task.id);
      }}
    >
      {/* Kolumna 1: Checkbox 18px */}
      <div
        onClick={handleToggle}
        style={{
          width: 18,
          height: 18,
          border: `2px solid ${task.done ? "#00B894" : "#D1CEC6"}`,
          borderRadius: 4,
          background: task.done ? "#00B894" : "transparent",
          cursor: readOnly ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 120ms ease",
          flexShrink: 0,
        }}
      >
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        )}
      </div>

      {/* Kolumna 2: Priority dot 8px */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background:
            task.priority >= 3
              ? "#E17055"
              : task.priority === 2
                ? "#FDCB6E"
                : task.priority === 1
                  ? "#74B9FF"
                  : "#E5E2DB",
          flexShrink: 0,
        }}
      />

      {/* Kolumna 3: Title 1fr — ELLIPSIS */}
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
            fontSize: 14,
            fontWeight: 600,
            padding: "2px 6px",
            border: "1.5px solid #6C5CE7",
            borderRadius: 6,
            background: "#FFFFFF",
            minWidth: 0,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            if (readOnly) return;
            e.stopPropagation();
            setEditingName(true);
          }}
          title={readOnly ? task.title : "Dwuklik zeby edytowac"}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: task.done ? "#9B9BAB" : "#1F1F2E",
            textDecoration: task.done ? "line-through" : "none",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
          {showContextBadge && (
            <span
              style={{
                background: `${task.context.color}22`,
                color: task.context.color,
                marginLeft: 6,
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 9999,
                fontWeight: 700,
              }}
            >
              {task.context.name}
            </span>
          )}
        </span>
      )}

      {/* Kolumna 4: Status badge 80px */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 10px",
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 9999,
          whiteSpace: "nowrap",
          justifySelf: "end",
          background: task.done ? "var(--status-success-light)" : "var(--bg-muted)",
          color: task.done ? "var(--status-success)" : "var(--text-secondary)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: task.done ? "var(--status-success)" : "var(--text-tertiary)",
          }}
        />
        {task.done ? "Zrobione" : "Do zrobienia"}
      </span>

      {/* Kolumna 5: Date 60px */}
      <span
        style={{
          fontSize: 12,
          textAlign: "right",
          whiteSpace: "nowrap",
          color: due?.late ? "#E17055" : "#9B9BAB",
          fontWeight: due?.late ? 700 : 400,
        }}
      >
        {due?.text ?? "—"}
      </span>

      {/* Kolumna 6: Avatar 28px */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9999,
          background: "#EDE9FC",
          color: "#6C5CE7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          justifySelf: "end",
        }}
      >
        {task.assigneeId ? task.assigneeId.slice(0, 2).toUpperCase() : ""}
      </div>
    </div>
  );
});
