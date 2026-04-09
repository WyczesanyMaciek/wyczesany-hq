// Wyczesany HQ — paleta kolorow kontekstow.
// Uzywana w modalu dodawania/edycji kontekstu i w /dev/colors.

export type ColorSwatch = {
  hex: string;
  name: string;
  soft: string; // pastelowy wariant — tla sekcji
};

export const CONTEXT_PALETTE: ColorSwatch[] = [
  { hex: "#5B3DF5", name: "Fioletowy", soft: "#E8E2FE" },
  { hex: "#DC2626", name: "Czerwony", soft: "#FCE4E4" },
  { hex: "#F97316", name: "Pomaranczowy", soft: "#FEE7D0" },
  { hex: "#FF6B4A", name: "Koralowy", soft: "#FFE1D8" },
  { hex: "#64748B", name: "Szary", soft: "#E6E9ED" },
  { hex: "#16A34A", name: "Zielony", soft: "#DDF3E2" },
  { hex: "#0D9488", name: "Turkusowy", soft: "#D5EEEA" },
  { hex: "#DB2777", name: "Rozowy", soft: "#FBDDEB" },
  { hex: "#2563EB", name: "Niebieski", soft: "#DCE7FB" },
  { hex: "#CA8A04", name: "Zolty", soft: "#FBEFCF" },
];

/** Znajdz pastelowy wariant po hex. Jak nie ma — policz. */
export function softOf(hex: string): string {
  const swatch = CONTEXT_PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  if (swatch) return swatch.soft;
  return hexToRgba(hex, 0.14);
}

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
