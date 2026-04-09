// Widok dashboardu — uzywany zarowno w /c/[id] jak i w / (global).
// Server component: czyta dane raz, renderuje 4 sekcje + historie.

import Link from "next/link";
import {
  FolderKanban,
  ListTodo,
  Lightbulb,
  AlertTriangle,
  CalendarDays,
  Flame,
  Archive,
} from "lucide-react";
import type { DashboardData, OriginContext } from "@/lib/queries/dashboard";
import { hexToRgba } from "@/lib/colors";

// Badge z nazwa kontekstu pochodzenia — pokazywany tylko dla „obcych"
// elementow (zagregowanych z dzieci, nie wlasnych).
function ContextBadge({ ctx }: { ctx: OriginContext }) {
  return (
    <Link
      href={`/c/${ctx.id}`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold hover:underline"
      style={{
        background: hexToRgba(ctx.color, 0.15),
        color: ctx.color,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: ctx.color }}
      />
      {ctx.name}
    </Link>
  );
}

function SectionCard({
  title,
  icon: Icon,
  count,
  color,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-[3px] rounded-2xl bg-white/60 overflow-hidden"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <header
        className="flex items-center gap-3 px-5 py-4 border-b-[3px]"
        style={{
          borderColor: "var(--border-strong)",
          background: hexToRgba(color, 0.08),
        }}
      >
        <Icon className="w-5 h-5" />
        <h2 className="m-0 text-xl">{title}</h2>
        <span
          className="ml-auto px-2.5 py-0.5 rounded-full text-sm font-bold"
          style={{ background: hexToRgba(color, 0.18), color }}
        >
          {count}
        </span>
      </header>
      <div className="divide-y-2 divide-[var(--border-strong)]/10">
        {children}
      </div>
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-5 py-4 opacity-50 italic">{text}</div>;
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

type Props = {
  data: DashboardData;
  // Jesli podany, elementy z tego contextId nie pokazuja badge'a
  // (bo wiadomo ze to „tu"). Dla globalnego = null, wszystkie maja badge.
  ownContextId: string | null;
};

export function DashboardView({ data, ownContextId }: Props) {
  const { current, projects, looseTasks, doneTasks, ideas, problems } = data;

  // Kolor akcentu: kontekst biezacy albo szary dla globalnego
  const accent = current?.color ?? "#64748B";

  return (
    <main className="p-10 max-w-5xl">
      {/* Naglowek */}
      <header className="mb-8">
        {current ? (
          <>
            {/* Breadcrumb */}
            {current.breadcrumb.length > 1 && (
              <nav className="flex items-center gap-1.5 text-sm mb-3 opacity-70">
                {current.breadcrumb.map((c, i) => (
                  <span key={c.id} className="flex items-center gap-1.5">
                    {i > 0 && <span>›</span>}
                    {i < current.breadcrumb.length - 1 ? (
                      <Link href={`/c/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    ) : (
                      <span className="font-bold" style={{ color: c.color }}>
                        {c.name}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-5 h-5 rounded-full border-2"
                style={{
                  background: current.color,
                  borderColor: "var(--border-strong)",
                }}
              />
              <h1 className="m-0">{current.name}</h1>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="m-0">Dashboard globalny</h1>
            <span className="text-sm opacity-60 mt-2">
              wszystko ze wszystkich kontekstow
            </span>
          </div>
        )}
      </header>

      {/* Siatka sekcji — 2 kolumny na duzym, 1 na malym */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projekty */}
        <SectionCard
          title="Projekty"
          icon={FolderKanban}
          count={projects.length}
          color={accent}
        >
          {projects.length === 0 ? (
            <EmptyRow text="Brak projektow" />
          ) : (
            projects.map((p) => (
              <div key={p.id} className="px-5 py-4 hover:bg-black/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base">{p.name}</div>
                    {p.description && (
                      <div className="text-sm opacity-70 mt-0.5 line-clamp-2">
                        {p.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 font-bold uppercase tracking-wide">
                        {p.status}
                      </span>
                      {p.deadline && (
                        <span className="text-xs flex items-center gap-1 opacity-70">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(p.deadline)}
                        </span>
                      )}
                      {p.context.id !== ownContextId && (
                        <ContextBadge ctx={p.context} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </SectionCard>

        {/* Luzne taski */}
        <SectionCard
          title="Luzne taski"
          icon={ListTodo}
          count={looseTasks.length}
          color={accent}
        >
          {looseTasks.length === 0 ? (
            <EmptyRow text="Brak taskow" />
          ) : (
            looseTasks.map((t) => (
              <div
                key={t.id}
                className="px-5 py-3 hover:bg-black/[0.02] flex items-center gap-3"
              >
                <span className="inline-block w-4 h-4 rounded border-2 border-[var(--border-strong)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.title}</span>
                    <PriorityFlame priority={t.priority} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {t.deadline && (
                      <span className="text-xs flex items-center gap-1 opacity-70">
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
        </SectionCard>

        {/* Pomysly */}
        <SectionCard
          title="Pomysly"
          icon={Lightbulb}
          count={ideas.length}
          color={accent}
        >
          {ideas.length === 0 ? (
            <EmptyRow text="Brak pomyslow" />
          ) : (
            ideas.map((i) => (
              <div key={i.id} className="px-5 py-3 hover:bg-black/[0.02]">
                <div className="text-base">{i.content}</div>
                {i.context.id !== ownContextId && (
                  <div className="mt-1.5">
                    <ContextBadge ctx={i.context} />
                  </div>
                )}
              </div>
            ))
          )}
        </SectionCard>

        {/* Problemy */}
        <SectionCard
          title="Problemy"
          icon={AlertTriangle}
          count={problems.length}
          color={accent}
        >
          {problems.length === 0 ? (
            <EmptyRow text="Brak problemow" />
          ) : (
            problems.map((pr) => (
              <div key={pr.id} className="px-5 py-3 hover:bg-black/[0.02]">
                <div className="text-base">{pr.content}</div>
                {pr.context.id !== ownContextId && (
                  <div className="mt-1.5">
                    <ContextBadge ctx={pr.context} />
                  </div>
                )}
              </div>
            ))
          )}
        </SectionCard>
      </div>

      {/* Historia — zakonczone taski, zwijana sekcja */}
      {doneTasks.length > 0 && (
        <details className="mt-8 border-[3px] border-[var(--border-strong)] rounded-2xl bg-white/40 overflow-hidden group">
          <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-black/[0.03] list-none">
            <Archive className="w-5 h-5 opacity-70" />
            <h2 className="m-0 text-xl opacity-80">Historia</h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-sm font-bold bg-black/5">
              {doneTasks.length}
            </span>
            <span className="text-sm opacity-60 group-open:hidden">pokaz</span>
            <span className="text-sm opacity-60 hidden group-open:inline">ukryj</span>
          </summary>
          <div className="divide-y-2 divide-[var(--border-strong)]/10 border-t-[3px] border-[var(--border-strong)]">
            {doneTasks.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center gap-3 opacity-60">
                <span className="inline-block w-4 h-4 rounded border-2 border-[var(--border-strong)] bg-[var(--border-strong)]" />
                <span className="line-through">{t.title}</span>
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
