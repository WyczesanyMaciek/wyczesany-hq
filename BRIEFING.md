# BRIEFING — Wyczesany HQ

_Data: 2026-04-09 · Commit: `9aa8725` feat: / uzywa LinearDashboard readOnly+isGlobal_

## 1. TL;DR

Wyczesany HQ to osobisty tasker i dashboard projektów Maćka — docelowo system biurowy dla ~5 osób, który ma zastąpić Monday.com. Kręgosłupem aplikacji są **hierarchiczne konteksty** (np. Salony → WFM → Legnicka) o dowolnej głębokości, a w każdym kontekście żyją projekty, luźne taski, pomysły, problemy, notatki i linki. Etap: **MVP jedno-userowy**, działa end-to-end na Vercel + Neon Postgres (`wyczesany-hq.vercel.app`). Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 + Postgres + shadcn/ui + `@dnd-kit` + motion (Framer) + lucide-react. Zrobione Etapy 1-5 + Fazy fixes/DnD/globalny dashboard; brakuje strony projektu (Etap 6), polishingu, multi-userów (Auth.js), MCP servera i wbudowanego czatu z Claude. Maciek ma dysleksję i astygmatyzm — wymagania wizualne: kremowe tło `#FBF8F3`, font Nunito 17px base, wysoki kontrast, grube bordery, **nigdy dark mode**. Dashboardy `/` i `/c/[id]` używają stylu "Linear v2" (font Inter, kompaktowo, scoped pod `.linear-app`), a `/settings` i `/dev/*` używają Neo-brutalist warm (Nunito, grube bordery). Plan etapów i zasady pracy ze mną są w `CLAUDE.md` — to najważniejszy dokument projektu.

## 2. Struktura folderów

```
wyczesany-hq/
├── app/                          # Next.js App Router — strony, layouty, API, server actions
│   ├── (app)/                    # route group — wspólny layout z sidebarem
│   │   ├── page.tsx              # / — globalny dashboard (read-only Linear v2)
│   │   ├── c/[id]/               # /c/[id] — dashboard kontekstu + server actions
│   │   ├── settings/contexts/    # CRUD kontekstów (brutal style) + server actions
│   │   └── dev/                  # dev tools: colors, logs, design-system, actions-test
│   ├── api/logs/                 # GET /api/logs — tail dev-server.log (używa /dev/logs)
│   ├── layout.tsx                # root layout — Nunito + Inter fonts, PL, meta
│   └── globals.css               # paleta, tokeny, Linear v2 scope, brutal classes (824 linii)
├── components/
│   ├── dashboard/                # komponenty dashboardu — Linear v2 + dead brutal code
│   ├── sidebar/                  # sidebar 230px hierarchiczny z drzewkiem
│   └── ui/                       # shadcn/ui (button, dialog) oparte na @base-ui/react
├── lib/
│   ├── db.ts                     # singleton PrismaClient
│   ├── colors.ts                 # CONTEXT_PALETTE (10 kolorów hex + soft)
│   ├── motion.ts                 # spring physics config dla Framer Motion
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   ├── queries/                  # server queries: getContextTree, getContextDashboard, getGlobalDashboard
│   └── generated/prisma/         # Prisma Client 7 (gitignored)
├── prisma/
│   ├── schema.prisma             # schema bazy — 9 modeli, Postgres-compatible
│   ├── seed.ts                   # 16 startowych kontekstów + testowe dane
│   └── migrations/               # 2 migracje: init_postgres + tasks_details_and_order
├── public/                       # statyczne svg (nieużywane)
├── _claude_briefing/              # pełny audyt pakietu briefingu (robione wcześniej — zobacz poniżej)
├── CLAUDE.md                     # NAJWAŻNIEJSZY — cel, model danych, wymagania wizualne, etapy, zasady pracy
├── MODEL.md                      # krótki opis modelu danych
├── PROGRESS.md                   # stan etapów (Etapy 1-5 + Faza 2 done, Etap 6 next)
├── AGENTS.md                     # krótka notatka o Next.js 16 breaking changes
├── README.md                     # boilerplate create-next-app (nieważne)
├── pierwszy-prompt.md             # pierwszy prompt jakim Maciek otworzył projekt
├── design-linear-v2.html         # referencja wizualna Linear v2 dla dashboardu
├── design-propozycje.html        # starsze propozycje brutal (historyczne)
└── package.json, tsconfig.json, next.config.ts, prisma.config.ts, components.json, postcss.config.mjs, eslint.config.mjs, .gitignore
```

## 3. Model domeny

Ze `prisma/schema.prisma` (Postgres, provider `postgresql`, 9 modeli):

### `Context` — kręgosłup aplikacji (hierarchia o dowolnej głębokości)
`id, name, color (hex), order, parentId?, createdAt, updatedAt` + relacje: `parent/children` (self-relation), `projects[], tasks[], ideas[], problems[], notes[], links[]`

### `Project` — rozpisana inicjatywa wewnątrz kontekstu
`id, name, description?, status (todo|in_progress|done|on_hold), deadline?, order, contextId, createdAt, updatedAt` + `tasks[], notes[], links[]`

### `Task` — zadanie (luźne w kontekście lub w projekcie)
`id, title, done, deadline?, priority (0-3), order, assigneeId? (string bez FK), notes?, contextId, projectId?, createdAt, updatedAt` + `attachments[], links[]`

### `TaskAttachment` — pliki/zdjęcia doklejone do taska
`id, taskId, kind (image|video|file), url (external), name, createdAt` — cascade delete

### `TaskLink` — linki per task
`id, taskId, label, url, createdAt` — cascade delete

### `Idea` — surowiec, pomysł czeka na decyzję (wyrzuć / → task / → projekt)
`id, content, contextId, createdAt`

### `Problem` — surowiec, bloker do przemyślenia
`id, content, contextId, createdAt`

### `Note` — wolnotekstowa notatka (w kontekście lub projekcie)
`id, content, contextId, projectId?, createdAt, updatedAt`

### `Link` — URL z etykietą i typem (figma|dropbox|pdf|other) w kontekście lub projekcie
`id, url, label, type, contextId, projectId?, createdAt`

**Zasada**: `Task` bez `projectId` = luźny w kontekście. `Note`/`Link` bez `projectId` = element kontekstu. `Idea`/`Problem` należą **tylko** do kontekstów, nie do projektów. Agregacja "w górę" (stojąc na Salonach widzę rzeczy z Legnickiej) realizowana w warstwie zapytań.

**Enumy** są zapisane jako `String` żeby zachować SQLite-compatibility — walidacja w server actions.

## 4. Co zrobione / co nie

### ✅ Zrobione
- **Etap 1** — Fundament: Next.js 16, Prisma 7 + Postgres, schema 9 modeli, seed 16 kontekstów, deploy Vercel+Neon
- **Etap 2** — Drzewko kontekstów: sidebar 230px hierarchiczny, settings CRUD, dev tools (colors, logs, design-system, actions-test), build info w stopce
- **Etap 3** — Dashboard kontekstu: `/c/[id]` Linear v2 z sekcjami projektów/tasków/pomysłów/problemów, prawy panel szczegółów taska, query z agregacją "w górę"
- **Etap 4** — Projekty i taski: modal nowego projektu, inline add task, TaskRow z toggle done i inline edit, pełna edycja taska w prawym panelu (tytuł, deadline, priorytet, assignee, notatki, linki, załączniki)
- **Etap 5** — Pomysły i problemy: server actions + LinearAddItem generyczny + ChipActions menu (Wyrzuć / → Task / → Projekt) z konwersją transakcyjną
- **Faza 2** — Fixes + DnD + globalny dashboard:
  - TaskCheckbox kremowy z zielonym ✓, hit target 44×44 (accessibility dla dysleksji/astygmatyzmu)
  - Drag & drop projektów i tasków z `@dnd-kit` (grip-only, cross-container move między projektami i luźnymi, optimistic UI)
  - Globalny dashboard `/` w stylu Linear v2 (read-only, bez DnD, bez edycji, badge'y kontekstu)

### 🔜 Nie zrobione
- **Etap 6** — Strona projektu `/c/[id]/p/[projectId]` z zakładkami (taski/notatki/linki/historia rozmów)
- **Etap 7** — Polishing: animacje, skróty klawiszowe, global search, override koloru dziecka, sprzątanie dead code, drop-zone dla pustych kontenerów DnD, toast notifications, confirmation modale, loading states, empty states, mobile responsive
- **Etap 8** — Multi-user + Auth.js magic link + whitelist emaili + `UserContextAccess` z dziedziczeniem w dół + panel admina
- **Etap 9** — MCP server wbudowany w aplikację (tools: list_contexts, add_task, get_dev_logs, ...)
- **Etap 10** — Wbudowany czat z Claude w UI (czat zna aktualny kontekst, używa MCP z Etapu 9)
- **Etap 11** — Produkcyjny deploy z magic link mailerem i custom domain

### 🧹 Dług techniczny
- `linear-dashboard.tsx` ma **1449 linii** — za duży, do rozbicia
- Dead code do usunięcia: `dashboard-view.tsx`, `task-row.tsx`, `project-card.tsx`, `section-card.tsx`, `new-project-modal.tsx`, `add-task-inline.tsx`, `priority-pills.tsx` (~1124 linii) — pozostałości po brutal dashboardzie, zastąpione przez Linear v2
- Dwa systemy stylów (brutal + Linear v2) — decyzja o ujednoliceniu otwarta
- Zero testów, brak CI checks poza Vercel build

## 5. Ostatnia aktywność

Ostatnie 20 commitów pokrywa całą Fazę 2: commity 11-18 wprowadziły Etap 5 (pomysły/problemy + konwersje), nowy checkbox kremowy z zielonym ✓ (naprawa UX po feedbacku Maćka), drag & drop z `@dnd-kit`, i globalny dashboard `/` w stylu Linear v2 przez propy `readOnly` + `isGlobal` w `LinearDashboard`. Wszystko zmergowane do `main`, wypchnięte na Vercel, Maciek potwierdził że Faza 1 (Etap 3+4) działa po ręcznym redeploy'u (webhook GitHub→Vercel był zepsuty). Branch deweloperski: `claude/continue-project-QZ07s`, główny: `main`.

## 6. Czego brakuje w tym briefingu (pokaż na żądanie)

Ten briefing to szkielet — szczegóły są w `_claude_briefing/` (pełny 10-plikowy audyt zrobiony wcześniej) i w kodzie. Kiedy druga instancja Claude będzie pytać:

- **pełny audyt z wszystkimi plikami manifestów, routes, UI inventory, domain model, todo, screenshots, git log, scalony dump markdown** → pokaż folder `_claude_briefing/` (9 plików gotowe: ALL_MARKDOWN.md, MANIFESTS.md, ROUTES_AND_API.md, UI_INVENTORY.md, DOMAIN_MODEL.md, TODOS.md, SCREENSHOTS_NEEDED.md, GIT_LOG.txt, PROJECT_TREE.txt)
- **cel produktu, wymagania wizualne, zasady pracy z Maćkiem, plan etapów** → `CLAUDE.md` (najważniejszy dokument, ~4k tokenów)
- **stan etapów z opisem co było w każdym commicie** → `PROGRESS.md`
- **krótki opis modelu danych po polsku** → `MODEL.md`
- **referencja wizualna Linear v2** (z której powstało UI dashboardu) → `design-linear-v2.html` w root, plik HTML z pełnym mockupem — warto otworzyć w przeglądarce lub wkleić kod
- **UI dashboardu Linear v2** (1449 linii mega-komponenta) → `components/dashboard/linear-dashboard.tsx`
- **UI sidebaru hierarchicznego** → `components/sidebar/sidebar.tsx`
- **server actions dla dashboardu kontekstu** (28 funkcji) → `app/(app)/c/[id]/actions.ts`
- **server actions dla CRUD kontekstów** → `app/(app)/settings/contexts/actions.ts`
- **query z agregacją "w górę"** (kluczowe dla zrozumienia jak działa hierarchia) → `lib/queries/dashboard.ts`
- **paleta 10 kolorów kontekstów** (hex + nazwa PL + soft pastel) → `lib/colors.ts`
- **startowe dane** (hierarchia Salony/NBS/Szkolenia/Marka + testowe taski/pomysły/problemy) → `prisma/seed.ts`
- **ekrany UI jak faktycznie wyglądają** → Maciek musi zrobić screenshoty (lista w `_claude_briefing/SCREENSHOTS_NEEDED.md`)
- **produkcyjny URL** → `https://wyczesany-hq.vercel.app` (ten sam commit co lokalnie, bez auth)
- **pełen CSS (paleta, tokeny, Linear v2 scope, brutal classes)** → `app/globals.css` (824 linii)
