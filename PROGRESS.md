# PROGRESS — Wyczesany HQ

## ✅ Etap 1 — Fundament (DONE)

- [x] Next.js 16 + TypeScript + Tailwind v4 + App Router (Turbopack)
- [x] Bazowy motyw: Nunito, kremowe tło `#FBF8F3`, tekst `#1F1F2E`,
      rozmiar 17px, line-height 1.65, brak dark mode
- [x] shadcn/ui zainicjalizowane (preset base-nova, neutral)
- [x] Prisma 7 + SQLite + adapter `better-sqlite3`
- [x] Schema 7 modeli (Context, Project, Task, Idea, Problem, Note, Link)
      — wszystkie pola Postgres-compatible
- [x] Pierwsza migracja `init` zaaplikowana
- [x] Seed: 16 startowych kontekstów (Salony, Not Bad Stuff, Szkolenia,
      Marka Osobista + dzieci) + testowy projekt „Remont witryny"
      w Legnickiej z 3 taskami
- [x] `lib/db.ts` — singleton PrismaClient
- [x] MODEL.md, PROGRESS.md
- [x] Git inicjowany, commity małe i opisowe

## 🔜 Etap 2 — Drzewko kontekstów (NEXT)

- [ ] Sidebar z hierarchicznym drzewkiem
- [ ] Rozwijanie/zwijanie gałęzi
- [ ] Dodawanie kontekstu (w dowolnym miejscu hierarchii)
- [ ] Edycja i usuwanie kontekstu
- [ ] Picker koloru per kontekst
- [ ] Server actions do CRUD-a kontekstów
- [ ] Dziedziczenie koloru po rodzicu jeśli dziecko nie ma własnego

## Backlog (kolejne etapy)

- Etap 3 — Dashboard kontekstu
- Etap 4 — Projekty i taski
- Etap 5 — Pomysły i problemy
- Etap 6 — Strona projektu
- Etap 7 — Polishing
- Etap 8 — Multi-user + Auth.js + panel admina
- Etap 9 — MCP server
- Etap 10 — Wbudowany czat z Claude
- Etap 11 — Migracja na Postgres + deploy
