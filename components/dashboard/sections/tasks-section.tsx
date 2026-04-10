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
      <div className="lsec" style={{ marginTop: 22 }}>
        <h3>Luźne taski</h3>
        <span className="n">{looseTasks.length}</span>
      </div>
      <div
        style={{
          margin: "0 12px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          background: "#fff",
          padding: "4px 6px",
        }}
      >
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
      style={{
        padding: "8px 10px",
        color: "#94a3b8",
        fontSize: 12.5,
        borderRadius: 4,
        border: isOver ? "1px dashed var(--accent)" : "1px dashed transparent",
        background: isOver ? "rgba(99,102,241,0.05)" : "transparent",
        transition: "all 150ms",
        minHeight: 32,
      }}
    >
      {isOver ? "Upusc tutaj" : "Brak luznych taskow"}
    </div>
  );
}
