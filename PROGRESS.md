# PROGRESS — Wyczesany HQ

## ✅ Etap 1 — Fundament (DONE)

- Next.js 16 + TypeScript + Tailwind v4 + App Router (Turbopack)
- Bazowy motyw: Nunito, kremowe tło `#FBF8F3`, tekst `#1F1F2E`,
  rozmiar 17px, line-height 1.65, brak dark mode
- shadcn/ui zainicjalizowane (preset base-nova, neutral)
- Prisma 7 + **Postgres (Neon)**
- Schema 9 modeli: Context, Project, Task, TaskAttachment, TaskLink,
  Idea, Problem, Note, Link — wszystkie Postgres-compatible
- Seed: 16 startowych kontekstów + testowy projekt w Legnickiej z 3 taskami
- `lib/db.ts` — singleton PrismaClient
- **Deploy: Vercel + Neon** (https://wyczesany-hq.vercel.app)

## ✅ Etap 2 — Drzewko kontekstów + Ustawienia + Dev tools (DONE)

- **Sidebar 280px, sticky h-screen**
  - Hierarchiczne drzewko z bazy, kropka koloru per kontekst
  - Liczniki zagregowane w górę `Xp · Yt`
  - Rozwijanie/zwijanie (localStorage: `wyczesany-hq:sidebar:expanded`)
  - Aktywny kontekst: tło rgba koloru (0.13) + border-left 3px + font-weight 800
  - Routing do `/c/[id]`
  - Footer: linki Ustawienia / Logi + build info (v · hash · czas)
- **Query kontekstów** (`lib/queries/contexts.ts`)
  - `getContextTree()` — hierarchia z agregacją liczników w dół
  - `getContextById()`, `getContextsFlat()`
- **Settings → Konteksty** (`/settings/contexts`)
  - Read-only hierarchiczna lista z licznikami
  - Modal CRUD: nazwa, paleta 10 kolorów, dropdown rodzica
  - Usuwanie z blokadą (kontekst musi być pusty)
- **Server actions kontekstów** (`/settings/contexts/actions.ts`)
  - createContext / updateContext / deleteContext
  - Walidacje: nazwa 1-80, kolor z palety, brak cykli, blokada niepustych
- **Dev tools**
  - `/dev/colors` — paleta i dziedziczenie kolorów
  - `/dev/logs` — tail dev-server.log, auto-refresh 2s
  - `/dev/design-system` — preview shadcn/ui
  - `/dev/actions-test` — debug page dla wszystkich server actions
- **Build info** w `next.config.ts` — git hash + build time w env

## ✅ Etap 3 — Dashboard kontekstu (DONE)

- `/c/[id]` — dashboard kontekstu w **Linear v2 style** (scoped `.linear-app`)
- `/` — dashboard globalny (brutal style)
- `lib/queries/dashboard.ts`
  - `getContextDashboard(id)` — agregacja „w górę" (kontekst + wszyscy potomkowie)
  - `getGlobalDashboard()` — wszystko z aplikacji
  - Każdy element ma badge kontekstu pochodzenia
- **Sekcje dashboardu**: projekty, luźne taski, pomysły, problemy
- Prawy panel 320px ze szczegółami klikniętego taska
- Zwijanie/rozwijanie projektów z progress barem

## ✅ Etap 4 — Projekty i taski (DONE)

### Server actions (`/c/[id]/actions.ts`)
- `createProject`, `deleteProject`, `reorderProjects`, `moveProjectToContext`
- `createTask` (nowa, akceptuje contextId lub projectId), `createLooseTask` (alias BC)
- `toggleTask`, `deleteTask`, `reorderTasks`
- `moveTaskToProject`, `releaseTaskFromProject`
- `updateTaskDetails` (title, deadline, priority, assignee, notes)
- `addTaskLink`, `removeTaskLink`
- `addTaskAttachment`, `removeTaskAttachment`

### Interaktywność dashboardu (podłączona w tej fazie)
- **TaskRow** (w sekcji luźnych tasków i w projektach):
  - Klik checkboxa → `toggleTask`
  - Dwuklik w tytuł → inline edit → `updateTaskDetails({ title })`
  - Klik w wiersz → wybór → prawy panel pokazuje szczegóły
- **Prawy panel (TaskDetailPanel)**:
  - Przycisk „Oznacz jako zrobione" → `toggleTask`
  - Przycisk „Usuń" (z potwierdzeniem) → `deleteTask`
  - Klik tytułu (h4) → inline edit
  - Klik deadline/priorytet/assignee → inline edit (input/select)
  - Notatki → edytowalny textarea, onBlur zapisuje
  - „→ Do projektu" → dropdown z listą projektów → `moveTaskToProject`
  - „↶ Zwolnij z projektu" → `releaseTaskFromProject`
  - Linki: „+ Dodaj link" (label+URL inline form), krzyżyk usuwa
  - Attachmenty: „+ dodaj" (kind+name+URL inline form), klik w kafelek usuwa
- **Dodawanie tasków i projektów**:
  - `components/dashboard/linear-new-project.tsx` — modal w Linear stylu
    (wersje: primary, ghost, addline)
  - `components/dashboard/linear-add-task.tsx` — inline input (ghost →
    rozwija się w pole, Enter zapisuje i zostaje otwarty, Escape zwija)
  - Podłączone w topbarze, sekcji projektów, sekcji luźnych tasków
    i w bodzie każdego projektu

## ✅ Etap 5 — Pomysły i problemy (DONE)

- **Server actions** (`/c/[id]/actions.ts`): `createIdea`, `deleteIdea`,
  `convertIdeaToTask`, `convertIdeaToProject`, + identyczne dla `Problem`
- **`LinearAddItem`** (`components/dashboard/linear-add-item.tsx`) —
  generyczny inline input z propem `kind: "idea" | "problem"`, wzorowany
  na `LinearAddTask`. Enter zapisuje, Escape zwija.
- **`ChipActions`** (`components/dashboard/chip-actions.tsx`) — menu na hover
  chipu z trzema akcjami: **Wyrzuć** / **→ Task** / **→ Projekt**
- Konwersja transakcyjna (`prisma.$transaction`): pomysł/problem znika,
  nowy task/projekt powstaje w tym samym kontekście z content jako tytułem

## ✅ Faza 2 — Fixes + DnD + globalny dashboard (DONE)

### TaskCheckbox (`components/dashboard/task-checkbox.tsx`)
- Wspólny komponent dla `task-row.tsx` (brutal) i `linear-dashboard.tsx` (Linear v2)
- Kremowe tło `#FBF8F3` + zielony znaczek ✓ (`#16A34A`) zamiast pełnego tła
- Hit target: 44×44 (brutal, via `p-3 -m-3`), ~32×32 (Linear v2 compact) —
  łatwo kliknąć mimo dysleksji i astygmatyzmu

### Drag & Drop (`@dnd-kit/core` + `sortable` + `utilities`)
- **Grip-only**: drag uruchamia się tylko z uchwytu `<GripVertical>`,
  reszta row normalnie klikalna (panel szczegółów)
- `PointerSensor` `activationConstraint: { distance: 8 }` — drag startuje
  dopiero po 8px przesunięciu
- Sortowanie projektów w ramach kontekstu → `reorderProjects`
- Sortowanie tasków w ramach kontenera (projekt albo luźne) → `reorderTasks`
- Cross-container dla tasków: drag z projektu A do B → `moveTaskToProject`,
  drag z projektu do luźnych → `releaseTaskFromProject`
- Optimistic UI: lokalny `useState` mirror + `router.refresh()` po akcji

### Globalny dashboard `/` w stylu Linear v2
- `LinearDashboard` z propami `readOnly` i `isGlobal`
- `/` renderuje ten sam komponent bez prawego panelu, bez DnD, bez edycji
- Badge'y kontekstu pochodzenia przy każdym projekcie i tasku
- Klik w task/projekt na `/` → navigate do `/c/{context.id}`
- Stare `DashboardView` i `task-row.tsx` zostają jako nieużywany kod —
  do sprzątnięcia w Etapie 7 (polishing)

## 🔜 Etap 6 — Strona projektu (NEXT)

- Nowa route `/c/[id]/p/[projectId]`
- Pełny widok projektu: taski, notatki, linki, historia rozmów (placeholder do E10)
- Query `getProjectView(projectId)`
- Klik w nazwę projektu na dashboardzie → strona projektu

## Backlog

- Etap 7 — Polishing (animacje, skróty, global search, override koloru dziecka,
  sprzątanie `dashboard-view.tsx` + `task-row.tsx`, drop-zone dla pustych kontenerów DnD)
- Etap 8 — Multi-user + Auth.js + panel admina
- Etap 9 — MCP server (tools: list_contexts, add_task, get_dev_logs, ...)
- Etap 10 — Wbudowany czat z Claude
- Faza porządków — decyzja estetyki (Linear v2 vs brutal) i refactor
