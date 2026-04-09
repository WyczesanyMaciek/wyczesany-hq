// / — globalny dashboard. Wszystko ze wszystkich kontekstow w stylu Linear v2,
// ale read-only: klik w task/projekt prowadzi do kontekstu, nic nie da sie dodac/edytowac tutaj.

import { getGlobalDashboard } from "@/lib/queries/dashboard";
import { LinearDashboard } from "@/components/dashboard/linear-dashboard";

export default async function Home() {
  const data = await getGlobalDashboard();
  return (
    <div className="linear-app" style={{ minHeight: "100vh" }}>
      <LinearDashboard data={data} readOnly isGlobal />
    </div>
  );
}
