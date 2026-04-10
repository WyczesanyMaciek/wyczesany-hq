// /settings/users — panel admina: lista userow, whitelist, dostep do kontekstow.

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUsers } from "./actions";
import { getContextsFlat } from "@/lib/queries/contexts";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role !== "admin") redirect("/");

  const [users, contexts] = await Promise.all([
    getUsers(),
    getContextsFlat(),
  ]);

  return <UsersClient users={users} contexts={contexts} />;
}
