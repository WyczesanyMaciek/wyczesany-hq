"use client";

// Kliencka czesc strony /settings/contexts — zarzadza stanem modalu
// (dodaj / edytuj) dla calej listy.
// Kierunek: Neo-brutalist warm — grube bordery, twarde cienie, pastelowe
// tla wierszy per kontekst, sprezyste hover.

import { useState } from "react";
import { Pencil, Plus, ChevronRight } from "lucide-react";
import type { ContextNode } from "@/lib/queries/contexts";
import { softOf } from "@/lib/colors";
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
      <header className="mb-10">
        <div className="eyebrow mb-3">Ustawienia · Konteksty</div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="m-0 mb-2">Konteksty</h1>
            <p className="opacity-70 max-w-xl m-0">
              Zarzadzaj hierarchia kontekstow. Usuwac mozna tylko puste
              konteksty — jesli maja projekty, taski, pomysly lub problemy,
              trzeba je najpierw przeniesc albo skasowac.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="brutal-btn brutal-btn-primary"
          >
            <Plus size={18} />
            Dodaj kontekst
          </button>
        </div>
      </header>

      <div className="brutal-card overflow-hidden">
        {tree.length === 0 ? (
          <div className="p-10 text-center opacity-60 italic font-semibold">
            Brak kontekstow
          </div>
        ) : (
          <div className="divide-y-[2px] divide-[var(--ink)]/10">
            {tree.map((node) => (
              <ContextRow
                key={node.id}
                node={node}
                depth={0}
                onEdit={(ctx) => setModal({ kind: "edit", context: ctx })}
              />
            ))}
          </div>
        )}
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
        className="flex items-center gap-3 py-3 pr-4 group transition-colors hover:bg-black/[0.03]"
        style={{
          paddingLeft: `${20 + depth * 28}px`,
          borderLeft: `5px solid ${node.color}`,
        }}
      >
        {depth > 0 && (
          <ChevronRight size={14} className="opacity-30 -ml-3 shrink-0" />
        )}
        <div
          className="w-8 h-8 rounded-lg border-[2.5px] border-[var(--ink)] shrink-0"
          style={{
            background: softOf(node.color),
            boxShadow: "2px 2px 0 var(--ink)",
          }}
        >
          <div
            className="w-full h-full rounded-sm"
            style={{
              background: `linear-gradient(135deg, ${node.color} 50%, transparent 50%)`,
              opacity: 0.9,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-[16px] truncate">{node.name}</div>
          <div className="text-[11px] opacity-55 font-mono">
            {node.ownProjectCount}p · {node.ownTaskCount}t ·{" "}
            {node.ownIdeaCount}i · {node.ownProblemCount}b
          </div>
        </div>
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
          className="p-2 rounded-lg border-[2px] border-transparent hover:border-[var(--ink)] hover:bg-white transition-all"
          aria-label="Edytuj"
          title="Edytuj"
        >
          <Pencil size={16} strokeWidth={2.5} />
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
