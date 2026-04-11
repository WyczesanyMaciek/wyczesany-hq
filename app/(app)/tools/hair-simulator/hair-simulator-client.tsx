"use client";

// Symulator cięcia włosów — klient.
// Cel: nauczyć fryzjerów wyobraźni. Pokazuje jak zmiana elewacji pasma (0-180°)
// wpływa na finalny kształt po cięciu. Fizyka uproszczona, cel edukacyjny.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import { Scissors, RotateCcw } from "lucide-react";
import {
  buildRoots,
  strandDirection,
  strandTip,
  cutLength,
  cutLineEndpoints,
  classifyShape,
  shapeLabelPL,
  type Point,
} from "@/lib/hair-sim";
import { springSnappy } from "@/lib/motion";

// Parametry świata symulacji.
// Dobrane tak, żeby L > max cut length (żeby blunt cut przy θ=0° był czysty) i
// jednocześnie wszystkie końcówki mieściły się w viewBox we wszystkich skrajnych
// elewacjach (0°, 90°, 180°). Max cut length przy θ=0° = D + R·sin(half_arc) ≈ 283,
// więc L musi być ≥ 283.
const HEAD_RADIUS = 110;
const HEAD_CX = 540;
const HEAD_CY = 420;
const NATURAL_LENGTH = 300;
const CUT_DISTANCE = 180; // odległość linii cięcia od środka głowy
const ARC_DEG = 140;
const STRAND_COUNT = 15;
const VIEWBOX_W = 900;
const VIEWBOX_H = 850;

// Transformacja: math (y w górę) → SVG (y w dół), wycentrowane na głowie.
const toSvg = (p: Point) => ({ x: HEAD_CX + p.x, y: HEAD_CY - p.y });

type Phase = "idle" | "show-line" | "dissolving" | "falling" | "done";

export function HairSimulator() {
  const [elevation, setElevation] = useState(0); // 0-180 (stopnie)
  const [phase, setPhase] = useState<Phase>("idle");
  const [cutLengths, setCutLengths] = useState<number[] | null>(null);
  const [cutFromElevation, setCutFromElevation] = useState(0);
  const [fallAngle, setFallAngle] = useState(0);

  const roots = useMemo(
    () => buildRoots(STRAND_COUNT, HEAD_RADIUS, ARC_DEG),
    []
  );

  // Orkiestracja faz: show-line → dissolving → falling → done.
  useEffect(() => {
    if (phase === "show-line") {
      const t = setTimeout(() => setPhase("dissolving"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "dissolving") {
      const t = setTimeout(() => {
        setFallAngle(cutFromElevation);
        setPhase("falling");
      }, 450);
      return () => clearTimeout(t);
    }
    if (phase === "falling") {
      const controls = animate(cutFromElevation, 0, {
        duration: 0.95,
        ease: [0.4, 0.05, 0.25, 1],
        onUpdate: (v) => setFallAngle(v),
        onComplete: () => setPhase("done"),
      });
      return () => controls.stop();
    }
  }, [phase, cutFromElevation]);

  // Aktualny kąt renderowania pasm.
  const renderAngle = (() => {
    if (phase === "idle") return elevation;
    if (phase === "show-line" || phase === "dissolving") return cutFromElevation;
    if (phase === "falling") return fallAngle;
    return 0; // done
  })();

  // Aktualne długości pasm.
  // W fazie show-line kept strands są jeszcze pełne (cięcie właśnie się ZACZYNA,
  // czerwona linia się rysuje). Dopiero w dissolving kept strands skracają się
  // do docelowej długości, a odcięte końcówki "odpadają" jako osobne linie.
  const renderLengths = useMemo(() => {
    if (
      phase === "idle" ||
      phase === "show-line" ||
      cutLengths === null
    ) {
      return roots.map(() => NATURAL_LENGTH);
    }
    return cutLengths;
  }, [phase, cutLengths, roots]);

  const dir = strandDirection(renderAngle);

  // Linia cięcia — widoczna tylko w fazach show-line i dissolving.
  const cutLineVisible = phase === "show-line" || phase === "dissolving";
  const cutDir = strandDirection(cutFromElevation);
  const cutLine = cutLineEndpoints(cutDir, CUT_DISTANCE, 260);

  // Odcięte końcówki — widoczne tylko w dissolving. Każdy kawałek to odcinek
  // od punktu cięcia do pierwotnego końca pasma (przy elewacji cutFromElevation).
  const cutPieces = useMemo(() => {
    if (!cutLengths || phase !== "dissolving") {
      return [];
    }
    return roots.map((root, i) => {
      const keptLen = cutLengths[i];
      const cutStart = strandTip(root, cutDir, keptLen);
      const cutEnd = strandTip(root, cutDir, NATURAL_LENGTH);
      return { start: cutStart, end: cutEnd, length: NATURAL_LENGTH - keptLen };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cutLengths, roots, cutFromElevation]);

  const handleCut = () => {
    if (phase !== "idle") return;
    const d = strandDirection(elevation);
    const lengths = roots.map((r) =>
      cutLength(r, d, CUT_DISTANCE, NATURAL_LENGTH)
    );
    setCutLengths(lengths);
    setCutFromElevation(elevation);
    setPhase("show-line");
  };

  const handleReset = () => {
    setPhase("idle");
    setCutLengths(null);
    setCutFromElevation(0);
    setFallAngle(0);
    setElevation(0);
  };

  const shape = classifyShape(elevation);
  const shapeLabel = shapeLabelPL(shape);
  const isAnimating = phase !== "idle" && phase !== "done";
  const canCut = phase === "idle";

  return (
    <main className="p-8 md:p-12 max-w-[1280px] mx-auto">
      <header className="mb-8">
        <div
          className="text-[0.75rem] font-extrabold uppercase tracking-[0.18em] mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Wyczesany HQ · narzędzia
        </div>
        <h1
          className="text-[2.2rem] md:text-[2.8rem] font-black leading-[1.05] mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Symulator cięcia —<br />
          gradacja i warstwy
        </h1>
        <p
          className="text-[1.05rem] max-w-2xl leading-[1.6]"
          style={{ color: "var(--text-secondary)" }}
        >
          Uproszczony model głowy z pionowym pasmem 15 włosów. Przesuń suwak,
          żeby unieść pasmo, kliknij <b>Tnij</b>. Zobacz jak kąt elewacji
          zmienia kształt, który powstaje po opadnięciu włosów.
        </p>
      </header>

      {/* Główny panel: suwak + SVG */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "3px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--ink)",
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Kolumna suwaka */}
          <div
            className="flex flex-row lg:flex-col items-center justify-center gap-4 p-6 lg:w-[160px]"
            style={{
              borderRight: "2px solid var(--border-default)",
              background: "var(--bg-muted)",
            }}
          >
            <div
              className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] hidden lg:block"
              style={{ color: "var(--text-secondary)" }}
            >
              Elewacja
            </div>
            <div
              className="text-[2.5rem] font-black tabular-nums leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {Math.round(phase === "idle" ? elevation : cutFromElevation)}°
            </div>
            <div className="relative flex items-center justify-center my-2">
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                disabled={phase !== "idle"}
                aria-label="Kąt elewacji pasma"
                className="hair-slider"
              />
            </div>
            <div
              className="flex flex-col items-center gap-1 text-[0.7rem] font-bold hidden lg:flex"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span>180° góra</span>
              <span>90° bok</span>
              <span>0° dół</span>
            </div>
          </div>

          {/* SVG sceny */}
          <div className="flex-1 relative" style={{ minHeight: 560 }}>
            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              className="w-full h-auto block"
              style={{ background: "var(--bg-base)" }}
            >
              {/* Linia podłogi (delikatna pomoc wizualna) */}
              <line
                x1={60}
                x2={VIEWBOX_W - 40}
                y1={HEAD_CY + 400}
                y2={HEAD_CY + 400}
                stroke="var(--border-subtle)"
                strokeWidth={2}
                strokeDasharray="4 6"
              />

              {/* Głowa */}
              <circle
                cx={HEAD_CX}
                cy={HEAD_CY}
                r={HEAD_RADIUS}
                fill="var(--bg-surface)"
                stroke="var(--ink)"
                strokeWidth={3}
              />
              {/* Oznaczenie przodu głowy (nos) — dla orientacji */}
              <circle
                cx={HEAD_CX - HEAD_RADIUS + 4}
                cy={HEAD_CY}
                r={4}
                fill="var(--ink)"
              />

              {/* Pasma włosów — kept segment.
                  W idle używamy spring (ładny feel przy dragu suwaka).
                  W pozostałych fazach motion.line dostaje duration: 0 —
                  animacja opadania napędzana jest przez fallAngle (useEffect +
                  animate), a kolejne klatki React-a dostarczają nowe x2/y2. */}
              {roots.map((root, i) => {
                const rootSvg = toSvg(root);
                const tip = strandTip(root, dir, renderLengths[i]);
                const tipSvg = toSvg(tip);
                return (
                  <motion.line
                    key={`strand-${i}`}
                    x1={rootSvg.x}
                    y1={rootSvg.y}
                    x2={tipSvg.x}
                    y2={tipSvg.y}
                    stroke="#2B2B3A"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    animate={{ x2: tipSvg.x, y2: tipSvg.y }}
                    transition={
                      phase === "idle" ? springSnappy : { duration: 0 }
                    }
                  />
                );
              })}

              {/* Odcięte końcówki (dissolve) */}
              <AnimatePresence>
                {cutLineVisible &&
                  cutPieces.map((piece, i) => {
                    const a = toSvg(piece.start);
                    const b = toSvg(piece.end);
                    return (
                      <motion.line
                        key={`cut-${i}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="#2B2B3A"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        initial={{ opacity: 1, y: 0 }}
                        animate={
                          phase === "dissolving"
                            ? { opacity: 0, y: 80 }
                            : { opacity: 1, y: 0 }
                        }
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeIn" }}
                      />
                    );
                  })}
              </AnimatePresence>

              {/* Linia cięcia (czerwona przerywana) */}
              <AnimatePresence>
                {cutLineVisible && (
                  <motion.line
                    key="cut-line"
                    x1={toSvg(cutLine.a).x}
                    y1={toSvg(cutLine.a).y}
                    x2={toSvg(cutLine.b).x}
                    y2={toSvg(cutLine.b).y}
                    stroke="#E11D48"
                    strokeWidth={3}
                    strokeDasharray="10 7"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Etykieta kąta przy głowie */}
              {phase !== "idle" && (
                <text
                  x={HEAD_CX}
                  y={HEAD_CY - HEAD_RADIUS - 16}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={800}
                  fill="var(--text-secondary)"
                  style={{ fontFamily: "var(--font-family)" }}
                >
                  cięcie przy {Math.round(cutFromElevation)}°
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Pasek kontrolny */}
        <div
          className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-6"
          style={{ borderTop: "2px solid var(--border-default)" }}
        >
          <button
            onClick={handleCut}
            disabled={!canCut}
            className="flex items-center justify-center gap-2 px-8 py-4 text-[1.1rem] font-extrabold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[1px] active:translate-y-[1px]"
            style={{
              background: canCut ? "#E11D48" : "var(--bg-muted)",
              color: canCut ? "#FFFFFF" : "var(--text-tertiary)",
              border: "3px solid var(--ink)",
              boxShadow: canCut ? "4px 4px 0 var(--ink)" : "none",
            }}
          >
            <Scissors size={20} strokeWidth={2.5} />
            Tnij
          </button>

          <button
            onClick={handleReset}
            disabled={isAnimating}
            className="flex items-center justify-center gap-2 px-6 py-4 text-[1rem] font-extrabold rounded-xl transition-all disabled:opacity-40 active:translate-x-[1px] active:translate-y-[1px]"
            style={{
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "3px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
            }}
          >
            <RotateCcw size={18} strokeWidth={2.5} />
            Reset
          </button>

          <div
            className="flex-1 flex flex-col justify-center px-4 py-3 rounded-xl"
            style={{
              background: "var(--bg-muted)",
              border: "2px solid var(--border-default)",
            }}
          >
            <div
              className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Kształt
            </div>
            <div
              className="text-[1.25rem] font-black leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {shapeLabel.title}
            </div>
            <div
              className="text-[0.9rem] leading-snug"
              style={{ color: "var(--text-secondary)" }}
            >
              {shapeLabel.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Ściągawka pedagogiczna */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CheatCard
          angle="0°"
          title="Jedna długość"
          desc="Pasmo zwisa naturalnie. Cięcie poziome = blunt bob, wszystkie końcówki równo."
        />
        <CheatCard
          angle="45°"
          title="Gradacja"
          desc="Pasmo skośnie. Po opadnięciu powstaje klin — krótsze warstwy na górze, waga u dołu."
        />
        <CheatCard
          angle="90°"
          title="Warstwy"
          desc="Pasmo poziomo od głowy. Wynik: zróżnicowanie długości wzdłuż pasma."
        />
        <CheatCard
          angle="180°"
          title="Długie warstwy"
          desc="Pasmo uniesione pionowo do góry (over-direction). Dramatyczna różnica długości."
        />
      </section>

      {/* CSS pionowego suwaka — lokalny, żeby nie rozpierać globali. */}
      <style jsx>{`
        .hair-slider {
          -webkit-appearance: slider-vertical;
          appearance: slider-vertical;
          writing-mode: vertical-lr;
          direction: rtl;
          width: 30px;
          height: 320px;
          background: transparent;
          cursor: pointer;
        }
        .hair-slider::-webkit-slider-runnable-track {
          width: 10px;
          background: var(--border-default);
          border-radius: 6px;
          border: 2px solid var(--ink);
        }
        .hair-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 20px;
          background: #E11D48;
          border: 3px solid var(--ink);
          border-radius: 6px;
          box-shadow: 2px 2px 0 var(--ink);
          cursor: grab;
        }
        .hair-slider::-moz-range-track {
          width: 10px;
          background: var(--border-default);
          border-radius: 6px;
          border: 2px solid var(--ink);
        }
        .hair-slider::-moz-range-thumb {
          width: 28px;
          height: 20px;
          background: #E11D48;
          border: 3px solid var(--ink);
          border-radius: 6px;
          box-shadow: 2px 2px 0 var(--ink);
          cursor: grab;
        }
        .hair-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

function CheatCard({
  angle,
  title,
  desc,
}: {
  angle: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{
        background: "var(--bg-surface)",
        border: "2px solid var(--ink)",
        boxShadow: "3px 3px 0 var(--ink)",
      }}
    >
      <div
        className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        Elewacja {angle}
      </div>
      <div
        className="text-[1.1rem] font-black mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </div>
      <div
        className="text-[0.88rem] leading-snug"
        style={{ color: "var(--text-secondary)" }}
      >
        {desc}
      </div>
    </div>
  );
}
