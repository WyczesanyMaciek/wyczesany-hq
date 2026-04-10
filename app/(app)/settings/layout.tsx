// /settings — layout z lewym menu w stylu Linear v2.

import Link from "next/link";
import { SlidersHorizontal, Layers, Users } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: "1px solid #eef0f3",
          background: "#fafbfc",
          padding: "20px 12px",
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          fontSize: "12.8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 8px",
            marginBottom: 20,
          }}
        >
          <SlidersHorizontal size={15} strokeWidth={2} style={{ color: "#475569" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            Ustawienia
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SettingsLink href="/settings/contexts" icon={<Layers size={14} />}>
            Konteksty
          </SettingsLink>
          <SettingsLink href="/settings/users" icon={<Users size={14} />}>
            Uzytkownicy
          </SettingsLink>
        </nav>
      </div>
      <div style={{ flex: 1, minWidth: 0, background: "#ffffff" }}>{children}</div>
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
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: "12.8px",
        fontWeight: 500,
        color: "#475569",
        textDecoration: "none",
        transition: "background 120ms",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
        (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
