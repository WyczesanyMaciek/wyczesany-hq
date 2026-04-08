// Sidebar — placeholder.
// Wlasciwa logika (drzewko, rozwijanie, liczniki, linki, build info)
// dojdzie w kroku 4 tego etapu.

import type { ContextNode } from "@/lib/queries/contexts";

export function Sidebar({ tree }: { tree: ContextNode[] }) {
  return (
    <aside className="w-[280px] shrink-0 border-r-[3px] border-[var(--border-strong)] bg-[#F5F1E8] flex flex-col">
      <div className="p-5 border-b-[2px] border-[var(--border-strong)]">
        <div className="font-extrabold text-xl">Wyczesany HQ</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 text-sm">
        <div className="opacity-60 uppercase text-xs font-bold mb-2 px-2">
          Konteksty ({tree.length})
        </div>
        <ul className="space-y-1">
          {tree.map((node) => (
            <li key={node.id} className="font-bold py-1 px-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                style={{ background: node.color }}
              />
              {node.name}
              <span className="ml-2 opacity-50 font-normal">
                {node.projectCount}p · {node.taskCount}t
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t-[2px] border-[var(--border-strong)] text-xs opacity-50">
        placeholder footer
      </div>
    </aside>
  );
}
