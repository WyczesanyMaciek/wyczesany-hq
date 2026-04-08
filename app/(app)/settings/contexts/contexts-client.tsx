"use client";

// Kliencka czesc strony /settings/contexts — zarzadza stanem modalu
// (dodaj / edytuj) dla calej listy.

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContextNode } from "@/lib/queries/contexts";
import { hexToRgba } from "@/lib/colors";
import { ContextFormModal, type FlatContext } from "./context-form-modal";
import { DeleteContextButton } from "./delete-context-button";

type ModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | {
      kind: "edit";
      context: { id: string; name: string; color: string; parentId: string | null };
    };

export function ContextsClient({
  tree,
  flatContexts,
}: {
  tree: ContextNode[];
  flatContexts: FlatContext[];
}) {
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Konteksty</h1>
          <p className="opacity-70 text-[15px]">
            Zarzadzaj hierarchia kontekstow. Usuwac mozna tylko puste konteksty.
          </p>
        </div>
        <Button onClick={() => setModal({ kind: "create" })}>
          <Plus size={16} /> Dodaj kontekst
        </Button>
      </div>

      <div className="border-[3px] border-[var(--border-strong)] rounded-xl bg-white/40 overflow-hidden">
        {tree.length === 0 && (
          <div className="p-6 text-center opacity-60">Brak kontekstow</div>
        )}
        {tree.map((node) => (
          <ContextRow
            key={node.id}
            node={node}
            depth={0}
            onEdit={(ctx) => setModal({ kind: "edit", context: ctx })}
          />
        ))}
      </div>

      <ContextFormModal
        open={modal.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setModal({ kind: "closed" });
        }}
        mode={modal.kind === "edit" ? "edit" : "create"}
        initial={modal.kind === "edit" ? modal.context : undefined}
        flatContexts={flatContexts}
      />
    </>
  );
}

function ContextRow({
  node,
  depth,
  onEdit,
}: {
  node: ContextNode;
  depth: number;
  onEdit: (ctx: {
    id: string;
    name: string;
    color: string;
    parentId: string | null;
  }) => void;
}) {
  return (
    <>
      <div
        className="flex items-center gap-3 py-2 pr-3 border-b border-black/5 hover:bg-black/[0.02]"
        style={{
          paddingLeft: `${16 + depth * 20}px`,
          borderLeft: `4px solid ${hexToRgba(node.color, 0.35)}`,
        }}
      >
        <span
          className="inline-block w-3 h-3 rounded-full shrink-0"
          style={{ background: node.color }}
        />
        <span className="font-bold text-[15px] flex-1 min-w-0 truncate">
          {node.name}
        </span>
        <span className="text-xs opacity-50 font-mono shrink-0">
          {node.ownProjectCount}p · {node.ownTaskCount}t · {node.ownIdeaCount}i ·{" "}
          {node.ownProblemCount}b
        </span>
        <button
          type="button"
          onClick={() =>
            onEdit({
              id: node.id,
              name: node.name,
              color: node.color,
              parentId: node.parentId,
            })
          }
          className="p-1.5 rounded-md hover:bg-black/5"
          aria-label="Edytuj"
          title="Edytuj"
        >
          <Pencil size={16} />
        </button>
        <DeleteContextButton id={node.id} name={node.name} />
      </div>
      {node.children.map((child) => (
        <ContextRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
        />
      ))}
    </>
  );
}
