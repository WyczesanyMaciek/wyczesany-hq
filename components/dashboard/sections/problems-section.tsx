"use client";

// ProblemsSection — sekcja "Problemy" dashboardu Linear v2.
// Naglowek + liczba + LinearAddItem + chipy z ChipActions (na hover).
//
// Dane przez propy. Dziala na dashboardzie kontekstu (contextId != null)
// i globalnym (contextId = null, bez guzika dodawania i akcji).

import type { DashboardItem } from "@/lib/queries/dashboard";
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
      <div className="lsec" style={{ marginTop: 22 }}>
        <h3>Problemy</h3>
        <span className="n">{problems.length}</span>
        {!readOnly && contextId ? (
          <LinearAddItem kind="problem" contextId={contextId} />
        ) : null}
      </div>
      {problems.map((p) => (
        <div key={p.id} className="chip-row" style={{ marginBottom: 12 }}>
          <span className="icn p">!</span>
          <div className="txt">
            {p.content}
            <div className="meta">{p.context.name}</div>
          </div>
          {!readOnly && <ChipActions kind="problem" id={p.id} />}
        </div>
      ))}
    </>
  );
}
