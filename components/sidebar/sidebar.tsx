"use client";

// Sidebar — stala szerokosc 280px, sticky na calej wysokosci ekranu.
// Rozwijanie/zwijanie galezi zapamietane w localStorage.
// W Etapie 8 przeniesiemy to do bazy per user.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Settings, Terminal } from "lucide-react";
import type { ContextNode } from "@/lib/queries/contexts";
import { hexToRgba } from "@/lib/colors";

const STORAGE_KEY = "wyczesany-hq:sidebar:expanded";

export function Sidebar({ tree }: { tree: ContextNode[] }) {
  const pathname = usePathname();

  // Aktywny kontekst z URL (/c/[id])
  const activeId = pathname.startsWith("/c/") ? pathname.split("/")[2] : null;

  // Stan rozwinietych galezi
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setExpanded(new Set(arr));
      }
    } catch {
      // ignoruj bledy localStorage
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
        // ignoruj
      }
      return next;
    });
  };

  return (
    <aside className="w-[280px] shrink-0 border-r-[3px] border-[var(--border-strong)] bg-[#F5F1E8] flex flex-col sticky top-0 h-screen">
      {/* Header */}
      <div className="px-5 py-4 border-b-[2px] border-[var(--border-strong)]">
        <Link href="/" className="font-extrabold text-xl block leading-tight">
          Wyczesany HQ
        </Link>
      </div>

      {/* Drzewko */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="opacity-60 uppercase text-xs font-bold mb-1 px-4">
          Konteksty
        </div>
        <ul>
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

      {/* Footer — linki + build info */}
      <div className="border-t-[2px] border-[var(--border-strong)] py-2">
        <FooterLink href="/settings" icon={<Settings size={16} />}>
          Ustawienia
        </FooterLink>
        <FooterLink href="/dev/logs" icon={<Terminal size={16} />}>
          Logi
        </FooterLink>
        <div className="px-4 pt-2 pb-1 text-[11px] text-gray-500 font-mono leading-tight">
          v{process.env.NEXT_PUBLIC_APP_VERSION} ·{" "}
          {process.env.NEXT_PUBLIC_GIT_HASH} ·{" "}
          {process.env.NEXT_PUBLIC_BUILD_TIME}
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
  // Domyslnie zwiniete do momentu hydracji (zeby SSR = CSR)
  const isOpen = mounted ? expanded.has(node.id) : false;
  const isActive = activeId === node.id;

  return (
    <li>
      <div
        className="group flex items-center gap-1.5 pr-3 py-1.5 transition-colors cursor-pointer hover:bg-black/5"
        style={{
          paddingLeft: `${10 + depth * 14}px`,
          background: isActive ? hexToRgba(node.color, 0.13) : undefined,
          borderLeft: `3px solid ${isActive ? node.color : "transparent"}`,
          fontWeight: isActive ? 800 : 600,
        }}
      >
        {/* Przycisk rozwijania */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (hasChildren) onToggle(node.id);
          }}
          className="w-4 h-4 flex items-center justify-center shrink-0"
          aria-label={hasChildren ? (isOpen ? "Zwin" : "Rozwin") : undefined}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : null}
        </button>

        {/* Link do kontekstu */}
        <Link
          href={`/c/${node.id}`}
          className="flex items-center gap-2 flex-1 min-w-0 text-[14px]"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: node.color }}
          />
          <span className="truncate">{node.name}</span>
          <span className="ml-auto text-[11px] opacity-50 font-normal shrink-0">
            {node.projectCount}p · {node.taskCount}t
          </span>
        </Link>
      </div>

      {hasChildren && isOpen && (
        <ul>
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
        </ul>
      )}
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
      className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold hover:bg-black/5"
      style={{
        background: isActive ? "rgba(0,0,0,0.06)" : undefined,
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
