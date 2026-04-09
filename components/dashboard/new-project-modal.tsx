"use client";

// Modal nowego projektu — ghost button "+ Nowy projekt" otwiera brutal modal.
// Pola: nazwa, opis, deadline, status. Priorytet nie jest tu jeszcze (projekty
// nie maja priorytetu w modelu). Enter w nazwie nie submituje — Tab przechodzi
// do dalszych pol, klikniecie "Stworz" zapisuje.

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, FolderOpen } from "lucide-react";
import { springSnappy } from "@/lib/motion";
import { createProject } from "@/app/(app)/c/[id]/actions";

const STATUSES = [
  { value: "todo", label: "Do zrobienia", color: "#64748B", soft: "#E6E9ED" },
  { value: "in_progress", label: "W trakcie", color: "#5B3DF5", soft: "#E8E2FE" },
  { value: "on_hold", label: "Wstrzymany", color: "#CA8A04", soft: "#FBEFCF" },
  { value: "done", label: "Zrobiony", color: "#16A34A", soft: "#DDF3E2" },
] as const;

export function NewProjectModal({ contextId }: { contextId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const reset = () => {
    setName("");
    setDescription("");
    setDeadline("");
    setStatus("todo");
    setError(null);
  };

  const close = () => {
    reset();
    setOpen(false);
  };

  const submit = () => {
    const n = name.trim();
    if (n.length < 1) {
      setError("Nazwa projektu jest wymagana.");
      return;
    }
    startTransition(async () => {
      const res = await createProject(contextId, {
        name: n,
        description: description || null,
        deadline: deadline || null,
        status,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      close();
    });
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ x: 1, y: 1 }}
        transition={springSnappy}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-[var(--ink)] bg-white font-black uppercase tracking-wider text-sm"
        style={{ boxShadow: "4px 4px 0 var(--ink)" }}
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
        Nowy projekt
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-[var(--ink)]/30"
              onClick={close}
            />
            <motion.div
              className="relative w-full max-w-[560px] rounded-2xl border-[3px] border-[var(--ink)] bg-[#FBF8F3] p-8"
              style={{ boxShadow: "8px 8px 0 var(--ink)" }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={springSnappy}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center shrink-0"
                  style={{ background: "#E8E2FE", boxShadow: "3px 3px 0 var(--ink)" }}
                >
                  <FolderOpen className="w-6 h-6" style={{ color: "#5B3DF5" }} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="eyebrow">Nowa inicjatywa</div>
                  <h2 className="m-0">Stworz projekt</h2>
                </div>
                <motion.button
                  type="button"
                  onClick={close}
                  whileHover={{ rotate: 90 }}
                  transition={springSnappy}
                  className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] bg-white flex items-center justify-center shrink-0"
                  style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                  aria-label="Zamknij"
                >
                  <X className="w-5 h-5" strokeWidth={3} />
                </motion.button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Nazwa
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="np. Remont Legnicka"
                    className="w-full px-4 py-3 rounded-xl border-[3px] border-[var(--ink)] bg-white font-extrabold text-[16px] focus:outline-none focus:shadow-[4px_4px_0_var(--ink)] transition-shadow"
                    style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Opis <span className="opacity-50">(opcjonalnie)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="O co chodzi, co trzeba zrobic..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-[3px] border-[var(--ink)] bg-white font-semibold text-[15px] focus:outline-none focus:shadow-[4px_4px_0_var(--ink)] transition-shadow resize-none"
                    style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Deadline <span className="opacity-50">(opcjonalnie)</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="px-4 py-3 rounded-xl border-[3px] border-[var(--ink)] bg-white font-bold focus:outline-none focus:shadow-[4px_4px_0_var(--ink)] transition-shadow"
                    style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.map((s) => {
                      const selected = status === s.value;
                      return (
                        <motion.button
                          key={s.value}
                          type="button"
                          onClick={() => setStatus(s.value)}
                          aria-pressed={selected}
                          whileHover={{ x: -2, y: -2 }}
                          whileTap={{ x: 1, y: 1 }}
                          transition={springSnappy}
                          className="px-4 py-2 rounded-xl border-[3px] border-[var(--ink)] font-black text-sm"
                          style={{
                            background: selected ? s.color : s.soft,
                            color: selected ? "#FFFFFF" : "var(--ink)",
                            boxShadow: selected
                              ? "4px 4px 0 var(--ink)"
                              : "2px 2px 0 var(--ink)",
                          }}
                        >
                          {s.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="text-sm font-black text-[#DC2626]">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="px-5 py-2.5 rounded-xl border-[3px] border-[var(--ink)] bg-white font-black uppercase tracking-wider text-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] transition-all"
                  style={{ boxShadow: "2px 2px 0 var(--ink)" }}
                >
                  Anuluj
                </button>
                <motion.button
                  type="button"
                  onClick={submit}
                  whileHover={{ x: -2, y: -2 }}
                  whileTap={{ x: 1, y: 1 }}
                  transition={springSnappy}
                  className="px-5 py-2.5 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-[#FBF8F3] font-black uppercase tracking-wider text-sm"
                  style={{ boxShadow: "4px 4px 0 var(--ink)" }}
                >
                  Stworz projekt
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
