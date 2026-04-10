"use client";

// SearchDialog — globalny search modal.
// Otwiera sie skrotem "/" albo klikiem w przycisk w sidebarze.
// Szuka po kontekstach, projektach, taskach, pomyslach, problemach.
// Klik w wynik → nawigacja do kontekstu lub projektu.

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { searchAction } from "@/app/(app)/search-action";
import type { SearchResult } from "@/lib/queries/search";
import { springSoft } from "@/lib/motion";

const TYPE_ICONS: Record<string, string> = {
  context: "📁",
  project: "📋",
  task: "✓",
  idea: "💡",
  problem: "!",
};

const TYPE_LABELS: Record<string, string> = {
  context: "Kontekst",
  project: "Projekt",
  task: "Zadanie",
  idea: "Pomysl",
  problem: "Problem",
};

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Focus na input po otwarciu
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const r = await searchAction(query);
        setResults(r);
        setSelectedIdx(0);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback(
    (result: SearchResult) => {
      onClose();
      if (result.type === "context") {
        router.push(`/c/${result.contextId}`);
      } else if (result.type === "project" && result.projectId) {
        router.push(`/c/${result.contextId}/p/${result.projectId}`);
      } else {
        // taski, pomysly, problemy → idz do kontekstu
        router.push(`/c/${result.contextId}`);
      }
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      navigate(results[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 100,
            }}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={springSoft}
            style={{
              position: "fixed",
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(520px, 90vw)",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
              zIndex: 101,
              overflow: "hidden",
            }}
          >
            {/* Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderBottom: "1px solid #eef0f3",
              }}
            >
              <Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Szukaj kontekstów, projektów, tasków..."
                style={{
                  flex: 1,
                  border: 0,
                  outline: "none",
                  font: "inherit",
                  fontSize: 15,
                  background: "transparent",
                }}
              />
              <button
                onClick={onClose}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Wyniki */}
            <div
              style={{
                maxHeight: 360,
                overflowY: "auto",
                padding: results.length > 0 ? "4px 0" : "0",
              }}
            >
              {query.length >= 2 && results.length === 0 && !pending && (
                <div
                  style={{
                    padding: "20px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Brak wynikow dla &quot;{query}&quot;
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.type}:${r.id}`}
                  onClick={() => navigate(r)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 16px",
                    border: 0,
                    background: i === selectedIdx ? "#f1f5f9" : "transparent",
                    font: "inherit",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ width: 20, textAlign: "center", flexShrink: 0 }}>
                    {TYPE_ICONS[r.type]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 500,
                      }}
                    >
                      {r.title}
                    </div>
                    {r.subtitle && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 1,
                        }}
                      >
                        {r.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      background: `${r.contextColor}22`,
                      color: r.contextColor,
                      flexShrink: 0,
                    }}
                  >
                    {r.contextName}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_LABELS[r.type]}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid #eef0f3",
                fontSize: 11,
                color: "#94a3b8",
                display: "flex",
                gap: 12,
              }}
            >
              <span>↑↓ nawigacja</span>
              <span>↵ otwórz</span>
              <span>esc zamknij</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
