"use client";

// Rail — 52px ikony nawigacyjne. DS v1 klasy t-rail, t-rail-icon.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, CheckSquare, Search, Settings, Plus } from "lucide-react";
import { useOpenSearch, useOpenQuickAdd } from "@/components/app-shell";

export function Rail() {
  const pathname = usePathname();
  const onSearch = useOpenSearch();
  const onQuickAdd = useOpenQuickAdd();

  return (
    <div className="t-rail">
      <RailIcon href="/" active={pathname === "/"} icon={<Home size={18} />} label="Dashboard" />
      <RailIcon href="/c" active={pathname.startsWith("/c/")} icon={<FolderOpen size={18} />} label="Konteksty" />
      <RailIcon href="/tasks" active={pathname === "/tasks"} icon={<CheckSquare size={18} />} label="Moje zadania" />
      <RailButton onClick={onQuickAdd ?? undefined} icon={<Plus size={18} />} label="Dodaj (N)" />
      <RailButton onClick={onSearch ?? undefined} icon={<Search size={18} />} label="Szukaj (/)" />

      <div className="t-flex-spacer" />

      <RailIcon href="/settings" active={pathname.startsWith("/settings")} icon={<Settings size={18} />} label="Ustawienia" />
    </div>
  );
}

function RailIcon({ href, active, icon, label }: {
  href: string; active: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`t-rail-icon${active ? " t-rail-icon--active" : ""}`}
    >
      {icon}
    </Link>
  );
}

function RailButton({ onClick, icon, label }: {
  onClick?: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button onClick={onClick} title={label} className="t-rail-icon">
      {icon}
    </button>
  );
}
