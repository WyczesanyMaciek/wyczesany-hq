// /c/[id] — dashboard kontekstu.
// Agreguje wszystko „w gore": wlasne + wszyscy potomkowie.

import { notFound } from "next/navigation";
import { getContextDashboard } from "@/lib/queries/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function ContextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContextDashboard(id);
  if (!data) notFound();

  return <DashboardView data={data} ownContextId={id} />;
}
