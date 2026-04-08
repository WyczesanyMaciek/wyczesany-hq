# PROGRESS — Wyczesany HQ

## ✅ Etap 1 — Fundament (DONE)

- Next.js 16 + TypeScript + Tailwind v4 + App Router (Turbopack)
- Bazowy motyw: Nunito, kremowe tło `#FBF8F3`, tekst `#1F1F2E`,
  rozmiar 17px, line-height 1.65, brak dark mode
- shadcn/ui zainicjalizowane (preset base-nova, neutral)
- Prisma 7 + SQLite + adapter `better-sqlite3`
- Schema 7 modeli (Context, Project, Task, Idea, Problem, Note, Link)
  — wszystkie pola Postgres-compatible
- Pierwsza migracja `init` zaaplikowana
- Seed: 16 startowych kontekstów + testowy projekt w Legnickiej z 3 taskami
- `lib/db.ts` — singleton PrismaClient

## ✅ Etap 2 — Drzewko kontekstów + Ustawienia + Dev tools (DONE)

- **Sidebar 280px, sticky h-screen**
  - Hierarchiczne drzewko z bazy, kropka koloru per kontekst
  - Liczniki zagregowane w górę `Xp · Yt`
  - Rozwijanie/zwijanie (localStorage: `wyczesany-hq:sidebar:expanded`)
  - Aktywny kontekst: tło rgba koloru (0.13) + border-left 3px + font-weight 800
  - Routing do `/c/[id]` (placeholder dashboardu kontekstu — treść w Etapie 3)
  - Footer: linki Ustawienia / Logi + build info (v · hash · czas)
- **Query kontekstów** (`lib/queries/contexts.ts`)
  - `getContextTree()` — hierarchia z agregacją liczników w dół
  - `getContextById()` — własne liczniki (do walidacji usuwania)
  - `getContextsFlat()` — płaska lista z depth (do dropdownu rodzica)
- **Settings → Konteksty** (`/settings/contexts`)
  - Read-only hierarchiczna lista z licznikami własnymi
  - Modal dodawania: nazwa, paleta 10 kolorów, dropdown rodzica
  - Modal edycji: ten sam modal prefilled
  - Usuwanie z pełną blokadą — kontekst musi być pusty
    (sprawdza: dzieci, projekty, taski, pomysły, problemy, notatki, linki)
- **Server Actions** (`actions.ts`)
  - createContext / updateContext / deleteContext
  - Walidacje serwerowe: nazwa 1-80, kolor z palety, rodzic istnieje,
    brak cykli, blokada usuwania niepustych kontekstów
  - `revalidatePath("/", "layout")` po każdej akcji
- **Dev tools**
  - `/dev/colors` — podgląd palety i dziedziczenia (zostaje na stałe)
  - `/dev/logs` — tail 200 linii z `.next/dev-server.log`, auto-refresh co 2s,
    przycisk „Skopiuj wszystko"
  - `/api/logs` — GET endpoint (no-cache). TODO: Etap 9 → MCP tool
  - Skrypt `npm run dev` pipuje wyjście przez `tee` do pliku loga
- **Build info** w `next.config.ts` — git hash + build time w env

## 🔜 Etap 3 — Dashboard kontekstu (NEXT)

- Klik w kontekst → dashboard kontekstu (obecnie placeholder)
- Sekcje: projekty, luźne taski, pomysły, problemy
- Widoczność „w górę" (agregacja z dzieci)
- Etykiety kontekstu pochodzenia przy każdym elemencie
- Global dashboard na `/` (teraz placeholder)

## Backlog

- Etap 4 — Projekty i taski
- Etap 5 — Pomysły i problemy
- Etap 6 — Strona projektu
- Etap 7 — Polishing (animacje, skróty, DnD reordering, override koloru dziecka)
- Etap 8 — Multi-user + Auth.js + panel admina
- Etap 9 — MCP server (tools: list_contexts, add_task, get_dev_logs, ...)
- Etap 10 — Wbudowany czat z Claude
- Etap 11 — Migracja na Postgres + deploy (Vercel + Neon)
