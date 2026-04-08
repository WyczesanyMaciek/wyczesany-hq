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
