"use client";

// LinearAddItem — inline input do szybkiego dodawania pomyslu lub problemu.
// Prop `kind` decyduje ktora server action wolac. Styl wzorowany na LinearAddTask.
// Ghost state -> klik -> input. Enter zapisuje, Escape zwija.

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createIdea, createProblem } from "@/app/(app)/c/[id]/actions";

export function LinearAddItem({
  kind,
  contextId,
}: {
  kind: "idea" | "problem";
  contextId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const label = kind === "idea" ? "+ dodaj pomysł" : "+ dodaj problem";
  const placeholder =
    kind === "idea" ? "Co chodzi Ci po głowie?" : "Co blokuje?";

  const close = () => {
    setOpen(false);
    setContent("");
    setError(null);
  };

  const submit = () => {
    const c = content.trim();
    if (!c) return;
    startTransition(async () => {
      const res =
        kind === "idea"
          ? await createIdea(contextId, { content: c })
          : await createProblem(contextId, { content: c });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setContent("");
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
        className="add"
        style={{
          background: "transparent",
          border: 0,
          font: "inherit",
          cursor: "pointer",
          color: "var(--accent)",
          fontWeight: 600,
          padding: 0,
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        padding: "6px 0",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: "100%",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
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
          if (!content.trim()) close();
        }}
        style={{
          font: "inherit",
          padding: "6px 10px",
          border: "1px solid var(--l-accent)",
          borderRadius: 6,
          background: "#fff",
          outline: "none",
          width: "100%",
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
