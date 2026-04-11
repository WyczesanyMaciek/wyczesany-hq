"use client";

// ChipActions — menu akcji dla chipu pomyslu/problemu.
// Trzy akcje: wyrzuc (delete), -> task (convertToTask), -> projekt (convertToProject).
// Renderowane wewnatrz .chip-row .actions — CSS juz ogarnia opacity na hover.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteIdea,
  deleteProblem,
  convertIdeaToTask,
  convertIdeaToProject,
  convertProblemToTask,
  convertProblemToProject,
} from "@/app/(app)/c/[id]/actions";

export function ChipActions({
  kind,
  id,
}: {
  kind: "idea" | "problem";
  id: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handle = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      startTransition(async () => {
        const res = await fn();
        if (!res.ok) {
          // prosto: alert — UI lepszy dodamy w polishingu
          alert(res.error ?? "Nie udalo sie.");
          return;
        }
        router.refresh();
      });
    };
  };

  const onDelete = handle(() =>
    kind === "idea" ? deleteIdea(id) : deleteProblem(id)
  );
  const onToTask = handle(() =>
    kind === "idea" ? convertIdeaToTask(id) : convertProblemToTask(id)
  );
  const onToProject = handle(() =>
    kind === "idea" ? convertIdeaToProject(id) : convertProblemToProject(id)
  );

  return (
    <div className="t-chip-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="t-chip-action-btn"
        onClick={onDelete}
        disabled={pending}
        title="Wyrzuc"
      >
        Wyrzuć
      </button>
      <button
        type="button"
        className="t-chip-action-btn"
        onClick={onToTask}
        disabled={pending}
        title="Zrob z tego luzny task"
      >
        → Task
      </button>
      <button
        type="button"
        className="t-chip-action-btn"
        onClick={onToProject}
        disabled={pending}
        title="Rozpisz na projekt"
      >
        → Projekt
      </button>
    </div>
  );
}
