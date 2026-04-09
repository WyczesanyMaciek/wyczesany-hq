# UI_INVENTORY.md — komponenty i ekrany

## Ekrany / strony

| Route | Plik | Layout | Użyty stack stylu | Co robi |
|---|---|---|---|---|
| `/` | `app/(app)/page.tsx` | Sidebar 230px + main | Linear v2 scoped `.linear-app` | Globalny read-only dashboard — wszystko z wszystkich kontekstów z badge'ami. Renderuje `LinearDashboard` z propami `readOnly isGlobal`. |
| `/c/[id]` | `app/(app)/c/[id]/page.tsx` | Sidebar 230px + main + prawy panel 320px | Linear v2 scoped `.linear-app` | Dashboard kontekstu z pełną interaktywnością. Dane z `getContextDashboard(id)`. |
| `/settings/contexts` | `app/(app)/settings/contexts/page.tsx` | Sidebar + main 4xl | **Neo-brutalist warm** (nie Linear) | Hierarchiczna lista kontekstów + modal dodawania/edycji (`ContextFormModal`). |
| `/dev/colors` | `app/(app)/dev/colors/page.tsx` | Sidebar + main | Brutal + paleta testowa | Preview 10 kolorów + dziedziczenia. |
| `/dev/logs` | `app/(app)/dev/logs/page.tsx` | Sidebar + main | Brutal | Tail 200 linii dev-server.log, auto-refresh 2s. |
| `/dev/design-system` | `app/(app)/dev/design-system/page.tsx` | Sidebar + main | Brutal + shadcn | Preview komponentów shadcn/ui. |
| `/dev/actions-test` | `app/(app)/dev/actions-test/page.tsx` | Sidebar + main | Brutal + formularze | Debug page z formularzami do wszystkich 28 server actions. |

---

## Layouty

| Plik | Co robi |
|---|---|
| `app/layout.tsx` | RootLayout — ładuje Nunito + Inter z next/font, ustawia `lang="pl"`, importuje `globals.css`, metadata `"Wyczesany HQ"`. |
| `app/(app)/layout.tsx` | AppLayout — async server component. Ładuje `getContextTree()`, renderuje `<Sidebar tree={tree}>` + children w flex. |
| `app/(app)/settings/layout.tsx` | Layout podsekcji (możliwe że tylko passthrough — nieweryfikowany w tym briefingu). |

---

## Komponenty — dashboard (Linear v2)

### `components/dashboard/linear-dashboard.tsx` (1449 linii — **MEGA-komponent**)
Główny komponent dashboardu Linear v2. Wewnątrz zdefiniowane pomocnicze komponenty:

- **`LinearDashboard`** — root
  - Props: `{ data: DashboardData; readOnly?: boolean; isGlobal?: boolean }`
  - Owija wszystko w `<DndContext>` (dnd-kit, `closestCorners`, PointerSensor z `distance: 8`)
  - State: `selectedTaskId`, `collapsed: Set<string>`, optimistic `projects` i `looseTasks` (sync z `data` via `useEffect`)
  - Sekcje w main: top bar → Projekty → Luźne taski → Pomysły → Problemy
  - Prawy panel (320px) — `TaskDetailPanel`, niewidoczny w `readOnly`
  - `handleDragEnd` — obsługuje reorder projektów, reorder tasków w kontenerze, cross-container move taska
- **`TaskRow`** (inline w pliku) — wiersz taska w dashboardzie Linear v2
  - `useSortable({ id: 'task:xxx', disabled: readOnly })`
  - Grip tylko dla drag (lucide `GripVertical`), reszta row klikalna → `onSelect`
  - `TaskCheckbox compact` + inline edit tytułu (dwuklik) + deadline + priority pills + assignee
  - Opcjonalny `<span className="ctx">` z badge kontekstu (gdy `showContextBadge`)
- **`ProjectCard`** (inline w pliku) — karta projektu
  - `useSortable({ id: 'project:xxx', disabled: readOnly })`
  - Header z gripem, nazwą, opcjonalnym badge kontekstu, progress bar, count `done/total`, deadline, chevron zwijania
  - Body: `<SortableContext>` z taskami projektu + `LinearAddTask` (tylko !readOnly)
- **`TaskDetailPanel`** (inline w pliku) — prawy panel 320px
  - Pełna edycja inline: tytuł, deadline, priorytet, assignee, notatki
  - Przyciski: Oznacz/Cofnij done, Usuń, Przenieś do projektu / Zwolnij
  - Sekcja linków (add/remove) + sekcja attachmentów (add/remove)

### `components/dashboard/linear-add-task.tsx` (129 linii)
Inline input do szybkiego dodawania taska w Linear stylu.
- Props: `{ contextId: string } | { projectId: string }` + opcjonalny `label`, `placeholder`
- Ghost state "+ Dodaj zadanie" → klik → input → Enter zapisuje (zostaje otwarty), Escape zwija
- Wywołuje `createTask({ title, contextId, projectId })`

### `components/dashboard/linear-add-item.tsx` (128 linii) — Etap 5
Generyczny inline input dla pomysłów i problemów.
- Props: `{ kind: "idea" | "problem"; contextId: string }`
- Wzorowany na `LinearAddTask`
- Wywołuje `createIdea` albo `createProblem` na podstawie propa `kind`

### `components/dashboard/chip-actions.tsx` (81 linii) — Etap 5
Menu akcji per chip pomysłu/problemu.
- Props: `{ kind: "idea" | "problem"; id: string }`
- 3 guziki w `<div className="actions">` — pokazują się na hover chipa (CSS `.chip-row:hover .actions`)
- Akcje: **Wyrzuć** (delete), **→ Task** (convertToTask), **→ Projekt** (convertToProject)
- Po akcji `router.refresh()`

### `components/dashboard/linear-new-project.tsx` (310 linii)
Modal nowego projektu w Linear stylu.
- Props: `{ contextId: string; variant?: "ghost" | "primary" | "addline" }`
- Wariant `addline` — placeholder row "+ Nowy projekt" obok nagłówka sekcji
- Wariant `ghost` — pill button w top barze
- Pola: nazwa, opis, deadline, status (4 opcje)

### `components/dashboard/task-checkbox.tsx` (74 linii) — Faza 2
Wspólny checkbox dla brutalnego i Linear v2 dashboardu.
- Props: `{ done, onToggle, compact?, disabled? }`
- **compact=false** (brutal): box 24×24, hit target 44×44 via `p-3 -m-3`
- **compact=true** (Linear): box 18×18, hit target ~32×32 via `p-1.5 -m-1.5`
- Wygląd: kremowe tło (`#FBF8F3`) + zielony lucide `Check` (`#16A34A`) kiedy done
- `motion.button` z `whileTap`, `whileHover`

### `components/dashboard/dashboard-view.tsx` (250 linii) — **DEAD CODE**
Stary widok dashboardu w stylu brutal. Był kiedyś używany na `/` — teraz `/` używa `LinearDashboard`. Zostaje do usunięcia w Etapie 7 (polishing).

### `components/dashboard/task-row.tsx` (139 linii) — **DEAD CODE**
Stary `TaskRow` + `HistoryTaskRow` w brutal stylu. Używany tylko w `dashboard-view.tsx`. Używa `TaskCheckbox` (więc nie wolno go usunąć w izolacji — musi razem z dashboard-view.tsx). Do usunięcia w Etapie 7.

### `components/dashboard/project-card.tsx` (169 linii) — **DEAD CODE**
Karta projektu w brutal stylu (dla dashboard-view.tsx). Do usunięcia w Etapie 7.

### `components/dashboard/section-card.tsx` (82 linii) — **DEAD CODE**
Pastelowy kafelek sekcji z ikoną dla brutal dashboardu. Do usunięcia.

### `components/dashboard/new-project-modal.tsx` (251 linii) — **DEAD CODE**
Modal nowego projektu w brutal stylu. Zastąpiony przez `linear-new-project.tsx`. Do usunięcia.

### `components/dashboard/add-task-inline.tsx` (174 linii) — **DEAD CODE**
Inline add task w brutal stylu z priority pills. Zastąpiony przez `linear-add-task.tsx`. Do usunięcia.

### `components/dashboard/priority-pills.tsx` (59 linii) — **DEAD CODE**
4 pills (Brak/Niski/Średni/Wysoki) dla brutal forms. Używane w add-task-inline i new-project-modal. Do usunięcia razem z nimi.

---

## Komponenty — sidebar

### `components/sidebar/sidebar.tsx` (334 linii)
- `export function Sidebar({ tree: ContextNode[] })`
- Linear v2 look: 230px, sticky, Inter 12.8px, szare linie, accent indigo `#6366f1`
- Hierarchiczne drzewko z rozwijaniem/zwijaniem (persist w localStorage: `wyczesany-hq:sidebar:expanded`)
- Aktywny kontekst: tło z alpha koloru kontekstu + border-left 3px + font-weight 800
- Active detection: `pathname.startsWith("/c/")` → id z drugiego segmentu
- Liczniki per kontekst: `{projectCount}p · {taskCount}t` (agregowane w górę)
- Footer: linki `Ustawienia`, `Logi`, `Design System`, `Colors`, build info (wersja · hash · czas)

---

## Komponenty — shadcn/ui (`components/ui/`)

### `components/ui/button.tsx`
- Oparty na `@base-ui/react/button`
- `cva` z wariantami: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- Rozmiary: `default` (h-8), `xs` (h-6), `sm` (h-7), `lg` (h-9), `icon`, `icon-xs`
- Używany głównie w `/dev/*` i `/settings`. Dashboardy Linear v2 mają własne buttony stylowane inline.

### `components/ui/dialog.tsx`
- Oparty na `@base-ui/react/dialog`
- Eksporty: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- Używany w `/settings/contexts` (modal formy kontekstu) i `/dev/design-system`.

---

## Komponenty — settings

### `app/(app)/settings/contexts/contexts-client.tsx`
Client component. Renderuje hierarchiczną listę + guzik "+ Nowy kontekst" otwierający modal.

### `app/(app)/settings/contexts/context-form-modal.tsx`
Modal do tworzenia/edycji kontekstu. Pola: nazwa (1-80), paleta 10 kolorów, dropdown rodzica (z getContextsFlat). Walidacje po stronie serwera.

### `app/(app)/settings/contexts/delete-context-button.tsx`
Przycisk usuwania z potwierdzeniem. Pokazuje listę rzeczy, które blokują usunięcie (dzieci, projekty, taski, ...).

---

## Komponenty — dev tools

### `app/(app)/dev/actions-test/client.tsx`
Duży debug component z formularzami dla każdej server action. Pozwala testować akcje bez UI dashboardu. **Zostawiony na stałe jako dev tool.**

### `app/(app)/dev/design-system/design-system-client.tsx`
Preview tokenów, buttonów, dialogów, kolorów shadcn.

---

## Referencyjne designy (HTML mockupy)

- `design-linear-v2.html` — **referencja wizualna** Linear v2 dashboardu, z której pochodzą klasy `.linear-app`, `.lbar`, `.lprj`, `.ltask`, `.chip-row`, kolory tokenów Linear (`--l-bg`, `--l-accent`, etc.)
- `design-propozycje.html` — starsze propozycje stylu (brutal), nie używane już, ale zostaje jako inspiracja

Oba pliki HTML można wrzucić do briefingu dla drugiego Claude'a jako źródło wizualne.

---

## Struktura lib

### `lib/db.ts`
Singleton PrismaClient (standard wzorzec Next.js: globalThis w dev, świeży w prod).

### `lib/colors.ts` (44 linii)
`CONTEXT_PALETTE` — 10 swatchy (hex + name PL + soft pastel). `softOf(hex)`, `hexToRgba(hex, alpha)`, `PALETTE_HEX_SET` (do walidacji).

### `lib/motion.ts`
`springSnappy` — config spring physics dla Framer Motion używany w całej aplikacji.

### `lib/utils.ts`
`cn(...classes)` — shadcn helper (`clsx` + `tailwind-merge`).

### `lib/queries/contexts.ts` (160 linii)
- `getContextTree()` → `ContextNode[]` — hierarchia z licznikami agregowanymi w górę
- `getContextById(id)` — pojedynczy kontekst z licznikami
- `getContextsFlat()` — płaska lista z depth dla dropdowna

### `lib/queries/dashboard.ts` (342 linii)
- `getContextDashboard(contextId)` → `DashboardData | null` — agregacja „w górę" (kontekst + wszyscy potomkowie)
- `getGlobalDashboard()` → `DashboardData` — wszystko z aplikacji
- Typy: `OriginContext`, `TaskAttachmentDTO`, `TaskLinkDTO`, `DashboardTask`, `DashboardProject`, `DashboardItem`, `DashboardData`

### `lib/generated/prisma/`
Prisma Client 7 — nowy generator (nie `@prisma/client` tylko out path). Wszystkie typy encji są w `lib/generated/prisma/models.ts`. **Gitignored**.
