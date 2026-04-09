// Wspolne pure helpery dla dashboardu i stron projektu — formatowanie dat, priorytetu.
// Bez importow z React. Reusable wszedzie.

/** YYYY-MM-DD z Date, pod <input type="date">. */
export function toDateInput(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Krotki format daty po polsku: "9 kwi", "dziś", "jutro", "wczoraj", "zaległe". */
export function formatDue(d: Date | null): { text: string; late: boolean } | null {
  if (!d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: "zaległe", late: true };
  if (diff === 0) return { text: "dziś", late: true };
  if (diff === 1) return { text: "jutro", late: false };
  const months = [
    "sty",
    "lut",
    "mar",
    "kwi",
    "maj",
    "cze",
    "lip",
    "sie",
    "wrz",
    "paź",
    "lis",
    "gru",
  ];
  return { text: `${d.getDate()} ${months[d.getMonth()]}`, late: false };
}

/** Dlugi format daty: "9 kwietnia". */
export function formatDateLong(d: Date | null): string {
  if (!d) return "—";
  const months = [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** Priorytet -> klasa CSS (hi/md/lo/""); 3 = wysoki, 2 = srodek, 1 = niski. */
export function prioClass(p: number): string {
  if (p >= 3) return "hi";
  if (p === 2) return "md";
  if (p === 1) return "lo";
  return "";
}

/** Priorytet -> etykieta PL. */
export function prioLabel(p: number): string {
  if (p >= 3) return "Wysoki";
  if (p === 2) return "Średni";
  if (p === 1) return "Niski";
  return "Brak";
}
