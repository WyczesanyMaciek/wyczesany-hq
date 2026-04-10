// Layout aplikacji — sidebar po lewej (stale 280px) + content.
// Route group (app) pozwala nam miec inny layout dla /dev, /settings itd.
// bez zmiany URLi.

import { Sidebar } from "@/components/sidebar/sidebar";
import { AppShell } from "@/components/app-shell";
import { getContextTree } from "@/lib/queries/contexts";
import { auth, signOut } from "@/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tree, session] = await Promise.all([getContextTree(), auth()]);

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar
          tree={tree}
          user={session?.user}
          signOutAction={signOutAction}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AppShell>
  );
}
