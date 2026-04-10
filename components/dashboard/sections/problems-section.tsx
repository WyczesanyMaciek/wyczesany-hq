"use client";

// ProblemsSection — sekcja "Problemy" dashboardu Linear v2.
// Naglowek + liczba + LinearAddItem + chipy z ChipActions (na hover).
//
// Dane przez propy. Dziala na dashboardzie kontekstu (contextId != null)
// i globalnym (contextId = null, bez guzika dodawania i akcji).

import { motion } from "motion/react";
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
  return (
    <>
      <div className="t-section-header" style={{ marginTop: 22 }}>
        <h3 className="t-section-title">Problemy</h3>
        <span className="t-section-counter">{problems.length}</span>
        {!readOnly && contextId ? (
          <LinearAddItem kind="problem" contextId={contextId} />
        ) : null}
      </div>
      <motion.div variants={listContainer} initial="hidden" animate="show">
        {problems.map((p) => (
          <motion.div key={p.id} variants={listItem}>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              <span className="icn p">!</span>
              <div className="txt">
                {p.content}
                <div className="meta">{p.context.name}</div>
              </div>
              {!readOnly && <ChipActions kind="problem" id={p.id} />}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
