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
    <aside className="t-sidebar">
      {/* Brand header */}
      <Link href="/" className="t-sidebar-brand">
        <div className="t-sidebar-brand-label">Dashboard</div>
        <div className="t-sidebar-brand-title">Wyczesany HQ</div>
      </Link>

      {/* Search button */}
      {onSearch && (
        <button onClick={onSearch} className="t-search">
          <Search size={13} />
          <span style={{ flex: 1, textAlign: "left" }}>Szukaj...</span>
          <kbd className="t-search-kbd">/</kbd>
        </button>
      )}

      {/* Drzewko kontekstow */}
      <nav className="t-sidebar-nav">
        <div className="t-sidebar-section">Konteksty</div>
        <ul className="t-nav-list">
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
        <div className="t-sidebar-user-border">
          <UserMenu user={user} signOutAction={signOutAction} />
        </div>
      )}

      {/* Footer */}
      <div className="t-sidebar-footer">
        <FooterLink href="/settings" icon={<Settings size={14} />}>
          Ustawienia
        </FooterLink>
        <FooterLink href="/dev/logs" icon={<Terminal size={14} />}>
          Logi
        </FooterLink>
        <div className="t-sidebar-build">
          <b>Build #{process.env.NEXT_PUBLIC_BUILD_NUMBER}</b>{" "}
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
        className={`t-sidebar-item${isActive ? " t-sidebar-item--active" : ""}`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (hasChildren) onToggle(node.id);
          }}
          className={`t-chevron-btn${hasChildren ? " t-chevron-btn--has-children" : ""}`}
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
          className="t-sidebar-item-link"
        >
          <span className="t-context-dot" style={{ background: node.color }} />
          <span className="t-sidebar-item-text">
            {node.name}
          </span>
          <span className="t-sidebar-item-count">
            {node.projectCount}·{node.taskCount}
          </span>
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.ul
            className="t-nav-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...springSnappy, stiffness: 500, damping: 40 }}
            style={{ overflow: "hidden" }}
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
      className={`t-sidebar-footer-link${isActive ? " t-sidebar-footer-link--active" : ""}`}
    >
      {icon}
      {children}
    </Link>
  );
}
