"use client";

// TaskRow — pojedynczy wiersz taska w liscie Linear v2.
// Reusable: dashboard kontekstu, globalny dashboard, strona projektu (Etap 6).
// Przyjmuje dane + callbacki przez propy — nie zaklada kontekstu wywolania.
//
// DnD: uzywa useSortable z @dnd-kit. Musi byc renderowany w <SortableContext>.
// W trybie readOnly DnD jest wylaczony, grip ukryty.

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// GripVertical usuniety — DS v1 nie uzywa gripa w task row
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
import { TaskCheckbox } from "./task-checkbox";
import { formatDue, prioClass } from "./format";

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

  // DnD — sortowalny w ramach kontenera (projekt albo luzne), disabled w read-only
  const {
    attributes,
    listeners,
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
      style={dndStyle}
      {...attributes}
      className={`ltask ${task.done ? "done" : ""} ${selected ? "selected" : ""}`}
      onClick={() => {
        if (!editingName) onSelect(task.id);
      }}
    >
      {/* Kolumna 1: checkbox 18px */}
      <TaskCheckbox
        compact
        done={task.done}
        onToggle={handleToggle}
        disabled={pending || readOnly}
      />
      {/* Kolumna 2: priority dot 8px */}
      <span className={`prio ${prioClass(task.priority)}`} />
      {/* Kolumna 3: tytuł — flex-1, ellipsis */}
      {editingName ? (
        <input
          autoFocus
          defaultValue={task.title}
          disabled={pending}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => handleSaveName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              setEditingName(false);
            }
          }}
          style={{
            font: "inherit",
            fontSize: 14,
            fontWeight: 600,
            padding: "2px 6px",
            border: "1.5px solid var(--ds-accent)",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-surface)",
            minWidth: 0,
          }}
        />
      ) : (
        <span
          className="name"
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
              className="ctx"
              style={{
                background: `${task.context.color}22`,
                color: task.context.color,
                marginLeft: 6,
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: "var(--radius-full, 9999px)",
                fontWeight: 700,
              }}
            >
              {task.context.name}
            </span>
          )}
        </span>
      )}
      {/* Kolumna 4: deadline 80px */}
      <span className={`due ${due?.late ? "late" : ""}`}>{due?.text ?? ""}</span>
      {/* Kolumna 5: placeholder — 60px (przyszły status badge) */}
      <span />
      {/* Kolumna 6: avatar 28px */}
      <span className="who">{task.assigneeId ? (task.assigneeId[0] ?? "").toUpperCase() : ""}</span>
    </div>
  );
});
