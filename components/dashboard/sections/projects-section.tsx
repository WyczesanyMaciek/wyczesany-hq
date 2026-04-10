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
      <div className="lsec">
        <h3>Projekty</h3>
        <span className="n">{projects.length}</span>
        {!readOnly && contextId ? (
          <LinearNewProjectButton contextId={contextId} variant="addline" />
        ) : null}
      </div>
      {projects.length === 0 ? (
        <div style={{ margin: "6px 12px", color: "#94a3b8", fontSize: 12.5 }}>
          Brak projektów
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
