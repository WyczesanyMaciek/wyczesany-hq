// / — dashboard globalny.
// Sekcje: Dzisiaj (overdue + today), Liczniki, Problemy pilne, Konteksty.

import Link from "next/link";
import {
  getGlobalStats,
  getOverdueTasks,
  getUrgentProblems,
} from "@/lib/queries/dashboard";
import { getContextTree } from "@/lib/queries/contexts";
import type { ContextNode } from "@/lib/queries/contexts";

function daysOverdue(deadline: Date | null): number {
  if (!deadline) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function flattenContexts(nodes: ContextNode[]): ContextNode[] {
  const out: ContextNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children.length > 0) out.push(...flattenContexts(n.children));
  }
  return out;
}

export default async function Home() {
  const [stats, overdueTasks, urgentProblems, tree] = await Promise.all([
    getGlobalStats(),
    getOverdueTasks(),
    getUrgentProblems(),
    getContextTree(),
  ]);

  const tiles = [
    { label: "Projekty", value: stats.projects },
    { label: "Taski", value: stats.tasks },
    { label: "Pomysły", value: stats.ideas },
    { label: "Problemy", value: stats.problems },
  ];

  // Tylko top-level konteksty do siatki
  const topContexts = tree;

  return (
    <div className="t-global-dashboard">
      <h2 className="t-dashboard-section-title" style={{ fontSize: 22, marginBottom: 24 }}>
        Dashboard
      </h2>

      {/* Liczniki */}
      <div className="t-dashboard-section">
        <div className="t-counter-bar">
          {tiles.map((t) => (
            <div key={t.label} className="t-counter-card">
              <div className="t-counter-value">{t.value}</div>
              <div className="t-counter-label">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dzisiaj — overdue + today */}
      {overdueTasks.length > 0 && (
        <div className="t-dashboard-section">
          <h3 className="t-dashboard-section-title">
            Dzisiaj ({overdueTasks.length})
          </h3>
          <div className="t-task-list-wrapper">
            {overdueTasks.map((t) => {
              const days = daysOverdue(t.deadline);
              return (
                <div key={t.id} className="t-task-row">
                  <div className={`t-task-checkbox${t.done ? " t-task-checkbox--done" : ""}`} />
                  <div className={`t-priority-dot t-priority-dot--${t.priority >= 3 ? "critical" : t.priority === 2 ? "high" : t.priority === 1 ? "medium" : "low"}`} />
                  <span className="t-task-title">{t.title}</span>
                  {days > 0 ? (
                    <span className="t-overdue-badge">
                      {days}d temu
                    </span>
                  ) : (
                    <span className="t-badge t-badge--todo">
                      <span className="t-badge-dot" />
                      Dzisiaj
                    </span>
                  )}
                  <span className="t-task-date t-task-date--overdue">
                    {t.deadline ? new Date(t.deadline).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }) : ""}
                  </span>
                  <span
                    className="t-context-badge"
                    style={{ background: `${t.context.color}22`, color: t.context.color }}
                  >
                    {t.context.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Problemy pilne */}
      {urgentProblems.length > 0 && (
        <div className="t-dashboard-section">
          <h3 className="t-dashboard-section-title">
            Problemy pilne ({urgentProblems.length})
          </h3>
          {urgentProblems.map((p) => (
            <div key={p.id} className="t-chip-row">
              <span className="t-chip-icon">⚠</span>
              <div className="t-chip-content">
                {p.content}
                {p.description && (
                  <div className="t-chip-meta">{p.description}</div>
                )}
              </div>
              <span
                className="t-context-badge"
                style={{ background: `${p.context.color}22`, color: p.context.color }}
              >
                {p.context.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Konteksty */}
      <div className="t-dashboard-section">
        <h3 className="t-dashboard-section-title">Konteksty</h3>
        <div className="t-context-grid">
          {topContexts.map((c) => {
            const all = flattenContexts([c]);
            const totalTasks = all.reduce((sum, n) => sum + n.taskCount, 0);
            const totalProjects = all.reduce((sum, n) => sum + n.projectCount, 0);
            return (
              <Link
                key={c.id}
                href={`/c/${c.id}`}
                className="t-context-card"
              >
                <span className="t-context-card-icon">
                  <span
                    className="t-context-dot"
                    style={{ background: c.color }}
                  />
                </span>
                <div className="t-context-card-body">
                  <div className="t-context-card-name">{c.name}</div>
                  <div className="t-context-card-count">
                    {totalProjects} proj · {totalTasks} tasków
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
