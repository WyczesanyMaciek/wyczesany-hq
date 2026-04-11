"use client";

// LinearNewProjectButton — guzik "+ Nowy projekt" w stylu Linear v2.
// Otwiera lekki modal z polami: nazwa, opis, deadline, status.
// Wywoluje createProject i odswieza strone.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/(app)/c/[id]/actions";

const STATUSES = [
  { value: "todo", label: "Do zrobienia" },
  { value: "in_progress", label: "W trakcie" },
  { value: "on_hold", label: "Wstrzymany" },
  { value: "done", label: "Zrobiony" },
] as const;

export function LinearNewProjectButton({
  contextId,
  variant = "primary",
}: {
  contextId: string;
  variant?: "primary" | "ghost" | "addline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  const close = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setDeadline("");
    setStatus("todo");
    setError(null);
  };

  const submit = () => {
    const n = name.trim();
    if (!n) {
      setError("Nazwa jest wymagana.");
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
      router.refresh();
    });
  };

  return (
    <>
      {variant === "addline" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="t-section-action"
        >
          + dodaj projekt
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={variant === "ghost" ? "t-btn-secondary" : "t-btn-primary"}
        >
          + Nowy projekt
        </button>
      )}

      {open ? (
        <div className="t-modal-overlay" onClick={close}>
          <div className="t-modal" onClick={(e) => e.stopPropagation()}>
            <div className="t-modal-title">Nowy projekt</div>

            <div className="t-modal-body">
              <label className="t-modal-field">
                <span className="t-modal-field-label">Nazwa</span>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  placeholder="np. Remont Legnicka"
                  disabled={pending}
                  className="t-modal-input"
                />
              </label>

              <label className="t-modal-field">
                <span className="t-modal-field-label">Opis (opcjonalnie)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O co chodzi..."
                  rows={3}
                  disabled={pending}
                  className="t-modal-input"
                  style={{ resize: "vertical" }}
                />
              </label>

              <div className="t-modal-field-row">
                <label className="t-modal-field" style={{ flex: 1 }}>
                  <span className="t-modal-field-label">Deadline</span>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={pending}
                    className="t-modal-input"
                  />
                </label>

                <label className="t-modal-field" style={{ flex: 1 }}>
                  <span className="t-modal-field-label">Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={pending}
                    className="t-modal-input"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? (
                <div className="t-inline-error">{error}</div>
              ) : null}
            </div>

            <div className="t-modal-footer">
              <button
                type="button"
                className="t-btn-secondary"
                onClick={close}
                disabled={pending}
              >
                Anuluj
              </button>
              <button
                type="button"
                className="t-btn-primary"
                onClick={submit}
                disabled={pending || !name.trim()}
              >
                {pending ? "Zapisuje..." : "Stworz projekt"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
