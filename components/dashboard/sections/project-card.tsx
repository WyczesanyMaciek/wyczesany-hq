"use client";

// ProjectCard — karta projektu w sekcji Projekty dashboardu Linear v2.
// Naglowek z gripem, nazwa, badge kontekstu (opcjonalnie), progress bar,
// liczba taskow done/total, deadline, chevron zwijania.
// Body: SortableContext z taskami projektu + LinearAddTask.
//
// DnD: useSortable z prefiksem `project:${id}`. W trybie readOnly DnD wylaczony.

import { useMemo } from "react";
import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardData } from "@/lib/queries/dashboard";
import { LinearAddTask } from "../linear-add-task";
import { TaskRow } from "../shared/task-row";
import { formatDue } from "../shared/format";

export function ProjectCard({
  project,
  collapsed,
  onToggle,
  selectedTaskId,
  onSelectTask,
  readOnly = false,
  showContextBadge = false,
}: {
  project: DashboardData["projects"][number];
  collapsed: boolean;
  onToggle: () => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  readOnly?: boolean;
  showContextBadge?: boolean;
}) {
  const percent =
    project.taskTotal > 0
      ? Math.round((project.taskDone / project.taskTotal) * 100)
      : 0;
  const due = formatDue(project.deadline);

  // DnD — projekt sortowalny w ramach kontekstu, disabled w read-only
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `project:${project.id}`, disabled: readOnly });
  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Id taskow projektu jako `task:xxx` — dla wewnetrznego SortableContext
  const taskItemIds = useMemo(
    () => project.tasks.map((t) => `task:${t.id}`),
    [project.tasks]
  );

  return (
    <div ref={setNodeRef} style={dndStyle} {...attributes} className="lprj">
      <div
        className="head"
        onClick={(e) => {
          // Klik w grip nie zwija
          if ((e.target as HTMLElement).closest(".grip")) return;
          onToggle();
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
            aria-label="Przeciagnij projekt"
          >
            <GripVertical size={12} />
          </span>
        )}
        <div>
          <Link
            href={`/c/${project.context.id}/p/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
          >
            {project.name}
          </Link>{" "}
          {showContextBadge && (
            <span
              className="ctx"
              style={{
                background: `${project.context.color}22`,
                color: project.context.color,
              }}
            >
              {project.context.name}
            </span>
          )}
        </div>
        <div className="meta">
          <div className="progbar">
            <i style={{ width: `${percent}%` }} />
          </div>
          {project.taskDone}/{project.taskTotal}
          {due ? ` · ${due.text}` : ""}
        </div>
        <span className="chev">{collapsed ? "▸" : "▾"}</span>
      </div>
      {!collapsed ? (
        <div className="body">
          <SortableContext
            items={taskItemIds}
            strategy={verticalListSortingStrategy}
          >
            {project.tasks.length === 0 ? (
              <EmptyDropZone projectId={project.id} readOnly={readOnly} />
            ) : (
              project.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  selected={selectedTaskId === t.id}
                  onSelect={onSelectTask}
                  readOnly={readOnly}
                />
              ))
            )}
          </SortableContext>
          {!readOnly && <LinearAddTask projectId={project.id} />}
        </div>
      ) : null}
    </div>
  );
}

// Drop target dla pustego projektu — pozwala wrzucic task do projektu bez taskow.
function EmptyDropZone({ projectId, readOnly }: { projectId: string; readOnly: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `project:${projectId}`,
    disabled: readOnly,
  });

  return (
    <div
      ref={setNodeRef}
      className="add-row"
      style={{
        color: "var(--l-muted)",
        padding: "8px 10px",
        borderRadius: 4,
        border: isOver ? "1px dashed var(--l-accent, #5B3DF5)" : "1px dashed transparent",
        background: isOver ? "rgba(99,102,241,0.05)" : "transparent",
        transition: "all 150ms",
        minHeight: 32,
      }}
    >
      {isOver ? "Upusc tutaj" : "Brak zadan"}
    </div>
  );
}
