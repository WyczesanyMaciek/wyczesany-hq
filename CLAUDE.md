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
