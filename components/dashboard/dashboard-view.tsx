// Widok dashboardu — uzywany zarowno w /c/[id] jak i w / (global).
// Kierunek: Neo-brutalist warm — grube bordery, twarde cienie offset,
// editorial naglowki, pastelowe tla sekcji, spring physics na hover.
// Dane (4 sekcje + historia) przyjmowane jako props — server component je ladowal.
// Akcje (add task, new project, toggle, delete) tylko gdy ownContextId != null
// (czyli jestesmy na /c/[id], nie na globalnym /).

import Link from "next/link";
import { Archive, Sparkles } from "lucide-react";
import type { DashboardData } from "@/lib/queries/dashboard";
import { DashboardSectionCard, type SectionTheme } from "./section-card";
import { ProjectCard } from "./project-card";
import { TaskRow, HistoryTaskRow } from "./task-row";
import { AddTaskInline } from "./add-task-inline";
import { NewProjectModal } from "./new-project-modal";

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
  const editable = ownContextId !== null;

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
            <div className="flex items-center gap-5 flex-wrap">
              <div
                className="w-14 h-14 rounded-2xl border-[3px] border-[var(--ink)] shrink-0"
                style={{
                  background: current.color,
                  boxShadow: "4px 4px 0 var(--ink)",
                }}
              />
              <h1 className="display-1 m-0">{current.name}</h1>
              {editable && (
                <div className="ml-auto">
                  <NewProjectModal contextId={current.id} />
                </div>
              )}
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
              Badge przy elemencie mowi skad pochodzi. Zeby dodawac, wejdz
              w konkretny kontekst.
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
              <ProjectCard
                key={p.id}
                project={p}
                showContextBadge={p.context.id !== ownContextId}
                editable={editable}
              />
            ))
          )}
        </DashboardSectionCard>

        {/* Luzne taski */}
        <DashboardSectionCard
          theme={SECTION_THEME.tasks}
          count={looseTasks.length}
          delayMs={80}
          footer={
            editable && current ? <AddTaskInline contextId={current.id} /> : null
          }
        >
          {looseTasks.length === 0 ? (
            <EmptyRow text="Brak luznych taskow" />
          ) : (
            looseTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                showContextBadge={t.context.id !== ownContextId}
              />
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
                    <InlineContextBadge ctx={i.context} />
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
                    <InlineContextBadge ctx={pr.context} />
                  </div>
                )}
              </div>
            ))
          )}
        </DashboardSectionCard>
      </div>

      {/* Historia — zakonczone taski */}
      {doneTasks.length > 0 && (
        <details className="mt-10 brutal-card overflow-hidden rise-in" style={{ animationDelay: "320ms" }}>
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
              <HistoryTaskRow
                key={t.id}
                task={t}
                showContextBadge={t.context.id !== ownContextId}
              />
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

// Lokalny badge do sekcji pomyslow/problemow (bez importu z innego pliku).
function InlineContextBadge({
  ctx,
}: {
  ctx: { id: string; name: string; color: string };
}) {
  return (
    <Link
      href={`/c/${ctx.id}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border-[2px] border-[var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
      style={{
        background: `color-mix(in srgb, ${ctx.color} 15%, #FBF8F3)`,
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: ctx.color }}
      />
      {ctx.name}
    </Link>
  );
}
