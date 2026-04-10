"use client";

// TaskCheckbox — DS v1 style.
// 18px box, border 2px #D1CEC6, bg white, hover border accent.
// Done: bg success green, white checkmark.

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
  const size = compact ? 18 : 22;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: done
          ? "2px solid var(--status-success)"
          : "2px solid var(--border-strong)",
        background: done ? "var(--status-success)" : "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
        padding: 0,
        transition: "all 120ms ease",
      }}
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Cofnij zakonczenie" : "Oznacz jako zrobione"}
    >
      {done && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springSnappy}
          style={{ lineHeight: 0 }}
        >
          <Check
            size={compact ? 12 : 14}
            style={{ color: "#FFFFFF" }}
            strokeWidth={3}
          />
        </motion.div>
      )}
    </button>
  );
}
