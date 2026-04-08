// /settings — layout z lewym menu.
// Na razie tylko „Konteksty"; w Etapie 8 dojda: Userzy, Uprawnienia,
// Integracje itd.

import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="w-[220px] shrink-0 border-r-[2px] border-[var(--border-strong)] p-6">
        <h2 className="text-lg mb-4">Ustawienia</h2>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/settings/contexts"
            className="px-3 py-2 rounded-md font-bold hover:bg-black/5"
          >
            Konteksty
          </Link>
        </nav>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
