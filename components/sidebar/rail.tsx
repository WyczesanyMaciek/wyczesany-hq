"use client";

// Rail — 52px ikony nawigacyjne po lewej stronie.
// DS v1: Rail + Sidebar (240px) + Content (fluid).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, CheckSquare, Plus, Search, Settings } from "lucide-react";
import { useOpenSearch } from "@/components/app-shell";

export function Rail() {
  const pathname = usePathname();
  const onSearch = useOpenSearch();

  return (
    <div
      style={{
        width: 52,
        flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1.5px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 0",
        gap: 4,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <RailIcon href="/" active={pathname === "/"} icon={<Home size={18} />} label="Dashboard" />
      <RailIcon href="/c" active={pathname.startsWith("/c/")} icon={<FolderOpen size={18} />} label="Konteksty" />
      <RailIcon href="/tasks" active={pathname === "/tasks"} icon={<CheckSquare size={18} />} label="Moje zadania" />
      <RailButton onClick={onSearch ?? undefined} icon={<Search size={18} />} label="Szukaj (/)" />

      <div style={{ flex: 1 }} />

      <RailIcon href="/settings" active={pathname.startsWith("/settings")} icon={<Settings size={18} />} label="Ustawienia" />
    </div>
  );
}

function RailIcon({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "var(--ds-accent)" : "var(--text-secondary)",
        background: active ? "var(--ds-accent-light)" : "transparent",
        textDecoration: "none",
        transition: "all var(--transition-fast)",
      }}
    >
      {icon}
    </Link>
  );
}

function RailButton({
  onClick,
  icon,
  label,
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
    >
      {icon}
    </button>
  );
}
