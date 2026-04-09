"use client";

// Modal do dodawania i edycji kontekstu.
// Pola: nazwa, kolor (paleta 10 przyciskow), rodzic (dropdown plaskiej listy).

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

  // Reset przy otwarciu
  const resetForInitial = () => {
    setName(initial?.name ?? "");
    setColor(initial?.color ?? CONTEXT_PALETTE[0].hex);
    setParentId(initial?.parentId ?? "");
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        color,
        parentId: parentId || null,
      };
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

  // Przy otwarciu wczytaj wartosci poczatkowe (gdy mode/initial sie zmieni)
  const handleOpenChange = (next: boolean) => {
    if (next) resetForInitial();
    onOpenChange(next);
  };

  // Filtruj liste rodzicow: w trybie edit nie mozna wskazac samego siebie
  // ani swoich potomkow (walidacja tez na serwerze, ale UI czystszy).
  const parentOptions = flatContexts.filter((c) =>
    mode === "edit" && initial ? c.id !== initial.id : true
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden"
        style={{
          background: "#FBF8F3",
          border: "3px solid var(--ink)",
          borderRadius: "16px",
          boxShadow: "8px 8px 0 var(--ink)",
        }}
      >
        <DialogHeader
          className="p-6 border-b-[3px] border-[var(--ink)]"
          style={{ background: "#F5EFE3" }}
        >
          <div className="eyebrow mb-1">
            {mode === "create" ? "Nowy" : "Edycja"}
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {mode === "create" ? "Nowy kontekst" : "Edytuj kontekst"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Nazwa */}
          <div>
            <label className="block text-sm font-black mb-2 uppercase tracking-wider">
              Nazwa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Salony"
              className="w-full px-4 py-3 border-[3px] border-[var(--ink)] rounded-xl bg-white font-bold focus:outline-none focus:shadow-[4px_4px_0_var(--ink)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all"
              autoFocus
            />
          </div>

          {/* Kolor — paleta */}
          <div>
            <label className="block text-sm font-black mb-3 uppercase tracking-wider">
              Kolor
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {CONTEXT_PALETTE.map((c) => {
                const selected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={`${c.name} ${c.hex}`}
                    className="aspect-square rounded-lg transition-all"
                    style={{
                      background: c.hex,
                      border: "3px solid var(--ink)",
                      boxShadow: selected
                        ? "4px 4px 0 var(--ink)"
                        : "2px 2px 0 var(--ink)",
                      transform: selected ? "translate(-2px,-2px)" : "none",
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
            <label className="block text-sm font-black mb-2 uppercase tracking-wider">
              Rodzic
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-3 border-[3px] border-[var(--ink)] rounded-xl bg-white font-bold focus:outline-none focus:shadow-[4px_4px_0_var(--ink)]"
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
            <div className="text-sm font-bold text-[#7f1d1d] bg-[#FCE4E4] border-[3px] border-[#DC2626] rounded-xl p-3">
              {error}
            </div>
          )}
        </div>

        <DialogFooter
          className="p-6 border-t-[3px] border-[var(--ink)] flex-row justify-end gap-3"
          style={{ background: "#F5EFE3" }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="brutal-btn"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !name.trim()}
            className="brutal-btn brutal-btn-primary disabled:opacity-50"
          >
            {pending
              ? "Zapisywanie..."
              : mode === "create"
                ? "Dodaj"
                : "Zapisz"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
