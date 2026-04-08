// /settings/contexts — lista wszystkich kontekstow + dodawanie/edycja/usuwanie.

import { getContextTree, getContextsFlat } from "@/lib/queries/contexts";
import { ContextsClient } from "./contexts-client";

export const metadata = { title: "Konteksty — Ustawienia" };

export default async function ContextsSettingsPage() {
  const [tree, flat] = await Promise.all([getContextTree(), getContextsFlat()]);

  return (
    <main className="p-10 max-w-4xl">
      <ContextsClient tree={tree} flatContexts={flat} />
    </main>
  );
}
