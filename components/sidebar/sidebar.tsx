"use client";

// Sidebar — stala szerokosc 300px, sticky.
// Kierunek: Neo-brutalist warm — grube bordery, wyrazny naglowek brandu,
// pastelowe tla aktywnych kontekstow, sprezyste rozwijanie galezi.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Settings,
  Terminal,
  Sparkles,
  Palette,
} from "lucide-react";
import type { ContextNode } from "@/lib/queries/contexts";
import { softOf } from "@/lib/colors";
import { springSnappy } from "@/lib/motion";

const STORAGE_KEY = "wyczesany-hq:sidebar:expanded";

export function Sidebar({ tree }: { tree: ContextNode[] }) {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/c/") ? pathname.split("/")[2] : null;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
      className="w-[300px] shrink-0 border-r-[3px] border-[var(--ink)] flex flex-col sticky top-0 h-screen"
      style={{ background: "#F5EFE3" }}
    >
      {/* Brand header — gruby, kontrastowy */}
      <Link
        href="/"
        className="block px-6 py-6 border-b-[3px] border-[var(--ink)] hover:bg-white/40 transition-colors"
      >
        <div className="eyebrow mb-1">Dashboard</div>
        <div
          className="font-black leading-none"
          style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
        >
          Wyczesany HQ
        </div>
      </Link>

      {/* Drzewko kontekstow */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="eyebrow px-6 mb-3">Konteksty</div>
        <ul className="list-none m-0 p-0">
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
      <div className="border-t-[3px] border-[var(--ink)] py-2" style={{ background: "#EFE7D5" }}>
        <FooterLink href="/settings" icon={<Settings size={17} />}>
          Ustawienia
        </FooterLink>
        <FooterLink href="/dev/logs" icon={<Terminal size={17} />}>
          Logi
        </FooterLink>
        <FooterLink href="/dev/design-system" icon={<Palette size={17} />}>
          Design system
        </FooterLink>
        <div className="px-6 pt-2 pb-1 text-[11px] text-[var(--foreground-muted)] font-mono leading-tight">
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
  const isOpen = mounted ? expanded.has(node.id) : false;
  const isActive = activeId === node.id;

  return (
    <li>
      <div
        className="group relative flex items-center gap-2 pr-3 py-2 cursor-pointer transition-all"
        style={{
          paddingLeft: `${16 + depth * 16}px`,
          background: isActive ? softOf(node.color) : undefined,
          borderLeft: `4px solid ${isActive ? node.color : "transparent"}`,
          fontWeight: isActive ? 900 : 700,
        }}
      >
        {/* Chevron — sprezyste odbicie przy obrocie */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (hasChildren) onToggle(node.id);
          }}
          className="w-5 h-5 flex items-center justify-center shrink-0 rounded hover:bg-black/10"
          aria-label={hasChildren ? (isOpen ? "Zwin" : "Rozwin") : undefined}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={springSnappy}
              style={{ transformOrigin: "center" }}
            >
              <ChevronRight size={15} strokeWidth={3} />
            </motion.div>
          ) : null}
        </button>

        {/* Link do kontekstu */}
        <Link
          href={`/c/${node.id}`}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-[15px]"
        >
          <span
            className="inline-block w-3 h-3 rounded-sm shrink-0 border-[1.5px] border-[var(--ink)]"
            style={{ background: node.color }}
          />
          <span className="truncate">{node.name}</span>
          <span
            className="ml-auto text-[11px] opacity-55 font-mono shrink-0"
            style={{ fontWeight: 700 }}
          >
            {node.projectCount}p · {node.taskCount}t
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
            className="list-none m-0 p-0 overflow-hidden"
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
      className="flex items-center gap-2.5 px-6 py-2 text-[14px] font-extrabold hover:bg-black/5 transition-colors"
      style={{
        background: isActive ? "rgba(31,31,46,0.08)" : undefined,
      }}
    >
      {icon}
      {children}
      {isActive ? <Sparkles size={12} className="ml-auto opacity-60" /> : null}
    </Link>
  );
}
