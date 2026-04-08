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
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nowy kontekst" : "Edytuj kontekst"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Nazwa */}
          <div>
            <label className="block text-sm font-bold mb-1.5">Nazwa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Salony"
              className="w-full px-3 py-2 border-2 border-[var(--border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
              autoFocus
            />
          </div>

          {/* Kolor — paleta */}
          <div>
            <label className="block text-sm font-bold mb-2">Kolor</label>
            <div className="grid grid-cols-5 gap-2">
              {CONTEXT_PALETTE.map((c) => {
                const selected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={`${c.name} ${c.hex}`}
                    className="aspect-square rounded-md transition-transform hover:scale-105"
                    style={{
                      background: c.hex,
                      outline: selected
                        ? "3px solid var(--border-strong)"
                        : "2px solid transparent",
                      outlineOffset: selected ? "2px" : "0",
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
            <label className="block text-sm font-bold mb-1.5">Rodzic</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
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
            <div className="text-sm text-red-700 bg-red-50 border-2 border-red-300 rounded-md p-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !name.trim()}>
            {pending ? "Zapisywanie..." : mode === "create" ? "Dodaj" : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
