// /c/[id] — dashboard kontekstu. Na razie placeholder,
// pelna logika w Etapie 3.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function ContextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await prisma.context.findUnique({ where: { id } });
  if (!ctx) notFound();

  return (
    <main className="p-10">
      <div className="max-w-3xl border-[3px] border-[var(--border-strong)] rounded-2xl p-10 bg-white/40">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: ctx.color }}
          />
          <h1 className="m-0">{ctx.name}</h1>
        </div>
        <p className="opacity-70">
          Dashboard kontekstu — projekty, luzne taski, pomysly, problemy.
          Placeholder do Etapu 3.
        </p>
      </div>
    </main>
  );
}
