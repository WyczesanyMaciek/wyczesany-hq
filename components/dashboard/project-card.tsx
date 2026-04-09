"use client";

// Karta projektu na dashboardzie — nazwa, opis, status, deadline, badge kontekstu,
// progress bar (taski done / total) i przycisk kosza (z potwierdzeniem inline).
// Brutal style: grube bordery wewnetrzne tylko przy hover, click-through do /p/[id].

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, Trash2, Check } from "lucide-react";
import { softOf } from "@/lib/colors";
import { springSnappy } from "@/lib/motion";
import { deleteProject } from "@/app/(app)/c/[id]/actions";
import type { DashboardProject } from "@/lib/queries/dashboard";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}

const STATUS_LABELS: Record<string, { label: string; color: string; soft: string }> = {
  todo: { label: "Do zrobienia", color: "#64748B", soft: "#E6E9ED" },
  in_progress: { label: "W trakcie", color: "#5B3DF5", soft: "#E8E2FE" },
  on_hold: { label: "Wstrzymany", color: "#CA8A04", soft: "#FBEFCF" },
  done: { label: "Zrobiony", color: "#16A34A", soft: "#DDF3E2" },
};

export function ProjectCard({
  project,
  showContextBadge,
  editable,
}: {
  project: DashboardProject;
  showContextBadge: boolean;
  editable: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  const pct =
    project.taskTotal > 0
      ? Math.round((project.taskDone / project.taskTotal) * 100)
      : 0;

  const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.todo;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    startTransition(async () => {
      await deleteProject(project.id);
    });
  };

  return (
    <div className="group relative px-6 py-4 hover:bg-black/[0.03] transition-colors border-b border-[var(--ink)]/10 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-black text-[18px] leading-tight">
            {project.name}
          </div>
          {project.description && (
            <div className="text-sm opacity-70 mt-1 line-clamp-2 font-medium">
              {project.description}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border-[2px] border-[var(--ink)] font-black uppercase tracking-wider"
              style={{ background: status.soft }}
            >
              {status.label}
            </span>
            {project.deadline && (
              <span className="text-xs flex items-center gap-1 opacity-70 font-bold">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatDate(project.deadline)}
              </span>
            )}
            {showContextBadge && (
              <Link
                href={`/c/${project.context.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border-[2px] border-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                style={{ background: softOf(project.context.color) }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: project.context.color }}
                />
                {project.context.name}
              </Link>
            )}
          </div>
        </div>

        {editable && (
          <AnimatePresence mode="wait" initial={false}>
            {confirming ? (
              <motion.button
                key="confirm"
                type="button"
                onClick={handleDelete}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ x: -1, y: -1 }}
                whileTap={{ x: 1, y: 1 }}
                transition={springSnappy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border-[2.5px] border-[var(--ink)] bg-[#DC2626] text-white font-black uppercase tracking-wider text-xs"
                style={{ boxShadow: "3px 3px 0 var(--ink)" }}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                Na pewno?
              </motion.button>
            ) : (
              <motion.button
                key="trash"
                type="button"
                onClick={handleDelete}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ x: -1, y: -1 }}
                whileTap={{ x: 1, y: 1 }}
                transition={springSnappy}
                className="shrink-0 w-9 h-9 rounded-xl border-[2.5px] border-[var(--ink)] bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                aria-label="Usun projekt"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider opacity-60">
            Postep
          </span>
          <span className="text-[11px] font-black tabular-nums">
            {project.taskDone} / {project.taskTotal}
          </span>
        </div>
        <div
          className="h-3 rounded-full border-[2px] border-[var(--ink)] overflow-hidden"
          style={{ background: "#FFFFFF" }}
        >
          <motion.div
            className="h-full"
            style={{ background: status.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ ...springSnappy, delay: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}
