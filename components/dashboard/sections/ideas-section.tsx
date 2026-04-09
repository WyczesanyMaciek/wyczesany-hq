"use client";

// IdeasSection — sekcja "Pomysly" dashboardu Linear v2.
// Naglowek + liczba + LinearAddItem + chipy z ChipActions (na hover).
//
// Dane przez propy. Dziala na dashboardzie kontekstu (contextId != null)
// i globalnym (contextId = null, bez guzika dodawania i akcji).

import type { DashboardItem } from "@/lib/queries/dashboard";
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
    <>
      <div className="lsec" style={{ marginTop: 22 }}>
        <h3>Pomysły</h3>
        <span className="n">{ideas.length}</span>
        {!readOnly && contextId ? (
          <LinearAddItem kind="idea" contextId={contextId} />
        ) : null}
      </div>
      {ideas.map((i) => (
        <div key={i.id} className="chip-row">
          <span className="icn i">💡</span>
          <div className="txt">
            {i.content}
            <div className="meta">{i.context.name}</div>
          </div>
          {!readOnly && <ChipActions kind="idea" id={i.id} />}
        </div>
      ))}
    </>
  );
}
