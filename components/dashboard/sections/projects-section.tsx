"use client";

// ProjectsSection — sekcja "Projekty" dashboardu Linear v2.
// Naglowek + liczba + guzik "+ Nowy projekt" (addline variant) + SortableContext
// z kartami projektow.
//
// Dane przez propy — sekcja nie wie czy jest na dashboardzie kontekstu,
// globalnym czy stronie projektu.

import { useMemo } from "react";
import { motion } from "motion/react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DashboardProject } from "@/lib/queries/dashboard";
import { listContainer, listItem } from "@/lib/motion";
import { LinearNewProjectButton } from "../linear-new-project";
import { ProjectCard } from "./project-card";

export function ProjectsSection({
  projects,
  selectedTaskId,
  onSelectTask,
  collapsed,
  onToggleCollapse,
  contextId,
  readOnly = false,
  isGlobal = false,
  currentContextId,
}: {
  projects: DashboardProject[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  collapsed: Set<string>;
  onToggleCollapse: (id: string) => void;
  /** ID kontekstu do tworzenia nowego projektu (null = brak guzika dodawania). */
  contextId: string | null;
  readOnly?: boolean;
  isGlobal?: boolean;
  /** Aktualnie otwarty kontekst — do decyzji czy pokazac badge. */
  currentContextId: string | null;
}) {
  const projectSortItems = useMemo(
    () => projects.map((p) => `project:${p.id}`),
    [projects]
  );

  return (
    <>
      <div className="t-section-header">
        <h3 className="t-section-title">Projekty</h3>
        <span className="t-section-counter">{projects.length}</span>
        {!readOnly && contextId ? (
          <LinearNewProjectButton contextId={contextId} variant="addline" />
        ) : null}
      </div>
      {projects.length === 0 ? (
        <div className="t-empty-state--centered">
          <div className="t-empty-icon">📋</div>
          <div className="t-empty-text">Brak projektów</div>
          {!readOnly && contextId && (
            <LinearNewProjectButton contextId={contextId} variant="ghost" />
          )}
        </div>
      ) : (
        <SortableContext
          items={projectSortItems}
          strategy={verticalListSortingStrategy}
        >
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {projects.map((p) => (
              <motion.div key={p.id} variants={listItem}>
                <ProjectCard
                  project={p}
                  collapsed={collapsed.has(p.id)}
                  onToggle={() => onToggleCollapse(p.id)}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={onSelectTask}
                  readOnly={readOnly}
                  showContextBadge={isGlobal || p.context.id !== currentContextId}
                />
              </motion.div>
            ))}
          </motion.div>
        </SortableContext>
      )}
    </>
  );
}
