// Widok dashboardu — uzywany zarowno w /c/[id] jak i w / (global).
// Kierunek: Neo-brutalist warm — grube bordery, twarde cienie offset,
// editorial naglowki, pastelowe tla sekcji, spring physics na hover.
// Dane (4 sekcje + historia) przyjmowane jako props — server component je ladowal.

import Link from "next/link";
import {
  CalendarDays,
  Flame,
  Archive,
  Sparkles,
} from "lucide-react";
import type { DashboardData, OriginContext } from "@/lib/queries/dashboard";
import { softOf } from "@/lib/colors";
import { DashboardSectionCard, type SectionTheme } from "./section-card";

// ---- pomocnicze ----

function ContextBadge({ ctx }: { ctx: OriginContext }) {
  return (
    <Link
      href={`/c/${ctx.id}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border-[2px] border-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
      style={{ background: softOf(ctx.color) }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: ctx.color }}
      />
      {ctx.name}
    </Link>
  );
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}

function PriorityFlame({ priority }: { priority: number }) {
  if (priority < 2) return null;
  const color = priority === 3 ? "#DC2626" : "#F97316";
  return <Flame className="w-4 h-4" style={{ color }} />;
}

// ---- sekcyjne konfiguracje ikon per typ ----

const SECTION_THEME: Record<string, SectionTheme> = {
  projects: { iconKey: "projects", color: "#5B3DF5", soft: "#E8E2FE", label: "Projekty" },
  tasks: { iconKey: "tasks", color: "#16A34A", soft: "#DDF3E2", label: "Luzne taski" },
  ideas: { iconKey: "ideas", color: "#CA8A04", soft: "#FBEFCF", label: "Pomysly" },
  problems: { iconKey: "problems", color: "#DC2626", soft: "#FCE4E4", label: "Problemy" },
};

type Props = {
  data: DashboardData;
  ownContextId: string | null;
};

export function DashboardView({ data, ownContextId }: Props) {
  const { current, projects, looseTasks, doneTasks, ideas, problems } = data;

  return (
    <main className="p-12 max-w-[1200px]">
      {/* HERO */}
      <header className="mb-14">
        {current ? (
          <>
            {current.breadcrumb.length > 1 && (
              <nav className="eyebrow mb-4 flex items-center gap-2 flex-wrap">
                {current.breadcrumb.slice(0, -1).map((c) => (
                  <span key={c.id} className="flex items-center gap-2">
                    <Link
                      href={`/c/${c.id}`}
                      className="hover:underline"
                      style={{ color: c.color }}
                    >
                      {c.name}
                    </Link>
                    <span className="opacity-50">/</span>
                  </span>
                ))}
              </nav>
            )}
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl border-[3px] border-[var(--ink)] shrink-0"
                style={{
                  background: current.color,
                  boxShadow: "4px 4px 0 var(--ink)",
                }}
              />
              <h1 className="display-1 m-0">{current.name}</h1>
            </div>
          </>
        ) : (
          <>
            <div className="eyebrow mb-4">Widok globalny</div>
            <h1 className="display-1 m-0 flex items-center gap-4">
              Wszystko naraz
              <Sparkles className="w-10 h-10 text-[var(--ctx-pomaranczowy)]" />
            </h1>
            <p className="mt-4 text-lg opacity-70 max-w-2xl">
              Kazdy projekt, task, pomysl i problem z calej aplikacji.
              Badge przy elemencie mowi skad pochodzi.
            </p>
          </>
        )}
      </header>

      {/* Siatka 4 sekcji */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projekty */}
        <DashboardSectionCard
          theme={SECTION_THEME.projects}
          count={projects.length}
          delayMs={0}
        >
          {projects.length === 0 ? (
            <EmptyRow text="Brak projektow" />
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="px-6 py-4 hover:bg-black/[0.03] transition-colors"
              >
                <div className="font-black text-[17px] leading-tight">{p.name}</div>
                {p.description && (
                  <div className="text-sm opacity-70 mt-1 line-clamp-2">
                    {p.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border-[2px] border-[var(--ink)] bg-white font-black uppercase tracking-wider">
                    {p.status}
                  </span>
                  {p.deadline && (
                    <span className="text-xs flex items-center gap-1 opacity-70 font-bold">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(p.deadline)}
                    </span>
                  )}
                  {p.context.id !== ownContextId && (
                    <ContextBadge ctx={p.context} />
                  )}
                </div>
              </div>
            ))
          )}
        </DashboardSectionCard>

        {/* Luzne taski */}
        <DashboardSectionCard
          theme={SECTION_THEME.tasks}
          count={looseTasks.length}
          delayMs={80}
        >
          {looseTasks.length === 0 ? (
            <EmptyRow text="Brak luznych taskow" />
          ) : (
            looseTasks.map((t) => (
              <div
                key={t.id}
                className="px-6 py-3 hover:bg-black/[0.03] flex items-center gap-3 transition-colors"
              >
                <span className="inline-block w-5 h-5 rounded border-[2.5px] border-[var(--ink)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold">{t.title}</span>
                    <PriorityFlame priority={t.priority} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {t.deadline && (
                      <span className="text-xs flex items-center gap-1 opacity-70 font-bold">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(t.deadline)}
                      </span>
                    )}
                    {t.context.id !== ownContextId && (
                      <ContextBadge ctx={t.context} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardSectionCard>

        {/* Pomysly */}
        <DashboardSectionCard
          theme={SECTION_THEME.ideas}
          count={ideas.length}
          delayMs={160}
        >
          {ideas.length === 0 ? (
            <EmptyRow text="Brak pomyslow" />
          ) : (
            ideas.map((i) => (
              <div
                key={i.id}
                className="px-6 py-3 hover:bg-black/[0.03] transition-colors"
              >
                <div className="text-[15px] font-semibold leading-snug">
                  {i.content}
                </div>
                {i.context.id !== ownContextId && (
                  <div className="mt-1.5">
                    <ContextBadge ctx={i.context} />
                  </div>
                )}
              </div>
            ))
          )}
        </DashboardSectionCard>

        {/* Problemy */}
        <DashboardSectionCard
          theme={SECTION_THEME.problems}
          count={problems.length}
          delayMs={240}
        >
          {problems.length === 0 ? (
            <EmptyRow text="Brak problemow" />
          ) : (
            problems.map((pr) => (
              <div
                key={pr.id}
                className="px-6 py-3 hover:bg-black/[0.03] transition-colors"
              >
                <div className="text-[15px] font-semibold leading-snug">
                  {pr.content}
                </div>
                {pr.context.id !== ownContextId && (
                  <div className="mt-1.5">
                    <ContextBadge ctx={pr.context} />
                  </div>
                )}
              </div>
            ))
          )}
        </DashboardSectionCard>
      </div>

      {/* Historia — zakonczone taski */}
      {doneTasks.length > 0 && (
        <details className="mt-10 brutal-card overflow-hidden group rise-in" style={{ animationDelay: "320ms" }}>
          <summary className="flex items-center gap-3 px-6 py-5 cursor-pointer hover:bg-black/[0.03] list-none">
            <div
              className="w-10 h-10 rounded-xl border-[2.5px] border-[var(--ink)] flex items-center justify-center"
              style={{ background: "#E6E9ED", boxShadow: "3px 3px 0 var(--ink)" }}
            >
              <Archive className="w-5 h-5" style={{ color: "#64748B" }} />
            </div>
            <div>
              <div className="eyebrow">Archiwum</div>
              <h3 className="m-0">Historia</h3>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-sm font-black border-[2.5px] border-[var(--ink)] bg-white">
              {doneTasks.length}
            </span>
          </summary>
          <div className="border-t-[3px] border-[var(--ink)]">
            {doneTasks.map((t) => (
              <div
                key={t.id}
                className="px-6 py-3 flex items-center gap-3 opacity-60 border-b border-[var(--ink)]/10 last:border-b-0"
              >
                <span className="inline-block w-5 h-5 rounded border-[2.5px] border-[var(--ink)] bg-[var(--ink)]" />
                <span className="line-through font-bold">{t.title}</span>
                {t.context.id !== ownContextId && (
                  <span className="ml-auto">
                    <ContextBadge ctx={t.context} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-6 py-8 text-center opacity-40 italic font-semibold">
      {text}
    </div>
  );
}
