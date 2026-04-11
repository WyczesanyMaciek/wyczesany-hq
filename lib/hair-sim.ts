// Wyczesany HQ — logika symulatora cięcia włosów.
// Narzędzie edukacyjne: pokazuje jak elewacja pasma wpływa na finalny kształt
// (jedna długość / gradacja / warstwy). Cała logika jest czysta i bez DOMu —
// komponent renderuje, ten plik tylko liczy.
//
// Konwencja współrzędnych: matematyczna (y w górę, x w prawo). Transformacja
// do SVG (y w dół) robiona dopiero przy renderze.

/** Punkt 2D (y w górę). */
export type Point = { x: number; y: number };

/** Wektor kierunku 2D (znormalizowany). */
export type Vec2 = { x: number; y: number };

/** Zamienia stopnie na radiany. */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Buduje pozycje korzeni włosów rozłożone równomiernie na łuku prawej strony
 * okręgu (środek 0,0, promień `radius`). Łuk idzie od `+arcDegrees/2` (góra)
 * do `-arcDegrees/2` (dół). Kolejność: od góry do dołu (indeks 0 = najwyżej).
 */
export function buildRoots(count: number, radius: number, arcDegrees: number): Point[] {
  if (count < 2) return [];
  const half = arcDegrees / 2;
  const step = arcDegrees / (count - 1);
  const roots: Point[] = [];
  for (let i = 0; i < count; i++) {
    const alpha = half - i * step; // od +half do -half
    roots.push({
      x: radius * Math.cos(toRad(alpha)),
      y: radius * Math.sin(toRad(alpha)),
    });
  }
  return roots;
}

/**
 * Kierunek pasma dla danego kąta elewacji (w stopniach, 0–180).
 *   0°   → pion w dół  (0, -1) — naturalne opadanie
 *   90°  → poziomo w prawo (1, 0) — pasmo prostopadle do boku głowy
 *   180° → pion w górę  (0, 1) — over-direction do czubka
 *
 * Wzór: d(θ) = (sin θ, -cos θ).
 */
export function strandDirection(thetaDeg: number): Vec2 {
  const t = toRad(thetaDeg);
  return { x: Math.sin(t), y: -Math.cos(t) };
}

/**
 * Końcówka pasma (bez cięcia) — od korzenia w kierunku `dir`, długość `length`.
 */
export function strandTip(root: Point, dir: Vec2, length: number): Point {
  return { x: root.x + dir.x * length, y: root.y + dir.y * length };
}

/**
 * Długość pasma po cięciu prostopadłym do kierunku `dir`, przecinającym płaszczyznę
 * w odległości `cutDistance` od środka głowy (punkt `G = cutDistance * dir`).
 *
 * Linia cięcia: { X : X · dir = cutDistance }.
 * Dla korzenia P i parametru t (t ≥ 0 wzdłuż pasma):
 *   (P + t·dir) · dir = cutDistance
 *   P · dir + t = cutDistance
 *   t = cutDistance - (P · dir)
 *
 * Zwracana wartość jest przycinana do [0, naturalLength] — jeśli linia cięcia
 * jest przed korzeniem (t ≤ 0), pasmo jest ścięte do zera; jeśli za końcem
 * (t > naturalLength), pasmo zostaje nieruszone.
 */
export function cutLength(
  root: Point,
  dir: Vec2,
  cutDistance: number,
  naturalLength: number
): number {
  const t = cutDistance - (root.x * dir.x + root.y * dir.y);
  if (t <= 0) return 0;
  if (t >= naturalLength) return naturalLength;
  return t;
}

/**
 * Dwa końce odcinka linii cięcia (w obrębie wygodnego pola widzenia `halfSpan`).
 * Linia prostopadła do `dir`, przechodząca przez `G = cutDistance * dir`.
 * Perp(dir) = (-dir.y, dir.x).
 */
export function cutLineEndpoints(
  dir: Vec2,
  cutDistance: number,
  halfSpan: number
): { a: Point; b: Point } {
  const cx = dir.x * cutDistance;
  const cy = dir.y * cutDistance;
  const px = -dir.y;
  const py = dir.x;
  return {
    a: { x: cx - px * halfSpan, y: cy - py * halfSpan },
    b: { x: cx + px * halfSpan, y: cy + py * halfSpan },
  };
}

/** Typ kształtu rozpoznany heurystycznie po kącie elewacji. */
export type HaircutShape = "blunt" | "graduation" | "uniform-layer" | "long-layer";

/**
 * Klasyfikacja kształtu po kącie (dla panelu info w UI).
 *   0°–15°    → jedna długość
 *   16°–60°   → gradacja
 *   61°–110°  → warstwy
 *   111°–180° → długie warstwy
 */
export function classifyShape(thetaDeg: number): HaircutShape {
  if (thetaDeg <= 15) return "blunt";
  if (thetaDeg <= 60) return "graduation";
  if (thetaDeg <= 110) return "uniform-layer";
  return "long-layer";
}

/** Polski opis kształtu — do wyświetlenia w UI. */
export function shapeLabelPL(shape: HaircutShape): { title: string; subtitle: string } {
  switch (shape) {
    case "blunt":
      return {
        title: "Jedna długość",
        subtitle: "Blunt bob — wszystkie końcówki na jednej linii.",
      };
    case "graduation":
      return {
        title: "Gradacja",
        subtitle: "Kształt klina, waga u dołu (stacked bob).",
      };
    case "uniform-layer":
      return {
        title: "Warstwy",
        subtitle: "Warstwowy układ dookoła linii cięcia.",
      };
    case "long-layer":
      return {
        title: "Długie warstwy",
        subtitle: "Góra krótsza, dół dłuższy (over-direction).",
      };
  }
}
