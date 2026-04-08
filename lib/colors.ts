// Wyczesany HQ — paleta kolorow kontekstow.
// Uzywana w modalu dodawania/edycji kontekstu i w /dev/colors.

export type ColorSwatch = {
  hex: string;
  name: string;
};

export const CONTEXT_PALETTE: ColorSwatch[] = [
  { hex: "#5B3DF5", name: "Fioletowy" },
  { hex: "#DC2626", name: "Czerwony" },
  { hex: "#F97316", name: "Pomaranczowy" },
  { hex: "#FF6B4A", name: "Koralowy" },
  { hex: "#64748B", name: "Szary" },
  { hex: "#16A34A", name: "Zielony" },
  { hex: "#0D9488", name: "Turkusowy" },
  { hex: "#DB2777", name: "Rozowy" },
  { hex: "#2563EB", name: "Niebieski" },
  { hex: "#CA8A04", name: "Zolty" },
];

export const PALETTE_HEX_SET = new Set(CONTEXT_PALETTE.map((c) => c.hex));

/**
 * Zamien hex #RRGGBB na rgba string z zadana alpha.
 * Uzywane do jasnego wariantu tla aktywnego kontekstu.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
