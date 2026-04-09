// / — dashboard globalny. Wszystko ze wszystkich kontekstow.

import { getGlobalDashboard } from "@/lib/queries/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function Home() {
  const data = await getGlobalDashboard();
  return <DashboardView data={data} ownContextId={null} />;
}
