// Prosty hook na globalne skroty klawiszowe.
// Nie odpala sie gdy focus jest w input/textarea/select.

import { useEffect } from "react";

type HotkeyMap = Record<string, () => void>;

export function useHotkeys(map: HotkeyMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map]);
}
