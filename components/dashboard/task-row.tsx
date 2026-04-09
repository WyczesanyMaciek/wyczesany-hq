"use client";

// Pojedynczy wiersz luznego taska — checkbox + tytul + deadline + badge.
// Optimistic toggle: klik na checkbox natychmiast zmienia UI, potem server action.
// Na bledzie rewert + czerwony border przez 2s.

import { useOptimistic, useTransition, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CalendarDays, Flame, Check } from "lucide-react";
import { softOf } from "@/lib/colors";
import { springSnappy } from "@/lib/motion";
import { toggleTask } from "@/app/(app)/c/[id]/actions";
import type { DashboardTask } from "@/lib/queries/dashboard";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}

function PriorityFlame({ priority }: { priority: number }) {
  if (priority < 2) return null;
  const color = priority === 3 ? "#DC2626" : "#F97316";
  return <Flame className="w-4 h-4" style={{ color }} />;
}

function ContextBadge({
  ctx,
}: {
  ctx: { id: string; name: string; color: string };
}) {
  return (
    <Link
      href={`/c/${ctx.id}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border-[2px] border-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
      style={{ background: softOf(ctx.color) }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: ctx.color }}
      />
      {ctx.name}
    </Link>
  );
}

export function TaskRow({
  task,
  showContextBadge,
}: {
  task: DashboardTask;
  showContextBadge: boolean;
}) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.done,
    (_state: boolean, next: boolean) => next
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const res = await toggleTask(task.id);
      if (!res.ok) {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    });
  };

  return (
    <motion.div
      layout
      transition={springSnappy}
      className="px-6 py-3 hover:bg-black/[0.03] flex items-center gap-3 transition-colors"
      style={{
        border: error ? "2px solid #DC2626" : undefined,
        background: optimisticDone ? "rgba(0,0,0,0.02)" : undefined,
      }}
    >
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={springSnappy}
        className="w-6 h-6 rounded-md border-[2.5px] border-[var(--ink)] shrink-0 flex items-center justify-center"
        style={{
          background: optimisticDone ? "var(--ink)" : "#FFFFFF",
          boxShadow: optimisticDone ? "none" : "2px 2px 0 var(--ink)",
        }}
        aria-label={optimisticDone ? "Cofnij zakonczenie" : "Oznacz jako zrobione"}
      >
        {optimisticDone && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springSnappy}
          >
            <Check className="w-4 h-4 text-[#FBF8F3]" strokeWidth={4} />
          </motion.div>
        )}
      </motion.button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-extrabold"
            style={{
              textDecoration: optimisticDone ? "line-through" : undefined,
              opacity: optimisticDone ? 0.5 : 1,
            }}
          >
            {task.title}
          </span>
          <PriorityFlame priority={task.priority} />
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.deadline && (
            <span className="text-xs flex items-center gap-1 opacity-70 font-bold">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(task.deadline)}
            </span>
          )}
          {showContextBadge && <ContextBadge ctx={task.context} />}
        </div>
      </div>
    </motion.div>
  );
}

export function HistoryTaskRow({
  task,
  showContextBadge,
}: {
  task: DashboardTask;
  showContextBadge: boolean;
}) {
  const [, startTransition] = useTransition();

  const handleUndo = () => {
    startTransition(async () => {
      await toggleTask(task.id);
    });
  };

  return (
    <div className="px-6 py-3 flex items-center gap-3 opacity-60 border-b border-[var(--ink)]/10 last:border-b-0 hover:opacity-90 transition-opacity">
      <motion.button
        type="button"
        onClick={handleUndo}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={springSnappy}
        className="w-6 h-6 rounded-md border-[2.5px] border-[var(--ink)] bg-[var(--ink)] shrink-0 flex items-center justify-center"
        aria-label="Cofnij zakonczenie"
        title="Przywroc"
      >
        <Check className="w-4 h-4 text-[#FBF8F3]" strokeWidth={4} />
      </motion.button>
      <span className="line-through font-bold flex-1 min-w-0 truncate">
        {task.title}
      </span>
      {showContextBadge && <ContextBadge ctx={task.context} />}
    </div>
  );
}
