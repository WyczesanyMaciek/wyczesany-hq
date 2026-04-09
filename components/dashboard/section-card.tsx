"use client";

// Kafelek sekcji dashboardu — brutal card z pastelowym headerem,
// ikoną w kolorowym kwadracie, licznikem i zawartoscia w srodku.
// Ikonki sa mapowane po stringu zeby server component mogl je przekazac
// (bez przekazywania funkcji przez granice serwer/klient).

import {
  FolderOpen,
  CheckSquare,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

type IconKey = "projects" | "tasks" | "ideas" | "problems";

const ICONS: Record<IconKey, typeof FolderOpen> = {
  projects: FolderOpen,
  tasks: CheckSquare,
  ideas: Lightbulb,
  problems: AlertTriangle,
};

export type SectionTheme = {
  iconKey: IconKey;
  color: string;
  soft: string;
  label: string;
};

export function DashboardSectionCard({
  theme,
  count,
  delayMs,
  children,
}: {
  theme: SectionTheme;
  count: number;
  delayMs: number;
  children: React.ReactNode;
}) {
  const Icon = ICONS[theme.iconKey];
  return (
    <section
      className="brutal-card overflow-hidden rise-in"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {/* Header sekcji — pastelowe tlo, duzy naglowek */}
      <header
        className="flex items-center gap-4 px-6 py-5 border-b-[3px] border-[var(--ink)]"
        style={{ background: theme.soft }}
      >
        <div
          className="w-12 h-12 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center shrink-0"
          style={{ background: "#FFFFFF", boxShadow: "3px 3px 0 var(--ink)" }}
        >
          <Icon className="w-6 h-6" style={{ color: theme.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="eyebrow"
            style={{ color: theme.color, opacity: 0.85 }}
          >
            Sekcja
          </div>
          <h3 className="m-0">{theme.label}</h3>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-black border-[2.5px] border-[var(--ink)]"
          style={{ background: "#FFFFFF" }}
        >
          {count}
        </div>
      </header>
      {/* Body */}
      <div className="divide-y-[1.5px] divide-[var(--ink)]/10">{children}</div>
    </section>
  );
}
