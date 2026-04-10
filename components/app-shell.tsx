"use client";

// AppShell — wrapper kliencki na sidebar + search dialog.
// Trzyma state otwarcia searcha, podlacza skrot "/".
// Udostepnia callback openSearch przez React context.

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useHotkeys } from "@/lib/use-hotkeys";
import { SearchDialog } from "./search-dialog";

const SearchCtx = createContext<(() => void) | null>(null);

export function useOpenSearch() {
  return useContext(SearchCtx);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  const hotkeys = useMemo(() => ({
    "/": () => setSearchOpen(true),
  }), []);
  useHotkeys(hotkeys);

  return (
    <SearchCtx.Provider value={openSearch}>
      {children}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </SearchCtx.Provider>
  );
}
