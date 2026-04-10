"use client";

// Sidebar — Linear v2 look. Szerokosc 230px, sticky, Inter 12.8px,
// miekkie szare linie, accent indigo #6366f1. Logika (expanded state,
// active highlight, rekurencja drzewa) zachowana z wersji brutalnej.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Search, Settings, Terminal } from "lucide-react";
import type { ContextNode } from "@/lib/queries/contexts";
import { springSnappy } from "@/lib/motion";
import { useOpenSearch } from "@/components/app-shell";
import { UserMenu } from "./user-menu";

const STORAGE_KEY = "wyczesany-hq:sidebar:expanded";

export function Sidebar({
  tree,
  user,
  signOutAction,
}: {
  tree: ContextNode[];
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
  signOutAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const onSearch = useOpenSearch();
  const activeId = pathname.startsWith("/c/") ? pathname.split("/")[2] : null;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydracja expanded state z localStorage — legit effect dla
    // synchronizacji z zewnetrznym storage. Eslint reguly set-state-in-effect
    // sa zbyt restrykcyjne dla tego use-case'u.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setExpanded(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignoruj */
    }
    setMounted(true);
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignoruj */
      }
      return next;
    });
  };

  return (
    <aside
      className="lside"
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1.5px solid var(--border-default)",
        background: "var(--bg-sidebar)",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-family)",
        fontSize: "13px",
        color: "var(--text-primary)",
      }}
    >
      {/* Brand header */}
      <Link
        href="/"
        style={{
          display: "block",
          padding: "14px 16px",
          borderBottom: "1.5px solid var(--border-default)",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-tertiary)",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          Dashboard
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em" }}>
          Wyczesany HQ
        </div>
      </Link>

      {/* Search button */}
      {onSearch && (
        <button
          onClick={onSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "8px 12px 4px",
            padding: "6px 10px",
            border: "1px solid #eef0f3",
            borderRadius: 6,
            background: "#fff",
            cursor: "pointer",
            font: "inherit",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            width: "calc(100% - 24px)",
          }}
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: "left" }}>Szukaj...</span>
          <kbd style={{
            fontSize: 10,
            padding: "1px 4px",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            background: "#f8fafc",
            color: "var(--text-tertiary)",
          }}>/</kbd>
        </button>
      )}

      {/* Drzewko kontekstow */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-tertiary)",
            fontWeight: 600,
            padding: "0 16px",
            marginBottom: 6,
          }}
        >
          Konteksty
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {tree.map((node) => (
            <ContextTreeNode
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              activeId={activeId}
              mounted={mounted}
            />
          ))}
        </ul>
      </nav>

      {/* User menu */}
      {user && signOutAction && (
        <div style={{ borderTop: "1.5px solid var(--border-default)" }}>
          <UserMenu user={user} signOutAction={signOutAction} />
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1.5px solid var(--border-default)", padding: "6px 0" }}>
        <FooterLink href="/settings" icon={<Settings size={14} />}>
          Ustawienia
        </FooterLink>
        <FooterLink href="/dev/logs" icon={<Terminal size={14} />}>
          Logi
        </FooterLink>
        <div
          style={{
            padding: "6px 16px 4px",
            fontSize: "11px",
            color: "var(--text-tertiary)",
            fontFamily: "ui-monospace, monospace",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <b style={{ color: "#64748b" }}>
            Build {process.env.NEXT_PUBLIC_BUILD_NUMBER}
          </b>{" "}
          · {process.env.NEXT_PUBLIC_BUILD_TIME}
        </div>
      </div>
    </aside>
  );
}

function ContextTreeNode({
  node,
  depth,
  expanded,
  onToggle,
  activeId,
  mounted,
}: {
  node: ContextNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  activeId: string | null;
  mounted: boolean;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = mounted ? expanded.has(node.id) : false;
  const isActive = activeId === node.id;

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: 8 + depth * 14,
          paddingRight: 10,
          paddingTop: 5,
          paddingBottom: 5,
          cursor: "pointer",
          background: isActive ? "var(--accent-light)" : undefined,
          color: isActive ? "var(--accent)" : "var(--text-primary)",
          fontWeight: isActive ? 700 : 600,
          transition: "background var(--transition-fast)",
          borderRadius: "var(--radius-sm)",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "var(--bg-sidebar-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (hasChildren) onToggle(node.id);
          }}
          style={{
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "none",
            background: "transparent",
            cursor: hasChildren ? "pointer" : "default",
            color: "#64748b",
          }}
          aria-label={hasChildren ? (isOpen ? "Zwin" : "Rozwin") : undefined}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={springSnappy}
              style={{ transformOrigin: "center", display: "flex" }}
            >
              <ChevronRight size={11} strokeWidth={2.5} />
            </motion.div>
          ) : null}
        </button>

        <Link
          href={`/c/${node.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 0,
            textDecoration: "none",
            color: "inherit",
            fontSize: "12.8px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 2,
              flexShrink: 0,
              background: node.color,
            }}
          />
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.name}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              color: "var(--text-tertiary)",
              fontFamily: "ui-monospace, monospace",
              flexShrink: 0,
            }}
          >
            {node.projectCount}·{node.taskCount}
          </span>
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...springSnappy, stiffness: 500, damping: 40 }}
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {node.children.map((child) => (
              <ContextTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                activeId={activeId}
                mounted={mounted}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

function FooterLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        fontSize: "12.5px",
        fontWeight: 500,
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        background: isActive ? "var(--accent-light)" : undefined,
        borderRadius: "var(--radius-sm)",
        textDecoration: "none",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
