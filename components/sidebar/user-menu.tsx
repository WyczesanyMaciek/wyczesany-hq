"use client";

// UserMenu — avatar i przycisk wylogowania w sidebarze.

import { useTransition } from "react";
import { LogOut } from "lucide-react";

export function UserMenu({
  user,
  signOutAction,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: user.image ? `url(${user.image}) center/cover` : "#5B3DF5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {!user.image && initial}
      </div>
      <span
        style={{
          flex: 1,
          fontSize: "11.5px",
          color: "#475569",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {user.name ?? user.email ?? "User"}
      </span>
      <button
        onClick={() => {
          startTransition(async () => {
            await signOutAction();
          });
        }}
        disabled={pending}
        title="Wyloguj"
        style={{
          border: 0,
          background: "transparent",
          cursor: "pointer",
          color: "#94a3b8",
          display: "flex",
          padding: 2,
        }}
      >
        <LogOut size={13} />
      </button>
    </div>
  );
}
