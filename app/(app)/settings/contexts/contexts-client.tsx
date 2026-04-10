"use client";

// Kliencka czesc strony /settings/contexts — Linear v2 style.

import { useState } from "react";
import { Pencil, Plus, ChevronRight } from "lucide-react";
import type { ContextNode } from "@/lib/queries/contexts";
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
      <div style={{ padding: "24px 32px" }}>
        <div style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94a3b8",
          fontWeight: 600,
          marginBottom: 4,
        }}>
          Ustawienia · Konteksty
        </div>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" }}>
              Konteksty
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 480, lineHeight: 1.5 }}>
              Zarzadzaj hierarchia kontekstow. Usuwac mozna tylko puste konteksty.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: "#5B3DF5",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            <Plus size={15} />
            Dodaj kontekst
          </button>
        </div>

        <div style={{
          border: "1px solid #eef0f3",
          borderRadius: 8,
          background: "#fff",
          overflow: "hidden",
        }}>
          {tree.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Brak kontekstow
            </div>
          ) : (
            tree.map((node) => (
              <ContextRow
                key={node.id}
                node={node}
                depth={0}
                onEdit={(ctx) => setModal({ kind: "edit", context: ctx })}
              />
            ))
          )}
        </div>
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          paddingLeft: 14 + depth * 22,
          borderBottom: "1px solid #eef0f3",
          transition: "background 120ms",
          cursor: "default",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        {depth > 0 && (
          <ChevronRight size={12} style={{ opacity: 0.3, marginLeft: -8, flexShrink: 0 }} />
        )}
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: 3,
            background: node.color,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{node.name}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>
            {node.ownProjectCount}p · {node.ownTaskCount}t · {node.ownIdeaCount}i · {node.ownProblemCount}b
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
          style={{
            padding: 4,
            border: "1px solid transparent",
            borderRadius: 4,
            background: "transparent",
            cursor: "pointer",
            color: "#94a3b8",
            display: "flex",
          }}
          title="Edytuj"
        >
          <Pencil size={13} />
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
