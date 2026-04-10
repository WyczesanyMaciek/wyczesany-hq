"use client";

// Modal do dodawania i edycji kontekstu — Linear v2 style.

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CONTEXT_PALETTE } from "@/lib/colors";
import { createContext, updateContext } from "./actions";

export type FlatContext = {
  id: string;
  name: string;
  depth: number;
  color: string;
};

type Mode = "create" | "edit";

export function ContextFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  flatContexts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  initial?: {
    id: string;
    name: string;
    color: string;
    parentId: string | null;
  };
  flatContexts: FlatContext[];
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? CONTEXT_PALETTE[0].hex);
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resetForInitial = () => {
    setName(initial?.name ?? "");
    setColor(initial?.color ?? CONTEXT_PALETTE[0].hex);
    setParentId(initial?.parentId ?? "");
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const payload = { name, color, parentId: parentId || null };
      const res =
        mode === "create"
          ? await createContext(payload)
          : await updateContext(initial!.id, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onOpenChange(false);
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (next) resetForInitial();
    onOpenChange(next);
  };

  const parentOptions = flatContexts.filter((c) =>
    mode === "edit" && initial ? c.id !== initial.id : true
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    background: "#fff",
    font: "inherit",
    outline: "none",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
        }}
      >
        <DialogHeader style={{ padding: "20px 24px 16px" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>
            {mode === "create" ? "Nowy" : "Edycja"}
          </div>
          <DialogTitle style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {mode === "create" ? "Nowy kontekst" : "Edytuj kontekst"}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nazwa */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Nazwa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Salony"
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* Kolor */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
              Kolor
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {CONTEXT_PALETTE.map((c) => {
                const selected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 6,
                      background: c.hex,
                      border: selected ? "2px solid #0f172a" : "2px solid transparent",
                      cursor: "pointer",
                      outline: selected ? "2px solid #fff" : "none",
                      outlineOffset: -4,
                      transition: "all 120ms",
                    }}
                    aria-label={c.name}
                    aria-pressed={selected}
                  />
                );
              })}
            </div>
          </div>

          {/* Rodzic */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Rodzic
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— brak (kontekst glowny) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {"· ".repeat(c.depth)}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              {error}
            </div>
          )}
        </div>

        <DialogFooter
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #eef0f3",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "#475569",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !name.trim()}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: pending || !name.trim() ? "#94a3b8" : "#5B3DF5",
              border: "none",
              borderRadius: 6,
              cursor: pending || !name.trim() ? "not-allowed" : "pointer",
              font: "inherit",
            }}
          >
            {pending ? "Zapisywanie..." : mode === "create" ? "Dodaj" : "Zapisz"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
