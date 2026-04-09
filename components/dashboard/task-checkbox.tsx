"use client";

// Wspolny checkbox dla taskow — dwa warianty rozmiaru:
// - compact=false (brutal dashboard, task-row.tsx): box 24x24, hit target 44x44
// - compact=true  (Linear v2, linear-dashboard.tsx): box 18x18, hit target ~32x32
//
// Wizualnie: zawsze kremowe tlo + zielony znaczek v kiedy done.
// Maciek ma dysleksje i astygmatyzm — duzy hit target + wysoki kontrast.

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { springSnappy } from "@/lib/motion";

export function TaskCheckbox({
  done,
  onToggle,
  compact = false,
  disabled = false,
}: {
  done: boolean;
  onToggle: (e: React.MouseEvent) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  // Rozmiary (wrapper padding daje hit target, box to to co widac).
  const padding = compact ? "p-1.5 -m-1.5" : "p-3 -m-3";
  const boxSize = compact ? "w-[18px] h-[18px]" : "w-6 h-6";
  const checkSize = compact ? "w-3 h-3" : "w-4 h-4";
  const borderWidth = compact ? "border-[1.5px]" : "border-[2.5px]";
  const boxShadow = compact
    ? undefined
    : done
      ? "none"
      : "2px 2px 0 var(--ink)";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.08 }}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      transition={springSnappy}
      className={`${padding} shrink-0 flex items-center justify-center cursor-pointer`}
      style={{ lineHeight: 0 }}
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Cofnij zakonczenie" : "Oznacz jako zrobione"}
    >
      <span
        className={`${boxSize} rounded-md ${borderWidth} border-[var(--ink)] flex items-center justify-center`}
        style={{
          background: "#FBF8F3",
          boxShadow,
        }}
      >
        {done && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springSnappy}
            style={{ lineHeight: 0 }}
          >
            <Check
              className={checkSize}
              style={{ color: "#16A34A" }}
              strokeWidth={4}
            />
          </motion.div>
        )}
      </span>
    </motion.button>
  );
}
