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
