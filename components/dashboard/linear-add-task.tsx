"use client";

// LinearAddTask — inline input do szybkiego dodawania taska.
// Dziala w dwoch trybach: luzny task (contextId) albo w projekcie (projectId).
// Ghost state to klikalny link "+ dodaj zadanie", po kliku zamienia sie
// na input. Enter zapisuje i zostaje otwarty (szybkie dodawanie kolejnych).
// Escape zwija i czysci.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/(app)/c/[id]/actions";

type Props =
  | { contextId: string; projectId?: undefined; placeholder?: string; label?: string }
  | { contextId?: undefined; projectId: string; placeholder?: string; label?: string };

export function LinearAddTask(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const label = props.label ?? "+ Dodaj zadanie";
  const placeholder = props.placeholder ?? "Co do zrobienia?";

  const close = () => {
    setOpen(false);
    setTitle("");
    setError(null);
  };

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      const res = await createTask({
        title: t,
        contextId: props.contextId,
        projectId: props.projectId,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTitle("");
      setError(null);
      router.refresh();
      // zostajemy otwarci dla szybkiego dodawania kolejnych
      inputRef.current?.focus();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="add-row"
        style={{
          background: "transparent",
          border: 0,
          width: "100%",
          textAlign: "left",
          font: "inherit",
          cursor: "pointer",
          color: "var(--accent)",
          fontWeight: 600,
          padding: "6px 10px",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        padding: "6px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError(null);
        }}
        disabled={pending}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
        onBlur={() => {
          // Gdy pusty -> zamknij; jesli cos wpisane i nie submitowane -> zostaw otwarte
          if (!title.trim()) close();
        }}
        style={{
          font: "inherit",
          padding: "6px 10px",
          border: "1px solid var(--accent)",
          borderRadius: 6,
          background: "#fff",
          outline: "none",
        }}
      />
      {error ? (
        <div style={{ color: "#b91c1c", fontSize: 12 }}>{error}</div>
      ) : null}
      <div style={{ fontSize: 11, color: "var(--l-muted)" }}>
        Enter zapisze · Esc anuluje
      </div>
    </div>
  );
}
