// Layout aplikacji — sidebar po lewej (stale 280px) + content.
// Route group (app) pozwala nam miec inny layout dla /dev, /settings itd.
// bez zmiany URLi.

import { unstable_cache } from "next/cache";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Rail } from "@/components/sidebar/rail";
import { AppShell } from "@/components/app-shell";
import { getContextTree, getContextsFlat } from "@/lib/queries/contexts";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";

// Cache drzewka kontekstow — przeladowuje sie tylko gdy zmieni sie struktura
// kontekstow (tag "sidebar"), nie przy kazdym toggleTask/createTask.
const getCachedContextTree = unstable_cache(getContextTree, ["context-tree"], {
  tags: ["sidebar"],
});

const getCachedContextsFlat = unstable_cache(getContextsFlat, ["contexts-flat"], {
  tags: ["sidebar"],
});

const getCachedProjects = unstable_cache(
  async () => {
    const projects = await prisma.project.findMany({
      where: { status: { not: "done" } },
      select: { id: true, name: true, contextId: true },
      orderBy: { name: "asc" },
    });
    return projects;
  },
  ["projects-flat"],
  { tags: ["sidebar"] }
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tree, session, flatContexts, projects] = await Promise.all([
    getCachedContextTree(),
    auth(),
    getCachedContextsFlat(),
    getCachedProjects(),
  ]);

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <AppShell
      contexts={flatContexts.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
      projects={projects.map((p) => ({ id: p.id, name: p.name }))}
    >
      <div className="flex min-h-screen">
        <Rail />
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
