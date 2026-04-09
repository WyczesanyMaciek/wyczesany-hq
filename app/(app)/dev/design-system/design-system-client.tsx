"use client";

// Client component — tu zyja animacje Framer Motion.

import { motion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  FolderOpen,
  CheckSquare,
  Lightbulb,
  AlertTriangle,
  Plus,
  Clock,
} from "lucide-react";
import { CONTEXT_PALETTE } from "@/lib/colors";
import { springSnappy, fadeUp } from "@/lib/motion";

export function DesignSystemClient() {
  return (
    <main className="p-12 max-w-[1200px]">
      {/* HERO */}
      <motion.header
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-20"
      >
        <div className="eyebrow mb-4">Wyczesany HQ · design system</div>
        <h1 className="display-1 mb-6">
          Neo-brutalist
          <br />
          warm.
        </h1>
        <p className="text-lg max-w-xl opacity-80">
          Grube bordery, twarde cienie offset, duze editorial naglowki,
          pastelowe tla per kontekst. Sprezyste spring physics.
        </p>
      </motion.header>

      {/* TYPOGRAFIA */}
      <Section eyebrow="01 / Typografia" title="Skala">
        <div className="brutal-card p-10 space-y-8">
          <TypeRow label="display-1" note="3.5rem · 900">
            <div className="display-1">Wyczesany HQ</div>
          </TypeRow>
          <TypeRow label="h1" note="2.75rem · 900">
            <h1 className="m-0">Dashboard Salonow</h1>
          </TypeRow>
          <TypeRow label="h2" note="2rem · 900">
            <h2 className="m-0">Projekty aktywne</h2>
          </TypeRow>
          <TypeRow label="h3" note="1.5rem · 900">
            <h3 className="m-0">Remont witryny Legnicka</h3>
          </TypeRow>
          <TypeRow label="h4" note="1.15rem · 800 · uppercase">
            <h4 className="m-0">Luzne taski</h4>
          </TypeRow>
          <TypeRow label="body" note="1rem · 500 · line 1.65">
            <p className="m-0 max-w-md">
              Jedno zrodlo prawdy dla wszystkich projektow. Konteksty,
              projekty, taski, pomysly, problemy — wszystko w jednym miejscu.
            </p>
          </TypeRow>
          <TypeRow label="eyebrow" note="0.8rem · 800 · tracking">
            <div className="eyebrow">Kontekst aktywny</div>
          </TypeRow>
        </div>
      </Section>

      {/* PALETA */}
      <Section eyebrow="02 / Paleta" title="Kolory + pastele">
        <div className="grid grid-cols-5 gap-4">
          {CONTEXT_PALETTE.map((c) => (
            <div key={c.hex} className="brutal-card overflow-hidden">
              <div
                className="h-24 border-b-[3px] border-[var(--ink)]"
                style={{ background: c.hex }}
              />
              <div className="h-10" style={{ background: c.soft }} />
              <div className="p-4">
                <div className="font-black text-sm">{c.name}</div>
                <div className="text-xs opacity-60 font-mono">{c.hex}</div>
                <div className="text-xs opacity-60 font-mono">{c.soft}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CIENIE */}
      <Section eyebrow="03 / Cienie" title="Hard offset, zero blur">
        <div className="grid grid-cols-4 gap-6">
          {[
            { name: "sm", shadow: "2px 2px 0 #1F1F2E" },
            { name: "md", shadow: "4px 4px 0 #1F1F2E" },
            { name: "lg", shadow: "6px 6px 0 #1F1F2E" },
            { name: "xl", shadow: "8px 8px 0 #1F1F2E" },
          ].map((s) => (
            <div
              key={s.name}
              className="bg-white border-[3px] border-[var(--ink)] rounded-xl p-6 h-32 flex flex-col justify-between"
              style={{ boxShadow: s.shadow }}
            >
              <div className="font-black text-2xl">{s.name}</div>
              <div className="text-xs font-mono opacity-60">{s.shadow}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* KARTY — 3 warianty */}
      <Section eyebrow="04 / Karty" title="3 warianty">
        <div className="grid grid-cols-3 gap-6">
          {/* Wariant 1 — prosta */}
          <motion.div
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 1, y: 1 }}
            transition={springSnappy}
            className="brutal-card brutal-card-hoverable p-6 cursor-pointer"
          >
            <div className="eyebrow mb-3">Wariant 1</div>
            <h3 className="mb-2">Prosta karta</h3>
            <p className="text-sm opacity-70 m-0">
              Biale tlo, grube bordery, twardy cien. Baza dla wszystkiego.
            </p>
          </motion.div>

          {/* Wariant 2 — z akcentem koloru (paskiem z lewej) */}
          <motion.div
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 1, y: 1 }}
            transition={springSnappy}
            className="brutal-card brutal-card-hoverable cursor-pointer overflow-hidden flex"
          >
            <div className="w-3 bg-[var(--ctx-fioletowy)] border-r-[3px] border-[var(--ink)]" />
            <div className="p-6 flex-1">
              <div className="eyebrow mb-3" style={{ color: "#5B3DF5" }}>
                Wariant 2 · Salony
              </div>
              <h3 className="mb-2">Z paskiem koloru</h3>
              <p className="text-sm opacity-70 m-0">
                Gruby pasek po lewej w kolorze kontekstu. Do kart projektow.
              </p>
            </div>
          </motion.div>

          {/* Wariant 3 — pelne tlo pastelowe */}
          <motion.div
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 1, y: 1 }}
            transition={springSnappy}
            className="brutal-card brutal-card-hoverable p-6 cursor-pointer"
            style={{ background: "#E8E2FE" }}
          >
            <div className="eyebrow mb-3" style={{ color: "#5B3DF5" }}>
              Wariant 3 · Salony
            </div>
            <h3 className="mb-2">Pastelowa</h3>
            <p className="text-sm opacity-80 m-0">
              Pastelowe tlo w kolorze kontekstu. Do sekcji dashboardu.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* STANY INTERAKCJI */}
      <Section eyebrow="05 / Interakcje" title="Hover, active, focus">
        <div className="brutal-card p-10 space-y-8">
          <div className="flex items-center gap-6 flex-wrap">
            <button className="brutal-btn">
              <Plus className="w-4 h-4" />
              Dodaj task
            </button>
            <button className="brutal-btn brutal-btn-primary">
              <Sparkles className="w-4 h-4" />
              Nowy projekt
            </button>
            <button className="brutal-btn">
              Zobacz wiecej
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm opacity-60 m-0">
            Hover: karta/button przesuwa sie o -2px, cien rosnie z md → lg.
            Active: wraca do +1px z cieniem sm (efekt wcisniecia).
          </p>
        </div>
      </Section>

      {/* IKONY SEKCJI */}
      <Section eyebrow="06 / Ikony sekcji" title="Kolor per typ">
        <div className="grid grid-cols-4 gap-6">
          {[
            {
              icon: FolderOpen,
              label: "Projekty",
              color: "#5B3DF5",
              soft: "#E8E2FE",
            },
            {
              icon: CheckSquare,
              label: "Taski",
              color: "#16A34A",
              soft: "#DDF3E2",
            },
            {
              icon: Lightbulb,
              label: "Pomysly",
              color: "#CA8A04",
              soft: "#FBEFCF",
            },
            {
              icon: AlertTriangle,
              label: "Problemy",
              color: "#DC2626",
              soft: "#FCE4E4",
            },
          ].map((s) => (
            <div key={s.label} className="brutal-card p-6 text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl border-[3px] border-[var(--ink)] flex items-center justify-center"
                style={{
                  background: s.soft,
                  boxShadow: "3px 3px 0 var(--ink)",
                }}
              >
                <s.icon className="w-7 h-7" style={{ color: s.color }} />
              </div>
              <div className="font-black text-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* LISTA Z ANIMACJA STAGGER (CSS rise-in + delay) */}
      <Section eyebrow="07 / Motion" title="Stagger list">
        <ul className="brutal-card p-4 space-y-3 list-none m-0">
          {[
            { title: "Remont witryny Legnicka", ctx: "Salony / WFM / Legnicka", color: "#5B3DF5" },
            { title: "Rekrutacja stylistki", ctx: "Salony / WFM / Lodzka", color: "#5B3DF5" },
            { title: "Kampania letnia NBS", ctx: "Not Bad Stuff", color: "#DC2626" },
            { title: "Live #12 z Alim", ctx: "Marka Osobista / Live", color: "#FF6B4A" },
            { title: "Kurs strzyzenia — plan", ctx: "Szkolenia", color: "#F97316" },
          ].map((t, i) => (
            <li
              key={t.title}
              className="rise-in brutal-card brutal-card-hoverable p-4 cursor-pointer flex items-center gap-4"
              style={{
                boxShadow: "3px 3px 0 var(--ink)",
                animationDelay: `${i * 70}ms`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg border-[3px] border-[var(--ink)] flex items-center justify-center shrink-0"
                style={{ background: t.color }}
              >
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black">{t.title}</div>
                <div className="text-xs opacity-60 font-mono">{t.ctx}</div>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Clock className="w-3 h-3" />
                za 3 dni
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* BADGE KONTEKSTU */}
      <Section eyebrow="08 / Badge kontekstu" title="Skad pochodzi element">
        <div className="brutal-card p-8 flex flex-wrap gap-3">
          {[
            { name: "Salony", color: "#5B3DF5", soft: "#E8E2FE" },
            { name: "Not Bad Stuff", color: "#DC2626", soft: "#FCE4E4" },
            { name: "Szkolenia", color: "#F97316", soft: "#FEE7D0" },
            { name: "Legnicka", color: "#5B3DF5", soft: "#E8E2FE" },
            { name: "Marka Osobista", color: "#FF6B4A", soft: "#FFE1D8" },
          ].map((b) => (
            <span
              key={b.name}
              className="inline-flex items-center gap-2 px-3 py-1.5 border-[2px] border-[var(--ink)] rounded-full text-xs font-black"
              style={{ background: b.soft }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: b.color }}
              />
              {b.name}
            </span>
          ))}
        </div>
      </Section>

      <footer className="mt-20 pb-10 opacity-50 text-sm">
        Wyczesany HQ · design system · Etap 2.5
      </footer>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-20">
      <div className="eyebrow mb-2">{eyebrow}</div>
      <h2 className="mb-8">{title}</h2>
      {children}
    </section>
  );
}

function TypeRow({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-8 pb-6 border-b-2 border-dashed border-[var(--ink)]/20 last:border-0 last:pb-0">
      <div className="w-32 shrink-0">
        <div className="font-mono text-xs font-black">{label}</div>
        <div className="font-mono text-xs opacity-50">{note}</div>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
