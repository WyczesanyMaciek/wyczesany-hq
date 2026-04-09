// /dev/actions-test — debug page dla Etapu 3.
// Klikamy przyciski wywolujace nowe server actions na losowym zadaniu.
// Po wywolaniu: rerender strony, widac wynik w konsoli przegladarki.

import { prisma } from "@/lib/db";
import { ActionsTestClient } from "./client";

export default async function ActionsTestPage() {
  // Zaciagamy wszystkie taski z kontekstem + projektem zeby bylo co testowac.
  const tasks = await prisma.task.findMany({
    orderBy: [{ projectId: "asc" }, { order: "asc" }],
    include: {
      context: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
      links: true,
      attachments: true,
    },
  });

  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }],
    include: { context: { select: { id: true, name: true } } },
  });

  const contexts = await prisma.context.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, color: true },
  });

  return (
    <div style={{ padding: 24, fontFamily: "var(--font-sans)" }}>
      <h2 style={{ marginTop: 0 }}>Actions test — Etap 3</h2>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Debug page dla server actions. Wyniki w konsoli przegladarki.
      </p>
      <ActionsTestClient
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          done: t.done,
          order: t.order,
          priority: t.priority,
          assigneeId: t.assigneeId,
          notes: t.notes,
          contextName: t.context.name,
          projectName: t.project?.name ?? null,
          projectId: t.projectId,
          linksCount: t.links.length,
          attachmentsCount: t.attachments.length,
        }))}
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          order: p.order,
          contextId: p.contextId,
          contextName: p.context.name,
        }))}
        contexts={contexts}
      />
    </div>
  );
}
