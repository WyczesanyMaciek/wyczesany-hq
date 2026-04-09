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
          className="add"
          style={{
            background: "transparent",
            border: 0,
            font: "inherit",
            cursor: "pointer",
            color: "var(--l-muted)",
          }}
        >
          + dodaj projekt
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`lbtn ${variant === "ghost" ? "ghost" : ""}`}
        >
          + Nowy projekt
        </button>
      )}

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(15, 23, 42, 0.25)",
          }}
          onClick={close}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              border: "1px solid var(--l-line)",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              fontFamily: "inherit",
              fontSize: 13,
              color: "var(--l-ink)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Nowy projekt
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "var(--l-muted)", fontSize: 12 }}>
                  Nazwa
                </span>
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
                  style={{
                    font: "inherit",
                    padding: "6px 10px",
                    border: "1px solid var(--l-line)",
                    borderRadius: 6,
                    background: "#fff",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "var(--l-muted)", fontSize: 12 }}>
                  Opis (opcjonalnie)
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O co chodzi..."
                  rows={3}
                  disabled={pending}
                  style={{
                    font: "inherit",
                    padding: "6px 10px",
                    border: "1px solid var(--l-line)",
                    borderRadius: 6,
                    background: "#fff",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    flex: 1,
                  }}
                >
                  <span style={{ color: "var(--l-muted)", fontSize: 12 }}>
                    Deadline
                  </span>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={pending}
                    style={{
                      font: "inherit",
                      padding: "6px 10px",
                      border: "1px solid var(--l-line)",
                      borderRadius: 6,
                      background: "#fff",
                      outline: "none",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    flex: 1,
                  }}
                >
                  <span style={{ color: "var(--l-muted)", fontSize: 12 }}>
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={pending}
                    style={{
                      font: "inherit",
                      padding: "6px 10px",
                      border: "1px solid var(--l-line)",
                      borderRadius: 6,
                      background: "#fff",
                      outline: "none",
                    }}
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
                <div style={{ color: "#b91c1c", fontSize: 12 }}>{error}</div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                onClick={close}
                disabled={pending}
                style={{
                  font: "inherit",
                  padding: "6px 12px",
                  border: "1px solid var(--l-line)",
                  background: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || !name.trim()}
                style={{
                  font: "inherit",
                  padding: "6px 14px",
                  border: 0,
                  background: "var(--l-accent)",
                  color: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
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
