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
        className="t-add-item"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="t-inline-form">
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
        className="t-inline-input"
      />
      {error ? (
        <div className="t-inline-error">{error}</div>
      ) : null}
      <div className="t-inline-hint">
        Enter zapisze · Esc anuluje
      </div>
    </div>
  );
}
