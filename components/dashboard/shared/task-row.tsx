"use client";

// TaskRow — pojedynczy wiersz taska w liscie Linear v2.
// Reusable: dashboard kontekstu, globalny dashboard, strona projektu (Etap 6).
// Przyjmuje dane + callbacki przez propy — nie zaklada kontekstu wywolania.
//
// DnD: uzywa useSortable z @dnd-kit. Musi byc renderowany w <SortableContext>.
// W trybie readOnly DnD jest wylaczony, grip ukryty.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { toggleTask, updateTaskDetails } from "@/app/(app)/c/[id]/actions";
import { TaskCheckbox } from "./task-checkbox";
import { formatDue, prioClass } from "./format";

export function TaskRow({
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
      {readOnly ? (
        <span className="grip" style={{ opacity: 0 }} aria-hidden="true" />
      ) : (
        <span
          className="grip"
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: "grab", display: "flex", alignItems: "center" }}
          aria-label="Przeciagnij"
        >
          <GripVertical size={12} />
        </span>
      )}
      <TaskCheckbox
        compact
        done={task.done}
        onToggle={handleToggle}
        disabled={pending || readOnly}
      />
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
            padding: "2px 4px",
            border: "1px solid var(--l-accent)",
            borderRadius: 3,
            background: "#fff",
            minWidth: 0,
            flex: 1,
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
              }}
            >
              {task.context.name}
            </span>
          )}
        </span>
      )}
      <span className={`due ${due?.late ? "late" : ""}`}>{due?.text ?? ""}</span>
      <span className={`prio ${prioClass(task.priority)}`}>
        <i />
        <i />
        <i />
      </span>
      <span className="who">{task.assigneeId ?? ""}</span>
    </div>
  );
}
