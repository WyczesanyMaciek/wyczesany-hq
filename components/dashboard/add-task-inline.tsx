"use client";

// Inline dodawanie luznego taska — ghost button "+ Dodaj task",
// po kliku rozwija sie w input z tytulem, opcjonalnym deadline i priority pills.
// Enter zapisuje, Escape zwija. Po zapisie wraca do ghost stanu.

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CalendarDays, X } from "lucide-react";
import { springSnappy } from "@/lib/motion";
import { createLooseTask } from "@/app/(app)/c/[id]/actions";
import { PriorityPills } from "./priority-pills";

export function AddTaskInline({ contextId }: { contextId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const reset = () => {
    setTitle("");
    setDeadline("");
    setPriority(0);
    setError(null);
  };

  const close = () => {
    reset();
    setOpen(false);
  };

  const submit = () => {
    const t = title.trim();
    if (t.length < 1) {
      setError("Tytul nie moze byc pusty.");
      return;
    }
    startTransition(async () => {
      const res = await createLooseTask(contextId, {
        title: t,
        deadline: deadline || null,
        priority,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      reset();
      // zostajemy otwarci dla szybkiego dodawania kolejnych
      inputRef.current?.focus();
    });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className="border-t-[3px] border-[var(--ink)]">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="ghost"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ x: -1, y: -1 }}
            whileTap={{ x: 1, y: 1 }}
            transition={springSnappy}
            className="w-full flex items-center gap-2 px-6 py-4 font-black uppercase tracking-wider text-sm opacity-70 hover:opacity-100 hover:bg-black/[0.03] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Dodaj task
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springSnappy}
            className="p-6 bg-black/[0.02]"
          >
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKey}
                placeholder="Co do zrobienia?"
                className="flex-1 px-4 py-3 rounded-xl border-[3px] border-[var(--ink)] bg-white font-extrabold text-[16px] focus:outline-none focus:shadow-[4px_4px_0_var(--ink)] transition-shadow"
                style={{ boxShadow: "2px 2px 0 var(--ink)" }}
              />
              <motion.button
                type="button"
                onClick={close}
                whileHover={{ rotate: 90 }}
                transition={springSnappy}
                className="w-11 h-11 rounded-xl border-[3px] border-[var(--ink)] bg-white flex items-center justify-center shrink-0"
                style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                aria-label="Anuluj"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </motion.button>
            </div>

            <div className="mt-4 flex items-end gap-5 flex-wrap">
              <div>
                <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                  Deadline
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border-[3px] border-[var(--ink)] bg-white"
                  style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                >
                  <CalendarDays className="w-4 h-4 opacity-60" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="font-bold bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <PriorityPills value={priority} onChange={setPriority} />
            </div>

            {error && (
              <div className="mt-3 text-sm font-black text-[#DC2626]">
                {error}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <motion.button
                type="button"
                onClick={submit}
                whileHover={{ x: -2, y: -2 }}
                whileTap={{ x: 1, y: 1 }}
                transition={springSnappy}
                className="px-5 py-2.5 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-[#FBF8F3] font-black uppercase tracking-wider text-sm"
                style={{ boxShadow: "4px 4px 0 var(--ink)" }}
              >
                Dodaj (Enter)
              </motion.button>
              <span className="text-xs opacity-60 font-bold">
                Esc aby zamknac
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
