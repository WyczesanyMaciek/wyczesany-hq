"use client";

// AppShell — wrapper kliencki na sidebar + search dialog + quick add.
// Trzyma state otwarcia searcha i quick add, podlacza skroty.
// Udostepnia callbacki przez React context.

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useHotkeys } from "@/lib/use-hotkeys";
import { SearchDialog } from "./search-dialog";
import { QuickAddModal } from "./dashboard/quick-add-modal";

type ContextOption = { id: string; name: string; color: string };
type ProjectOption = { id: string; name: string };

const SearchCtx = createContext<(() => void) | null>(null);
const QuickAddCtx = createContext<(() => void) | null>(null);

export function useOpenSearch() {
  return useContext(SearchCtx);
}

export function useOpenQuickAdd() {
  return useContext(QuickAddCtx);
}

export function AppShell({
  children,
  contexts = [],
  projects = [],
}: {
  children: React.ReactNode;
  contexts?: ContextOption[];
  projects?: ProjectOption[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);

  const hotkeys = useMemo(() => ({
    "/": () => setSearchOpen(true),
    n: () => setQuickAddOpen(true),
    N: () => setQuickAddOpen(true),
  }), []);
  useHotkeys(hotkeys);

  return (
    <SearchCtx.Provider value={openSearch}>
      <QuickAddCtx.Provider value={openQuickAdd}>
        {children}
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        <QuickAddModal
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          contexts={contexts}
          projects={projects}
          defaultContextId={contexts[0]?.id ?? null}
        />
      </QuickAddCtx.Provider>
    </SearchCtx.Provider>
  );
}
