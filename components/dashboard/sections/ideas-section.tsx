"use client";

// IdeasSection — sekcja "Pomysly" dashboardu Linear v2.
// Naglowek + liczba + LinearAddItem + chipy z ChipActions (na hover).
//
// Dane przez propy. Dziala na dashboardzie kontekstu (contextId != null)
// i globalnym (contextId = null, bez guzika dodawania i akcji).

import { motion } from "motion/react";
import type { DashboardItem } from "@/lib/queries/dashboard";
import { listContainer, listItem } from "@/lib/motion";
import { LinearAddItem } from "../shared/linear-add-item";
import { ChipActions } from "../shared/chip-actions";

export function IdeasSection({
  ideas,
  contextId,
  readOnly = false,
}: {
  ideas: DashboardItem[];
  /** ID kontekstu do dodawania pomyslu (null = brak guzika). */
  contextId: string | null;
  readOnly?: boolean;
}) {
  return (
    <div className="t-section">
      <div className="t-section-header">
        <h3 className="t-section-title">Pomysły</h3>
        <span className="t-section-counter">{ideas.length}</span>
        {!readOnly && contextId ? (
          <LinearAddItem kind="idea" contextId={contextId} />
        ) : null}
      </div>
      <motion.div variants={listContainer} initial="hidden" animate="show">
        {ideas.map((i) => (
          <motion.div key={i.id} variants={listItem}>
            <div className="t-chip-row">
              <span className="t-chip-icon">💡</span>
              <div className="t-chip-content">
                {i.content}
                <div className="t-chip-meta">{i.context.name}</div>
              </div>
              {!readOnly && <ChipActions kind="idea" id={i.id} />}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
