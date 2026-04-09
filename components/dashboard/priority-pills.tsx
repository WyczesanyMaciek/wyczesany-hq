"use client";

// Wybor priorytetu — 4 brutal pills (Brak / Niski / Sredni / Wysoki).
// Zaznaczona pill "wypchnieta" do przodu (translate + cien lg),
// niezaznaczone plaskie (cien sm). Uzywane w new-project-modal i add-task-inline.

import { motion } from "motion/react";
import { springSnappy } from "@/lib/motion";

const OPTIONS = [
  { value: 0, label: "Brak", color: "#64748B", soft: "#E6E9ED" },
  { value: 1, label: "Niski", color: "#16A34A", soft: "#DDF3E2" },
  { value: 2, label: "Sredni", color: "#F97316", soft: "#FEE7D0" },
  { value: 3, label: "Wysoki", color: "#DC2626", soft: "#FCE4E4" },
] as const;

export function PriorityPills({
  value,
  onChange,
  label = "Priorytet",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-black mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ x: 1, y: 1 }}
              transition={springSnappy}
              className="px-4 py-2 rounded-xl border-[3px] border-[var(--ink)] font-black text-sm transition-colors"
              style={{
                background: selected ? opt.color : opt.soft,
                color: selected ? "#FFFFFF" : "var(--ink)",
                boxShadow: selected
                  ? "4px 4px 0 var(--ink)"
                  : "2px 2px 0 var(--ink)",
              }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
