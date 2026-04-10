// /c/[id]/p/[projectId] — strona projektu (Etap 6).
// Pelny widok: taski z DnD, notatki, linki, placeholder historii rozmow.
// Styl scoped pod .linear-app, spojny z dashboardem kontekstu.

import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/queries/dashboard";
import { ProjectView } from "@/components/dashboard/project-view";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: contextId, projectId } = await params;
  const project = await getProjectDetail(projectId);

  if (!project || project.context.id !== contextId) notFound();

  return (
    <div className="linear-app" style={{ minHeight: "100vh" }}>
      <ProjectView project={project} />
    </div>
  );
}
