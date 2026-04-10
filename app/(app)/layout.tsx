// Layout aplikacji — sidebar po lewej (stale 280px) + content.
// Route group (app) pozwala nam miec inny layout dla /dev, /settings itd.
// bez zmiany URLi.

import { Sidebar } from "@/components/sidebar/sidebar";
import { AppShell } from "@/components/app-shell";
import { getContextTree } from "@/lib/queries/contexts";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = await getContextTree();

  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar tree={tree} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AppShell>
  );
}
