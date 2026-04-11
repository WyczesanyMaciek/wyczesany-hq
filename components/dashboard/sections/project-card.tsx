"use client";

// ProjectCard — DS v1 klasy t-project-card, t-project-header, etc.

import { memo, useMemo } from "react";
import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardData } from "@/lib/queries/dashboard";
import { LinearAddTask } from "../linear-add-task";
import { TaskRow } from "../shared/task-row";
import { formatDue } from "../shared/format";

export const ProjectCard = memo(function ProjectCard({
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

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: `project:${project.id}`, disabled: readOnly });
  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const taskItemIds = useMemo(
    () => project.tasks.map((t) => `task:${t.id}`),
    [project.tasks]
  );

  return (
    <div ref={setNodeRef} style={dndStyle} {...attributes} className="t-project-card">
      <div
        className="t-project-header"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".grip")) return;
          onToggle();
        }}
      >
        {readOnly ? (
          <span className="t-project-grip--hidden" aria-hidden="true" />
        ) : (
          <span
            className="t-project-grip"
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Przeciagnij projekt"
          >
            <GripVertical size={14} />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/c/${project.context.id}/p/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="t-project-name"
          >
            {project.name}
          </Link>{" "}
          {showContextBadge && (
            <span
              className="t-context-badge"
              style={{ background: `${project.context.color}22`, color: project.context.color }}
            >
              {project.context.name}
            </span>
          )}
        </div>
        <div className="t-project-meta">
          <div className="t-progress-bar">
            <div className="t-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="t-progress-text">
            {project.taskDone}/{project.taskTotal}
            {due ? ` · ${due.text}` : ""}
          </span>
        </div>
        <span className="t-collapse-icon">
          {collapsed ? "▸" : "▾"}
        </span>
      </div>
      {!collapsed ? (
        <div className="t-project-tasks">
          <SortableContext items={taskItemIds} strategy={verticalListSortingStrategy}>
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
});

function EmptyDropZone({ projectId, readOnly }: { projectId: string; readOnly: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `project:${projectId}`,
    disabled: readOnly,
  });

  return (
    <div
      ref={setNodeRef}
      className={`t-drop-zone${isOver ? " t-drop-zone--active" : ""}`}
    >
      {isOver ? "Upusc tutaj" : "Brak zadan"}
    </div>
  );
}
