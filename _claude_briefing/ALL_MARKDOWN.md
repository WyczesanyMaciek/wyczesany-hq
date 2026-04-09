
=== FILE: README.md ===

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


=== FILE: CLAUDE.md ===

# Wyczesany HQ — Mój osobisty tasker i dashboard projektów

## O mnie i o tym projekcie

Jestem Maciek. Buduję tasker i dashboard, który ma docelowo zastąpić Monday.com.
Na start aplikacja jest **dla mnie** (jeden user, lokalnie), ale **docelowo to system
biurowy dla ~5 osób z mojej firmy** z logowaniem, uprawnieniami i hostingiem na serwerze.
Ma być jedynym źródłem prawdy dla wszystkich projektów, którymi się zajmuję.
Ma ewoluować wraz ze mną.

**Mam dysleksję, dysortografię i astygmatyzm.** Piszę z błędami — ignoruj błędy
w moich wiadomościach, staraj się zrozumieć intencję. Kiedy piszesz do mnie:
krótko, konkretnie, bez długich akapitów, bez żargonu.

## Cel aplikacji

Wizualna reprezentacja wszystkich projektów, które prowadzę, w hierarchicznej strukturze.
Dashboard, na którym widzę co robię, w jakim kontekście, z czym mam problemy i jakie
mam pomysły do przemyślenia.

## Model danych (KLUCZOWE — przeczytaj zanim coś zaproponujesz)

### Konteksty
- **Konteksty są kręgosłupem aplikacji.**
- Dowolna głębokość zagnieżdżenia (np. Salony → WFM → Legnicka, ale też głębiej).
- Użytkownik dynamicznie tworzy, edytuje, usuwa konteksty.
- Każdy kontekst ma: nazwę, kolor, rodzica (albo null dla głównych), kolejność.
- Przykładowa startowa struktura:
  - Salony (fioletowy)
    - WFM
      - Legnicka
      - Łódzka
      - Zakładowa
    - Luxfera
    - Głogów
  - Not Bad Stuff (CZERWONY — nie zielony!)
    - Produkcja
    - Sprzedaż
  - Szkolenia (pomarańczowy)
  - Marka Osobista (koralowy)
    - Instagram
    - Live
    - Wyczesany Ali
    - Naffy

### W każdym kontekście mieszkają:
1. **Projekty** — konkretne rozpisane inicjatywy z taskami, deadline'em, postępem
2. **Luźne taski** — taski w kontekście, ale nie należące do żadnego projektu
3. **Pomysły** — parking myśli specyficzny dla tego kontekstu
4. **Problemy** — parking blokerów specyficzny dla tego kontekstu
5. **Notatki** — wolnotekstowe notatki
6. **Linki i pliki** — Figma, Dropbox, PDFy, kontakty
7. **Historia rozmów z Claude** — metadane rozmów, które dotyczyły tego kontekstu

### Pomysły i problemy — kluczowe zachowanie
Pomysły i problemy to **surowiec**. Użytkownik wyjmuje je po jednym i decyduje:
- wyrzucić
- zrobić z tego luźny task
- rozpisać na pełny projekt z krokami

### Projekty wewnątrz kontekstu
Projekt ma swoje własne: taski, notatki, linki, historia rozmów.
Pomysły i problemy należą do **kontekstów**, nie do projektów.

### Widoczność „w górę"
Stojąc na kontekście „Salony" widzę wszystko z Legnicka, Łódzka, Zakładowa, WFM itd.,
ale każdy element jest otagowany skąd pochodzi. Na globalnym dashboardzie widzę
wszystko z całej aplikacji, też z etykietami kontekstu.

### Każdy kontekst ma swój dashboard
Klikam „Salony" → widzę dashboard Salonów (aktywne projekty w Salonach, luźne taski
Salonów, pomysły i problemy Salonów zagregowane z dzieci). Klikam „Legnicka" → to samo
ale tylko dla Legnicka.

## Dashboard jako centrum dowodzenia (KLUCZOWE)

Ten dashboard nie jest „jeszcze jednym taskerem". To **centrum dowodzenia Maćka**:
jedno miejsce, w którym żyje cała praca, jej wizualizacja i historia.

**Trzy zasady:**

1. **Jedno źródło prawdy.** Jeśli coś dotyczy projektu — żyje w dashboardzie. Nie w
   Notion, nie w głowie, nie tylko w rozmowie z Claude.

2. **Dwukierunkowa współpraca z Claude.** Maciek rozmawia z Claude (w Cowork, Code,
   chat) — Claude umie **czytać** stan dashboardu i **pisać** do niego (dodać task,
   pomysł, problem, notatkę). Jak Maciek coś zmieni ręcznie w dashboardzie, Claude
   widzi to przy następnej rozmowie. Realizacja: **dashboard wystawia własny MCP server**,
   przez który ja (Claude) się podłączam.

3. **Czat z Claude wbudowany w UI.** W dashboardzie jest okienko czatu ze mną —
   Maciek nie musi skakać między apkami. Czat zna kontekst, w którym Maciek aktualnie
   stoi (np. otwarty projekt „Legnicka — remont") i rozmowa zostaje zapisana w
   historii rozmów tego projektu/kontekstu.

## Multi-user i uprawnienia

Na start jeden user (Maciek, lokalnie). Docelowo ~5 osób z biura.

- **Logowanie**: tylko whitelistowane emaile (Maciek dodaje je w ustawieniach jako admin).
  Bez haseł — **magic link** na maila (Auth.js).
- **Role**: `admin` (Maciek — widzi wszystko, zarządza userami i uprawnieniami)
  i `member` (reszta).
- **Dostęp do kontekstów**: Maciek w ustawieniach decyduje, do których kontekstów
  ma dostęp dany user. **Dostęp do kontekstu = automatycznie dostęp do wszystkich
  jego dzieci** (np. user dostaje „Salony" → widzi WFM, Legnicką, Łódzką, Zakładową,
  Luxferę, Głogów).
- **Lista współpracowników w UI**: w widoku każdego kontekstu i projektu, w widocznym
  miejscu (góra albo bok), avatary osób które mają dostęp do tego kontekstu. Hover →
  imię + rola.

## Hosting i migracja

- **Start (teraz):** lokalnie na Macu Maćka. SQLite jako baza, Next.js dev server.
- **Docelowo:** hosting na serwerze + Postgres. **Pisać kod od początku tak, żeby
  migracja SQLite → Postgres była zmianą jednej linii w configu Prismy** (tych samych
  typów danych używa SQLite i Postgres, nie wprowadzać niczego SQLite-only).
- **Domyślna opcja docelowa:** Vercel (hosting) + Neon (Postgres) — darmowe dla 5 userów,
  zero konfiguracji serwera.
- **Opcja alternatywna:** własny serwer OVH (mamy) — pełna kontrola, dane u nas,
  ale wymaga konfiguracji (Docker + Nginx + certyfikaty). Decyzja na później.

## Stack techniczny

- **Next.js** (App Router) — framework
- **TypeScript** — typowanie
- **Tailwind CSS** — styling
- **shadcn/ui** — gotowe komponenty
- **Prisma ORM** — z **SQLite** lokalnie, **Postgres** docelowo (jedna zmiana w configu)
- **Auth.js** (NextAuth) — logowanie magic linkiem (Etap 8)
- **MCP SDK** — żeby dashboard wystawiał własny MCP server (Etap 9)
- **Framer Motion** — animacje i mikrointerakcje
- **Lucide React** — ikony

Dane na start zapisywane lokalnie (SQLite). Docelowo Postgres na Vercel+Neon
(albo OVH). Schema i kod muszą być zgodne z oboma od dnia pierwszego.

## Wymagania wizualne i dostępność

**KLUCZOWE — nie pomijaj:**

- **Jasny motyw** — ciepłe kremowe tło (#FBF8F3), NIGDY dark mode
- **Font: Nunito** — dla całego UI (Google Fonts). Waga 400-800.
- **Rozmiar bazowy 17px**, line-height 1.65 — nie mniej
- **Nagłówki 22-38px**, waga 800-900
- **Wysoki kontrast** — tekst #1F1F2E (nie czerń), tło kremowe
- **Grube bordery** (2-3px) — sekcje mają być oczywiste, nie subtelne
- **Mało elementów naraz** — łatwo się dekoncentruję, nie ładuj ekranu
- **Kolory per kontekst** — każdy kontekst ma swój kolor, podprojekty dziedziczą odcień
- **Wszystko interaktywne** — każdy klikalny element ma wyraźny hover/focus
- **Animacje** — subtelne, nie rozpraszające, preferuj Framer Motion ze spring physics

**Unikaj:**
- Dark mode
- Cienkich fontów (weight < 400)
- Małego tekstu (< 15px)
- Gradientów w tle tekstu
- „AI slop" — generycznych, przewidywalnych układów

## Jak ze mną pracować (ZASADY)

1. **Małe kroki.** Zanim zaczniesz coś dużego, powiedz mi co planujesz zrobić i poczekaj
   na moje OK. Używaj trybu planowania (plan mode).

2. **Nie zgaduj.** Jeśli czegoś nie wiem jak chcę, zapytaj. Daj mi 2-3 opcje, nie listę 10.

3. **Pokaż mi wizualnie przed zakodowaniem.** Jeśli mam wybrać kolor, układ, styl —
   pokaż przykład, nie opisuj słowami.

4. **Małe commity.** Każdy działający krok to oddzielny commit z czytelnym opisem.

5. **Testuj na żywo.** Po każdej zmianie otwórz aplikację, sprawdź że działa, zrób
   screenshot, pokaż mi. Nie zakładaj że działa tylko dlatego że kod się skompilował.

6. **Pytaj, nie zakładaj.** Jeśli widzisz ambiwalencje — zapytaj zanim pójdziesz w jakimś
   kierunku.

7. **Mów do mnie prosto.** Krótkie zdania, bez żargonu, bez długich akapitów. Kod komentuj
   po polsku.

## Plan etapów budowy

Trzymamy się tej kolejności. Nie przeskakuj etapów.

### Etap 1 — Fundament (NAJPIERW)
- Założenie projektu Next.js + Tailwind + shadcn/ui
- Skonfigurowanie SQLite + Prisma/Drizzle
- Stworzenie schema dla: Context, Project, Task, Idea, Problem, Note, Link
- Seed z moją startową hierarchią kontekstów (patrz wyżej)

### Etap 2 — Drzewko kontekstów
- Sidebar z hierarchicznym drzewkiem kontekstów
- Rozwijanie/zwijanie
- Dodawanie nowego kontekstu (w dowolnym miejscu hierarchii)
- Edycja i usuwanie kontekstu
- Kolor per kontekst

### Etap 3 — Dashboard kontekstu
- Klik w kontekst → dashboard tego kontekstu
- Sekcja projektów, luźnych tasków, pomysłów, problemów
- Widoczność „w górę" (agregacja z dzieci)
- Etykiety kontekstu przy każdym elemencie

### Etap 4 — Projekty i taski
- Dodawanie projektu do kontekstu
- Dodawanie tasków do projektu albo jako luźne do kontekstu
- Checkbox, deadline, priorytet
- Pasek postępu projektu

### Etap 5 — Pomysły i problemy
- Dodawanie pomysłów i problemów do kontekstu
- Akcje: wyrzuć, zrób luźny task, zrób projekt z krokami
- Widoczność na dashboardzie kontekstu i w górę

### Etap 6 — Strona projektu
- Pełny widok projektu z zakładkami: taski, notatki, linki, historia rozmów
- Edycja, usuwanie

### Etap 7 — Polishing
- Animacje (Framer Motion)
- Dopieszczenie wizualne
- Skróty klawiszowe
- Global search

### Etap 8 — Multi-user, logowanie i panel admina
- Auth.js + magic link (logowanie po mailu, bez haseł)
- Whitelist emaili w ustawieniach (admin dodaje/usuwa)
- Role: admin / member
- Tabela `UserContextAccess` (kto widzi które konteksty, dziedziczenie w dół)
- Panel admina: zarządzanie userami i uprawnieniami
- W UI każdego kontekstu: lista avatarów współpracowników

### Etap 9 — MCP server (żeby Claude umiał gadać z dashboardem)
- Wbudowany MCP server w aplikacji (MCP SDK)
- Tools: list_contexts, get_context, add_task, add_idea, add_problem,
  add_note, list_tasks, update_task, itd.
- Autoryzacja per user (Claude działa w imieniu konkretnego user'a)
- Dokumentacja jak podłączyć w Cowork/Code

### Etap 10 — Wbudowany czat z Claude w UI
- Okienko czatu w dashboardzie (sidebar albo modal)
- Czat zna aktualnie otwarty kontekst/projekt
- Rozmowy zapisują się w historii rozmów tego kontekstu/projektu
- Claude w tym czacie używa MCP server (Etap 9), żeby modyfikować dashboard

### Etap 11 — Migracja na Postgres + deploy
- Zmiana provider'a Prismy z SQLite na Postgres
- Deploy na Vercel + Neon (Postgres)
- Konfiguracja domeny, certyfikatów, magic link mailera
- (Opcjonalnie później: migracja na własny OVH)

## Ważne pliki

- `CLAUDE.md` (ten plik) — przeczytaj przy każdej sesji
- `MODEL.md` — szczegółowy opis modelu danych (do stworzenia w Etapie 1)
- `PROGRESS.md` — co zrobione, co następne (do aktualizowania po każdym etapie)


=== FILE: MODEL.md ===

# Model danych — Wyczesany HQ

Krótki opis tego co siedzi w bazie. Szczegóły w `prisma/schema.prisma`.

## Zasada nadrzędna

**Schema musi być Postgres-compatible od dnia pierwszego.** Migracja z SQLite
na Postgres ma być zmianą tylko pola `provider` w `prisma/schema.prisma`.
Używamy wyłącznie typów zgodnych z oboma: `String`, `Int`, `Boolean`,
`DateTime`, `Float`. Żadnego SQLite-only.

---

## Modele

### `Context` — kręgosłup aplikacji

Hierarchiczne konteksty o dowolnej głębokości (Salony → WFM → Legnicka → ...).

- `id` — cuid
- `name` — nazwa
- `color` — hex (np. `#5B3DF5`). Dzieci dziedziczą kolor rodzica
- `order` — kolejność na liście
- `parentId` — id rodzica (null = kontekst główny)
- `parent` / `children` — self-relation
- `createdAt`, `updatedAt`

W każdym kontekście żyją: `projects`, `tasks` (luźne), `ideas`, `problems`, `notes`, `links`.

### `Project` — rozpisana inicjatywa

- `id`, `name`, `description?`
- `status` — `todo | in_progress | done | on_hold`
- `deadline?` — DateTime
- `order`
- `contextId` — kontekst, do którego należy
- własne `tasks`, `notes`, `links`

### `Task` — zadanie

Może być **luźne w kontekście** (tylko `contextId`) albo **w projekcie** (oba ID).

- `id`, `title`, `done`, `deadline?`
- `priority` — 0 = brak, 1 = low, 2 = medium, 3 = high
- `order`
- `contextId` — zawsze
- `projectId?` — opcjonalnie

### `Idea` — surowiec (pomysł)

Pomysł czeka na decyzję: wyrzuć / zrób luźny task / rozpisz na projekt.

- `id`, `content`, `createdAt`, `contextId`

### `Problem` — surowiec (bloker)

Tak samo jak Idea, ale o problemach.

- `id`, `content`, `createdAt`, `contextId`

### `Note` — wolnotekstowa notatka

Może być **w kontekście** lub **w projekcie**.

- `id`, `content`, `createdAt`, `updatedAt`
- `contextId`, `projectId?`

### `Link` — URL z etykietą

Może być **w kontekście** lub **w projekcie**.

- `id`, `url`, `label`
- `type` — `figma | dropbox | pdf | other`
- `contextId`, `projectId?`

---

## Zasady

1. **Pomysły i problemy należą do kontekstów, nie do projektów.** To surowiec
   na poziomie kontekstu.
2. **Widoczność „w górę"**: stojąc na rodzicu widzę wszystko z dzieci, ale każdy
   element jest otagowany skąd pochodzi (logika w warstwie zapytań).
3. **Task bez `projectId` = luźny task w kontekście.**
4. **Note/Link bez `projectId` = element kontekstu.**

---

## Co dodamy później (NIE w Etapie 1)

- `User`, `UserContextAccess` — Etap 8 (multi-user, uprawnienia)
- `Conversation` / `Message` — Etap 9-10 (historia rozmów z Claude)
- Pola dodatkowe (tagi, załączniki, opisy taska itd.) — w miarę potrzeb


=== FILE: PROGRESS.md ===

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


=== FILE: AGENTS.md ===

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


=== FILE: pierwszy-prompt.md ===

# Pierwszy prompt do wklejenia w Claude Code

**Instrukcja dla Maćka:**

1. Skopiuj plik `CLAUDE.md` do folderu `wyczesany-hq` na swoim komputerze.
2. Otwórz terminal.
3. Wejdź do folderu: `cd ~/Documents/wyczesany-hq`
4. Uruchom: `claude`
5. Gdy Claude Code się otworzy, wklej tekst poniżej (całą sekcję między liniami `=====`).

---

===== SKOPIUJ OD TUTAJ =====

Cześć. W tym folderze jest plik `CLAUDE.md` — przeczytaj go uważnie, bo zawiera
wszystko co musisz wiedzieć o tym projekcie: cel, model danych, wymagania wizualne,
zasady pracy ze mną i plan etapów.

**Zanim cokolwiek zrobisz:**

1. Przeczytaj `CLAUDE.md` od początku do końca.
2. Powiedz mi krótko (3-5 zdań), co zrozumiałeś — co budujemy i jaki jest plan.
3. Zapytaj o wszystko, co jest dla Ciebie niejasne. Nie zgaduj.
4. Jak dogadamy się co do rozumienia, przejdziemy do **Etapu 1 — Fundament**.

**Etap 1 to tylko:**
- Założenie projektu Next.js z TypeScript i Tailwind
- Dodanie shadcn/ui
- Konfiguracja SQLite + Prisma (albo Drizzle, wybierz prostsze)
- Stworzenie schematu bazy dla: Context, Project, Task, Idea, Problem, Note, Link
- Seed danych z moją startową hierarchią (jest opisana w CLAUDE.md)

**Nie rób jeszcze UI, nie rób dashboardu, nie rób żadnych widoków.** Chcę najpierw
mieć fundament: projekt się uruchamia, baza działa, seed przechodzi, mogę otworzyć
Prisma Studio (albo podobne) i zobaczyć dane.

**Pamiętaj o zasadach z CLAUDE.md:**
- Małe kroki, pytaj przed dużymi decyzjami
- Tryb planowania przed dużą zmianą
- Prosto ze mną rozmawiaj — mam dysleksję, piszę z błędami
- Testuj że wszystko działa zanim powiesz „gotowe"

Zaczynaj od podsumowania CLAUDE.md, poczekaj na moje OK, dopiero potem jakiekolwiek
polecenia shell czy pisanie kodu.

===== DO TUTAJ =====

