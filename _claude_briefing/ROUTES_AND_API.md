# ROUTES_AND_API.md — routing, server actions, API

## Struktura routingu (Next.js App Router)

Route group `(app)` nie zmienia URL — pozwala tylko na wspólny layout z sidebarem.

| Route | Plik | Opis | Stan |
|---|---|---|---|
| `/` | `app/(app)/page.tsx` | Globalny dashboard — wszystko ze wszystkich kontekstów, **read-only**, Linear v2 style. Klik w task/projekt → navigate do kontekstu. | ✅ Done |
| `/c/[id]` | `app/(app)/c/[id]/page.tsx` | Dashboard konkretnego kontekstu — Linear v2 style, pełna interaktywność (CRUD + DnD + prawy panel szczegółów taska). | ✅ Done |
| `/settings` | `app/(app)/settings/page.tsx` | Redirect → `/settings/contexts`. | ✅ Done |
| `/settings/contexts` | `app/(app)/settings/contexts/page.tsx` | Lista hierarchiczna kontekstów + modal CRUD. Neo-brutalist style. | ✅ Done |
| `/dev/colors` | `app/(app)/dev/colors/page.tsx` | Preview palety 10 kolorów kontekstów + dziedziczenie. | ✅ Done |
| `/dev/logs` | `app/(app)/dev/logs/page.tsx` | Tail ostatnich 200 linii `.next/dev-server.log`, auto-refresh co 2s. Dev tool. | ✅ Done |
| `/dev/design-system` | `app/(app)/dev/design-system/page.tsx` | Preview komponentów shadcn/ui. Dev tool. | ✅ Done |
| `/dev/actions-test` | `app/(app)/dev/actions-test/page.tsx` | Debug page z wywoływaniem wszystkich server actions przez formularze. Dev tool. | ✅ Done |

## API routes

| Route | Plik | Opis |
|---|---|---|
| `GET /api/logs` | `app/api/logs/route.ts` | Zwraca JSON `{ lines, total, path }` z ostatnimi 200 liniami dev-server.log. Używane przez `/dev/logs`. TODO(Etap 9): wystawić jako MCP tool `get_dev_logs`. |

---

## Server actions — `app/(app)/c/[id]/actions.ts`

Wszystkie zwracają `Result<T>`:
```ts
type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
```

Każda akcja wywołuje `revalidatePath("/", "layout")` po mutacji.

### Projekty

| Action | Sygnatura | Opis |
|---|---|---|
| `createProject` | `(contextId, { name, description?, deadline?, status? })` | Tworzy projekt w kontekście. Walidacja nazwy 1-120 znaków, status z enuma. |
| `deleteProject` | `(projectId)` | Usuwa projekt + kaskadowo jego taski, notatki, linki (transakcja). |
| `reorderProjects` | `(orderedIds: string[])` | Zapisuje kolejność projektów (order = index). |
| `moveProjectToContext` | `(projectId, contextId)` | Przenosi projekt do innego kontekstu, aktualizuje też `contextId` wszystkich jego tasków. |

### Taski

| Action | Sygnatura | Opis |
|---|---|---|
| `createTask` | `({ contextId?, projectId?, title, deadline?, priority? })` | Uniwersalne tworzenie taska — luźny (`contextId`) lub w projekcie (`projectId`, kontekst dziedziczony). |
| `createLooseTask` | `(contextId, { title, deadline?, priority? })` | Alias BC dla `createTask` bez projectId. |
| `toggleTask` | `(taskId)` | Przełącza `done`. |
| `deleteTask` | `(taskId)` | Usuwa task. |
| `reorderTasks` | `(orderedIds: string[])` | Zapisuje kolejność w ramach jednego kontenera (projektu lub luźnych w kontekście). |
| `moveTaskToProject` | `(taskId, projectId)` | Przenosi taska do projektu. Kontekst taska = kontekst projektu. Order = max+1. |
| `releaseTaskFromProject` | `(taskId)` | Zwalnia taska z projektu (staje się luźny w kontekście projektu). |
| `updateTaskDetails` | `(taskId, { title?, notes?, deadline?, priority?, assigneeId? })` | Edycja szczegółów. `undefined` = nie zmieniaj, `null` = wyczyść. |

### Task — linki i załączniki

| Action | Sygnatura | Opis |
|---|---|---|
| `addTaskLink` | `(taskId, { label, url })` | Dodaje link do taska. Walidacja label 1-120, url 1-2000. |
| `removeTaskLink` | `(linkId)` | Usuwa link. |
| `addTaskAttachment` | `(taskId, { kind, name, url })` | Dodaje załącznik. Kind: `image | video | file`. Bez uploadu — URL zewnętrzny. |
| `removeTaskAttachment` | `(attachmentId)` | Usuwa załącznik. |

### Pomysły (Ideas) — Etap 5

| Action | Sygnatura | Opis |
|---|---|---|
| `createIdea` | `(contextId, { content })` | Walidacja content 1-500 znaków. |
| `deleteIdea` | `(ideaId)` | Usuwa pomysł (bez confirmation). |
| `convertIdeaToTask` | `(ideaId)` → `{ taskId }` | Transakcja: usuń pomysł + utwórz luźny task z `content` jako tytułem (pierwsza linia, max 200 znaków). |
| `convertIdeaToProject` | `(ideaId)` → `{ projectId }` | Transakcja: usuń pomysł + utwórz projekt. `name` = pierwsza linia (max 120), `description` = pełna treść jeśli dłuższa. |

### Problemy (Problems) — Etap 5

Analogicznie do Ideas:
- `createProblem(contextId, { content })`
- `deleteProblem(problemId)`
- `convertProblemToTask(problemId)` → `{ taskId }`
- `convertProblemToProject(problemId)` → `{ projectId }`

---

## Server actions — `app/(app)/settings/contexts/actions.ts`

| Action | Sygnatura | Opis |
|---|---|---|
| `createContext` | `({ name, color, parentId })` | Walidacja: name 1-80 znaków, color z `PALETTE_HEX_SET` (10 kolorów), parent istnieje. Order = max+1 wśród siblings. |
| `updateContext` | `(id, { name, color, parentId })` | Edycja + ochrona przed cyklem (rodzic nie może być potomkiem). |
| `deleteContext` | `(id)` | **Blokada usuwania niepustego** — sprawdza: dzieci, projekty, taski, pomysły, problemy, notatki, linki. Jeśli którekolwiek > 0, zwraca error z listą. |

---

## Podsumowanie liczbowe

- **28 server actions** w `c/[id]/actions.ts` (~660 linii)
- **3 server actions** w `settings/contexts/actions.ts` (~155 linii)
- **1 API route** (`/api/logs`)
- **6 widocznych stron** (`/`, `/c/[id]`, `/settings/contexts`) + 4 dev tools
- **Brak JWT/auth** — jedno-userowy dev mode. Auth.js planowany w Etapie 8.
