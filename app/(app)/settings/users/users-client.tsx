"use client";

// UsersClient — panel admina do zarzadzania userami i ich dostepem.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  whitelistEmail,
  removeUser,
  changeRole,
  grantContextAccess,
  revokeContextAccess,
  type UserWithAccess,
} from "./actions";

type ContextFlat = { id: string; name: string; color: string };

export function UsersClient({
  users,
  contexts,
}: {
  users: UserWithAccess[];
  contexts: ContextFlat[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newEmail, setNewEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleWhitelist = () => {
    if (!newEmail.trim()) return;
    startTransition(async () => {
      const r = await whitelistEmail(newEmail);
      if (r.ok) {
        setNewEmail("");
        router.refresh();
      } else {
        alert(r.error);
      }
    });
  };

  const handleRemove = (userId: string, email: string | null) => {
    if (!confirm(`Usunac usera ${email ?? userId}? Akcji nie da sie cofnac.`)) return;
    startTransition(async () => {
      const r = await removeUser(userId);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  };

  const handleRoleChange = (userId: string, role: "admin" | "member") => {
    startTransition(async () => {
      const r = await changeRole(userId, role);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  };

  const handleGrant = (userId: string, contextId: string) => {
    startTransition(async () => {
      const r = await grantContextAccess(userId, contextId);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  };

  const handleRevoke = (userId: string, contextId: string) => {
    startTransition(async () => {
      const r = await revokeContextAccess(userId, contextId);
      if (!r.ok) alert(r.error);
      else router.refresh();
    });
  };

  const selectedUser = selectedUserId
    ? users.find((u) => u.id === selectedUserId)
    : null;

  const grantedIds = new Set(
    selectedUser?.contextAccess.map((a) => a.contextId) ?? []
  );
  const availableContexts = contexts.filter((c) => !grantedIds.has(c.id));

  return (
    <div style={{ padding: "24px 32px", maxWidth: 800 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          margin: "0 0 20px",
          color: "#1F1F2E",
        }}
      >
        Uzytkownicy
      </h2>

      {/* Dodaj email */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <input
          type="email"
          placeholder="Nowy email (whitelist)"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={pending}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleWhitelist();
          }}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 14,
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            font: "inherit",
          }}
        />
        <button
          onClick={handleWhitelist}
          disabled={pending || !newEmail.trim()}
          className=""
          style={{
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: "#5B3DF5",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Dodaj
        </button>
      </div>

      {/* Lista userow */}
      <div style={{ border: "1px solid #eef0f3", borderRadius: 8, overflow: "hidden" }}>
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUserId(u.id)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              background: selectedUserId === u.id ? "#eef2ff" : "#fff",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid #eef0f3",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: u.image ? `url(${u.image}) center/cover` : "#5B3DF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {!u.image && (u.name?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {u.name ?? u.email ?? "Bez nazwy"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {u.email}
              </div>
            </div>

            {/* Rola */}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                background: u.role === "admin" ? "#5B3DF522" : "#64748b22",
                color: u.role === "admin" ? "#5B3DF5" : "#64748b",
              }}
            >
              {u.role}
            </span>

            {/* Konteksty */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {u.role === "admin" ? (
                <span
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  wszystko
                </span>
              ) : (
                u.contextAccess.map((a) => (
                  <span
                    key={a.contextId}
                    style={{
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      background: `${a.contextColor}22`,
                      color: a.contextColor,
                      fontWeight: 600,
                    }}
                  >
                    {a.contextName}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Panel szczegolow wybranego usera */}
      {selectedUser && (
        <div
          style={{
            marginTop: 20,
            padding: "16px 20px",
            border: "1px solid #eef0f3",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>
            {selectedUser.name ?? selectedUser.email}
          </h3>

          {/* Zmiana roli */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>Rola:</span>
            <select
              value={selectedUser.role}
              onChange={(e) =>
                handleRoleChange(
                  selectedUser.id,
                  e.target.value as "admin" | "member"
                )
              }
              disabled={pending}
              style={{
                font: "inherit",
                fontSize: 13,
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {/* Dostep do kontekstow */}
          {selectedUser.role !== "admin" && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Dostep do kontekstow:
              </div>

              {/* Obecne */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {selectedUser.contextAccess.map((a) => (
                  <button
                    key={a.contextId}
                    onClick={() =>
                      handleRevoke(selectedUser.id, a.contextId)
                    }
                    disabled={pending}
                    title="Kliknij zeby usunac dostep"
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${a.contextColor}22`,
                      color: a.contextColor,
                      border: `1px solid ${a.contextColor}44`,
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    {a.contextName} ×
                  </button>
                ))}
                {selectedUser.contextAccess.length === 0 && (
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Brak dostepu — dodaj konteksty ponizej
                  </span>
                )}
              </div>

              {/* Dodaj dostep */}
              {availableContexts.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      alignSelf: "center",
                      marginRight: 4,
                    }}
                  >
                    Dodaj:
                  </span>
                  {availableContexts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleGrant(selectedUser.id, c.id)
                      }
                      disabled={pending}
                      style={{
                        padding: "2px 6px",
                        borderRadius: 3,
                        fontSize: 11,
                        background: "#f8fafc",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      + {c.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Usun usera */}
          <button
            onClick={() =>
              handleRemove(selectedUser.id, selectedUser.email)
            }
            disabled={pending}
            style={{
              marginTop: 16,
              padding: "6px 14px",
              fontSize: 12,
              color: "#DC2626",
              border: "1px solid #DC2626",
              borderRadius: 4,
              background: "transparent",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Usun usera
          </button>
        </div>
      )}
    </div>
  );
}
