// /dev/colors — narzedzie deweloperskie.
// Pokazuje palete kontekstow + podglady jak wyglada aktywny kontekst
// z kazdym z kolorow + test dziedziczenia rodzic -> dzieci.

import { CONTEXT_PALETTE, hexToRgba } from "@/lib/colors";

export const metadata = { title: "Paleta kolorow — Wyczesany HQ" };

function ContextRowPreview({
  name,
  color,
  active = false,
  indent = 0,
}: {
  name: string;
  color: string;
  active?: boolean;
  indent?: number;
}) {
  return (
    <div
      className="flex items-center py-2 pr-3 rounded-md transition-colors"
      style={{
        paddingLeft: `${12 + indent * 18}px`,
        background: active ? hexToRgba(color, 0.13) : "transparent",
        borderLeft: active ? `3px solid ${color}` : "3px solid transparent",
        fontWeight: active ? 800 : 600,
      }}
    >
      <span
        className="inline-block w-2.5 h-2.5 rounded-full mr-2.5 shrink-0"
        style={{ background: color }}
      />
      <span className="text-[15px]">{name}</span>
    </div>
  );
}

export default function ColorsDevPage() {
  return (
    <main className="p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-2">Paleta kolorow kontekstow</h1>
        <p className="opacity-70">
          Narzedzie deweloperskie — podglad wszystkich kolorow i ich zachowania
          w sidebarze (kropka, aktywne tlo, border-left, font-weight 800).
        </p>
      </div>

      {/* === 10 swatchy === */}
      <section className="mb-12">
        <h2 className="mb-4">Swatche</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CONTEXT_PALETTE.map((c) => (
            <div
              key={c.hex}
              className="border-[3px] border-[var(--border-strong)] rounded-xl overflow-hidden bg-white/60"
            >
              {/* Kafelek */}
              <div
                className="h-24 w-full"
                style={{ background: c.hex }}
                aria-label={c.name}
              />
              {/* Nazwa + hex */}
              <div className="px-3 py-2 border-t-[2px] border-[var(--border-strong)]">
                <div className="font-extrabold text-base">{c.name}</div>
                <div className="text-xs opacity-60 font-mono">{c.hex}</div>
              </div>
              {/* Przyklad: rzad nieaktywny */}
              <div className="border-t-[1px] border-black/10">
                <ContextRowPreview name="Salony" color={c.hex} />
              </div>
              {/* Przyklad: rzad aktywny */}
              <div className="border-t-[1px] border-black/10">
                <ContextRowPreview name="Salony" color={c.hex} active />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === Test dziedziczenia rodzic -> dzieci === */}
      <section className="mb-12">
        <h2 className="mb-2">Dziedziczenie rodzic &rarr; dzieci</h2>
        <p className="opacity-70 mb-4 text-[15px]">
          Dzieci bez wlasnego koloru dostaja kolor rodzica. Drugi wiersz
          (WFM) jest aktywny — pokazuje jasne tlo i border-left.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONTEXT_PALETTE.slice(0, 4).map((c) => (
            <div
              key={c.hex}
              className="border-[3px] border-[var(--border-strong)] rounded-xl p-3 bg-[#F5F1E8] w-full"
            >
              <div className="text-xs opacity-60 mb-2 px-2 font-bold uppercase">
                {c.name} · {c.hex}
              </div>
              <ContextRowPreview name="Salony" color={c.hex} />
              <ContextRowPreview name="WFM" color={c.hex} indent={1} active />
              <ContextRowPreview name="Legnicka" color={c.hex} indent={2} />
              <ContextRowPreview name="Lodzka" color={c.hex} indent={2} />
              <ContextRowPreview name="Zakladowa" color={c.hex} indent={2} />
              <ContextRowPreview name="Luxfera" color={c.hex} indent={1} />
              <ContextRowPreview name="Glogow" color={c.hex} indent={1} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
