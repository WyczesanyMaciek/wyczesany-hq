"use client";

// ProblemsSection — sekcja "Problemy" dashboardu Linear v2.
// Naglowek + liczba + LinearAddItem + chipy z ChipActions (na hover).
// DnD zmiana kolejnosci problemow.

import { useMemo } from "react";
import { motion } from "motion/react";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardItem } from "@/lib/queries/dashboard";
import { listContainer, listItem } from "@/lib/motion";
import { LinearAddItem } from "../shared/linear-add-item";
import { ChipActions } from "../shared/chip-actions";

export function ProblemsSection({
  problems,
  contextId,
  readOnly = false,
}: {
  problems: DashboardItem[];
  /** ID kontekstu do dodawania problemu (null = brak guzika). */
  contextId: string | null;
  readOnly?: boolean;
}) {
  const sortItems = useMemo(() => problems.map((p) => `problem:${p.id}`), [problems]);

  return (
    <div className="t-section">
      <div className="t-section-header">
        <h3 className="t-section-title">Problemy</h3>
        <span className="t-section-counter">{problems.length}</span>
        {!readOnly && contextId ? (
          <LinearAddItem kind="problem" contextId={contextId} />
        ) : null}
      </div>
      <div className="t-task-list-wrapper">
        <SortableContext items={sortItems} strategy={verticalListSortingStrategy}>
          <motion.div variants={listContainer} initial="hidden" animate="show">
            {problems.map((p) => (
              <motion.div key={p.id} variants={listItem}>
                <SortableChip kind="problem" item={p} readOnly={readOnly} />
              </motion.div>
            ))}
          </motion.div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableChip({ kind, item, readOnly }: { kind: "idea" | "problem"; item: DashboardItem; readOnly: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `${kind}:${item.id}`, disabled: readOnly });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="t-chip-row">
        {!readOnly && (
          <span className="t-chip-grip" {...listeners} onClick={(e) => e.stopPropagation()}>
            <GripVertical size={14} />
          </span>
        )}
        <span className="t-chip-icon">{kind === "idea" ? "💡" : "⚠"}</span>
        <div className="t-chip-content">
          {item.content}
          <div className="t-chip-meta">{item.context.name}</div>
        </div>
        {!readOnly && <ChipActions kind={kind} id={item.id} />}
      </div>
    </div>
  );
}
