"use client";

// TasksSection — sekcja "Luzne taski" dashboardu Linear v2.
// Naglowek + liczba + SortableContext z TaskRow + LinearAddTask na dole.
//
// Dane przez propy. Na dashboardzie kontekstu + globalnym.

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DashboardTask } from "@/lib/queries/dashboard";
import { LinearAddTask } from "../linear-add-task";
import { TaskRow } from "../shared/task-row";

export function TasksSection({
  looseTasks,
  selectedTaskId,
  onSelectTask,
  contextId,
  readOnly = false,
  isGlobal = false,
  currentContextId,
}: {
  looseTasks: DashboardTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  /** ID kontekstu do dodawania luznego taska (null = brak guzika). */
  contextId: string | null;
  readOnly?: boolean;
  isGlobal?: boolean;
  currentContextId: string | null;
}) {
  const looseSortItems = useMemo(
    () => looseTasks.map((t) => `task:${t.id}`),
    [looseTasks]
  );

  // Ukryj caly kontener jesli nie mamy kontekstu do dodawania i lista pusta
  if (!contextId && looseTasks.length === 0) return null;

  return (
    <>
      <div className="t-section-header">
        <h3 className="t-section-title">Luźne taski</h3>
        <span className="t-section-counter">{looseTasks.length}</span>
      </div>
      <div className="t-task-list-wrapper">
        <SortableContext
          items={looseSortItems}
          strategy={verticalListSortingStrategy}
        >
          {looseTasks.length === 0 ? (
            <LooseDropZone readOnly={readOnly} />
          ) : (
            looseTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                selected={selectedTaskId === t.id}
                onSelect={onSelectTask}
                readOnly={readOnly}
                showContextBadge={isGlobal || t.context.id !== currentContextId}
              />
            ))
          )}
        </SortableContext>
        {!readOnly && contextId ? (
          <LinearAddTask contextId={contextId} label="+ Dodaj zadanie" />
        ) : null}
      </div>
    </>
  );
}

// Drop target dla pustej sekcji luznych taskow.
function LooseDropZone({ readOnly }: { readOnly: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "loose",
    disabled: readOnly,
  });

  return (
    <div
      ref={setNodeRef}
      className={`t-drop-zone${isOver ? " t-drop-zone--active" : ""}`}
    >
      {isOver ? "Upusc tutaj" : "Brak luznych taskow"}
    </div>
  );
}
