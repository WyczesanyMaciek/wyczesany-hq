// /settings — layout z lewym menu.
// Na razie tylko „Konteksty"; w Etapie 8 dojda: Userzy, Uprawnienia,
// Integracje itd.

import Link from "next/link";
import { SlidersHorizontal, Layers, Users } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div
        className="w-[240px] shrink-0 border-r-[3px] border-[var(--ink)] p-6"
        style={{ background: "#EFE7D5" }}
      >
        <div className="flex items-center gap-2 mb-8">
          <SlidersHorizontal size={18} strokeWidth={2.5} />
          <h3 className="m-0">Ustawienia</h3>
        </div>
        <nav className="flex flex-col gap-1">
          <SettingsLink href="/settings/contexts" icon={<Layers size={16} />}>
            Konteksty
          </SettingsLink>
          <SettingsLink href="/settings/users" icon={<Users size={16} />}>
            Uzytkownicy
          </SettingsLink>
        </nav>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function SettingsLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  // Na razie tylko jedna trasa; w Etapie 8 dolozymy kolejne.
  // Active styling: brutal pill z pasem koloru.
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-[2.5px] border-[var(--ink)] bg-white font-extrabold text-[15px] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] transition-all"
      style={{ boxShadow: "2px 2px 0 var(--ink)" }}
    >
      {icon}
      {children}
    </Link>
  );
}
