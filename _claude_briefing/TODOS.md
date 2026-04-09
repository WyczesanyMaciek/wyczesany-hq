# TODOS.md — dług techniczny, TODO, placeholdery, znane problemy

## Oznaczenia TODO/FIXME/HACK/XXX w kodzie

**Tylko 1 formalny TODO w kodzie źródłowym:**

| Plik:linia | Typ | Treść |
|---|---|---|
| `app/api/logs/route.ts:4` | TODO(Etap 9) | Wystawić endpoint jako MCP tool `get_dev_logs`, żeby Claude mógł czytać logi przez MCP bez otwierania `/dev/logs` w UI. |

Żadnych FIXME, HACK, XXX w kodzie.

---

## Dead code do usunięcia w Etapie 7 (polishing)

Stare komponenty brutal style, nieużywane po przejściu globalnego dashboardu na Linear v2:

| Plik | Linii | Status | Uwagi |
|---|---|---|---|
| `components/dashboard/dashboard-view.tsx` | 250 | Dead | Stary widok `/`. Importuje niżej wymienione. |
| `components/dashboard/task-row.tsx` | 139 | Dead | Używa `TaskCheckbox` (który jest potrzebny!). Usunąć razem z `dashboard-view.tsx`. |
| `components/dashboard/project-card.tsx` | 169 | Dead | Karta projektu brutal. |
| `components/dashboard/section-card.tsx` | 82 | Dead | Pastelowy kafelek sekcji. |
| `components/dashboard/new-project-modal.tsx` | 251 | Dead | Zastąpiony przez `linear-new-project.tsx`. |
| `components/dashboard/add-task-inline.tsx` | 174 | Dead | Zastąpiony przez `linear-add-task.tsx`. |
| `components/dashboard/priority-pills.tsx` | 59 | Dead | Używane tylko w `add-task-inline.tsx` i `new-project-modal.tsx`. |

**Łącznie ~1124 linie do usunięcia** po weryfikacji, że nic z tego nie jest importowane z innych miejsc.

---

## Placeholdery funkcjonalne (nie wizualne)

### Top bar — filtr
`linear-dashboard.tsx` linia ~1048: `<button className="lbtn ghost">Filtry</button>` — guzik bez onClick. Filtrowanie projektów/tasków nieimplementowane.

### Sidebar — wyszukiwarka
`design-linear-v2.html` ma wyszukiwarkę `<input class="s" placeholder="Szukaj…">` w headerze sidebaru, ale w implementacji `components/sidebar/sidebar.tsx` brakuje jej. **Global search planowany w Etapie 7.**

### Nazwa projektu w ProjectCard
`linear-dashboard.tsx` — klik w `<b>{project.name}</b>` w headerze karty projektu **nie prowadzi nigdzie**. Ma w Etapie 6 prowadzić do `/c/[id]/p/[projectId]`.

### Historia rozmów z Claude
W planach Etap 6 (strona projektu) ma mieć zakładkę „Historia rozmów" — na razie nawet placeholder nie istnieje. Będzie placeholdem do Etapu 10.

### TaskDetailPanel — projekt w read-only
W `LinearDashboard readOnly`, klik w task nie otwiera panelu — przekierowuje do `/c/{context.id}`. Dobry UX, ale brakuje alternatywy: „quick peek" przez hover/modal dla szybkiego podglądu bez przeładowania strony.

---

## Znane braki DnD (do dopracowania w Etapie 7)

1. **Pusty kontener**: nie można upuścić taska na projekt, który nie ma żadnych tasków — brak `useDroppable` dla pustych containerów. Workaround: trzeba najpierw dodać jakiś task, potem przenieść inne.
2. **Drop na projekt header**: częściowo działa (prefix `project:` w dragEnd), ale zachowanie przy drop nad projekt card (nie task) jest niespójne.
3. **Cross-context DnD**: nie można przeciągnąć projektu do innego kontekstu (action `moveProjectToContext` istnieje, ale UI w sidebarze nie jest droppable).
4. **DragOverlay**: nie jest zaimplementowany — element w trakcie drag nie ma „duplikatu z cieniem", tylko oryginalny item się przesuwa (opacity 0.4).
5. **Keyboard DnD**: `KeyboardSensor` jest dodany, ale UX jest podstawowy — brak skrótów/wskazówek dla użytkownika.

---

## Znane braki UI / UX

1. **Brak error toasts**: `ChipActions` używa natywnego `alert(...)` jeśli server action zwróci błąd. Brak toasterów w całej aplikacji. Powinno się dodać `sonner` lub podobne.
2. **Brak loading states**: większość akcji używa `useTransition`, ale pending state nie jest widoczny dla użytkownika (brak spinnera/skeletonów).
3. **Brak confirmation modali**: usuwanie taska, projektu, kontekstu odbywa się bez potwierdzenia (albo tylko natywne `confirm()`).
4. **Brak empty states**: gdy dashboard jest pusty (0 projektów, 0 tasków), pokazuje tylko „Brak projektów"/„Brak luznych taskow" — brak ilustracji/CTA.
5. **Brak keyboard shortcuts**: planowane w Etapie 7, ale nie ma jeszcze żadnego (np. Cmd+K, Cmd+N, /).
6. **Brak search**: global search planowany w Etapie 7.
7. **Brak drag-to-reorder w drzewku kontekstów**: sidebar pokazuje drzewko, ale żeby zmienić kolejność/parent kontekstu trzeba wejść w `/settings/contexts` i edytować modal.
8. **Mobile responsive**: nieprzetestowane, prawdopodobnie złamane (sidebar sticky 230px + prawy panel 320px nie pasują do małych ekranów).

---

## Architektura — dług

1. **`linear-dashboard.tsx` ma 1449 linii** — za duży. `TaskRow`, `ProjectCard`, `TaskDetailPanel` są zdefiniowane inline. Do rozbicia na osobne pliki w Etapie 7.
2. **Dwa systemy stylów** w jednej aplikacji: Neo-brutalist warm (`/settings`, `/dev/*`) i Linear v2 (`/`, `/c/[id]`). Decyzja czy ujednolicić, czy zostawić — otwarta. Wpływa na sidebar (też Linear v2 look).
3. **`createLooseTask` vs `createTask`**: `createLooseTask` to alias BC na `createTask`. Można usunąć po migracji wszystkich wywołań.
4. **Brak testów**: zero unit/integration/e2e tests. `npm run build` + `npx tsc --noEmit` to cały "smoke check".
5. **Brak CI/CD check**: Vercel buduje po push do main, ale brak GitHub Actions z lint/test/typecheck przed merge.

---

## Plany niezrobione (roadmap z `PROGRESS.md`)

### 🔜 Etap 6 — Strona projektu
- Nowa route `/c/[id]/p/[projectId]`
- Query `getProjectView(projectId)`
- Layout z zakładkami: Taski / Notatki / Linki / Historia rozmów (placeholder do E10)
- Klik w nazwę projektu → strona projektu

### Etap 7 — Polishing
- Animacje Framer Motion na wejście list
- Skróty klawiszowe (Cmd+K dla quick open, `/` dla search)
- Global search
- Override koloru dziecka w kontekstach
- Usunięcie dead code (patrz wyżej)
- Drop-zone dla pustych kontenerów DnD
- Wszystkie „Znane braki UI/UX" z powyższej sekcji

### Etap 8 — Multi-user + Auth.js
- Whitelist emaili (admin dodaje w settings)
- Auth.js magic link — bez haseł
- Role: `admin`, `member`
- Tabela `UserContextAccess` z dziedziczeniem w dół
- Panel admina
- W UI każdego kontekstu: lista avatarów współpracowników

### Etap 9 — MCP server
- Wbudowany MCP server w aplikacji (MCP SDK)
- Tools: `list_contexts`, `get_context`, `add_task`, `add_idea`, `add_problem`, `add_note`, `list_tasks`, `update_task`, `get_dev_logs` (z api/logs), itp.
- Autoryzacja per user (Claude działa w imieniu konkretnego usera)

### Etap 10 — Wbudowany czat z Claude w UI
- Okienko czatu w dashboardzie
- Czat zna aktualny kontekst/projekt
- Historia rozmów zapisana per kontekst/projekt
- Claude używa MCP (z Etapu 9) do modyfikacji dashboardu

### Etap 11 — Produkcyjny deploy
- Magic link mailer (Resend?)
- Custom domain
- Migracja OVH (opcjonalnie, jeśli Maciek zmieni zdanie co do Vercel+Neon)

---

## Performance

**Nic nie zmierzone.** Brak Lighthouse, brak bundle analyzer, brak metryki czasu ładowania. Dashboard kontekstu odpytuje 4 tabele równolegle w `getContextDashboard` — powinno być OK dla skali Maćka (~5 userów, dziesiątki/setki tasków), ale nie ma żadnych indeksów w schemie poza automatycznymi PK/FK.
