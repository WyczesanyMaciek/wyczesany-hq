// /c/[id] — dashboard kontekstu (Linear v2).
// Agreguje wszystko „w gore": wlasne + wszyscy potomkowie.
// Styl scoped pod .linear-app, zeby nie leciec brutalem.

import { notFound } from "next/navigation";
import { getContextDashboard } from "@/lib/queries/dashboard";
import { LinearDashboard } from "@/components/dashboard/linear-dashboard";

export default async function ContextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContextDashboard(id);
  if (!data) notFound();

  return (
    <div className="linear-app" style={{ minHeight: "100vh" }}>
      <LinearDashboard data={data} />
    </div>
  );
}
