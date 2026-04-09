"use client";

// useDndHandlers — hook z logika handleDragEnd dla DnD w stylu Linear v2.
// Obsluguje: reorder projektow, reorder taskow w kontenerze, cross-container
// move taskow (miedzy projektami i luznymi).
//
// Optimistic UI: zmiana lokalnego state'u natychmiast, potem server action,
// potem router.refresh() zeby zresynchronizowac z baza.
//
// Ten hook nie zna struktury UI — dostaje dane + settery przez argumenty.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { DashboardProject, DashboardTask } from "@/lib/queries/dashboard";
import {
  reorderTasks,
  reorderProjects,
  moveTaskToProject,
  releaseTaskFromProject,
} from "@/app/(app)/c/[id]/actions";

export function useDndHandlers({
  projects,
  looseTasks,
  setProjects,
  setLooseTasks,
}: {
  projects: DashboardProject[];
  looseTasks: DashboardTask[];
  setProjects: (next: DashboardProject[]) => void;
  setLooseTasks: (next: DashboardTask[]) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Znajdz kontener dla taska: "loose" albo "project:xxx"
  const findContainerForTask = (taskIdRaw: string): string | null => {
    for (const p of projects) {
      if (p.tasks.some((t) => t.id === taskIdRaw)) return `project:${p.id}`;
    }
    if (looseTasks.some((t) => t.id === taskIdRaw)) return "loose";
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    // --- Projekty ---
    if (activeStr.startsWith("project:") && overStr.startsWith("project:")) {
      const fromIdx = projects.findIndex((p) => `project:${p.id}` === activeStr);
      const toIdx = projects.findIndex((p) => `project:${p.id}` === overStr);
      if (fromIdx < 0 || toIdx < 0) return;
      const next = arrayMove(projects, fromIdx, toIdx);
      setProjects(next);
      startTransition(async () => {
        await reorderProjects(next.map((p) => p.id));
        router.refresh();
      });
      return;
    }

    // --- Taski ---
    if (activeStr.startsWith("task:")) {
      const taskId = activeStr.replace("task:", "");
      const fromContainer = findContainerForTask(taskId);
      if (!fromContainer) return;

      let toContainer: string | null = null;
      if (overStr.startsWith("task:")) {
        const overTaskId = overStr.replace("task:", "");
        toContainer = findContainerForTask(overTaskId);
      } else if (overStr.startsWith("project:")) {
        toContainer = overStr; // drop na projekt header = dodaj do tego projektu
      }
      if (!toContainer) return;

      if (fromContainer === toContainer) {
        // Reorder w ramach kontenera
        if (toContainer === "loose") {
          const fromIdx = looseTasks.findIndex((t) => t.id === taskId);
          const overTaskId = overStr.replace("task:", "");
          const toIdx = looseTasks.findIndex((t) => t.id === overTaskId);
          if (fromIdx < 0 || toIdx < 0) return;
          const next = arrayMove(looseTasks, fromIdx, toIdx);
          setLooseTasks(next);
          startTransition(async () => {
            await reorderTasks(next.map((t) => t.id));
            router.refresh();
          });
        } else {
          const projectId = toContainer.replace("project:", "");
          const project = projects.find((p) => p.id === projectId);
          if (!project) return;
          const fromIdx = project.tasks.findIndex((t) => t.id === taskId);
          const overTaskId = overStr.replace("task:", "");
          const toIdx = project.tasks.findIndex((t) => t.id === overTaskId);
          if (fromIdx < 0 || toIdx < 0) return;
          const nextTasks = arrayMove(project.tasks, fromIdx, toIdx);
          setProjects(
            projects.map((p) =>
              p.id === projectId ? { ...p, tasks: nextTasks } : p
            )
          );
          startTransition(async () => {
            await reorderTasks(nextTasks.map((t) => t.id));
            router.refresh();
          });
        }
      } else {
        // Cross-container — przenies task
        const target = toContainer;
        startTransition(async () => {
          if (target.startsWith("project:")) {
            const projectId = target.replace("project:", "");
            await moveTaskToProject(taskId, projectId);
          } else {
            await releaseTaskFromProject(taskId);
          }
          router.refresh();
        });
      }
    }
  };

  return { handleDragEnd };
}
