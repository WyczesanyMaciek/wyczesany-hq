# SCREENSHOTS_NEEDED.md

Lista ekranów, dla których Maciek powinien zrobić screenshoty i wrzucić je razem z briefingiem do drugiej instancji Claude. Bez obrazków trudno będzie projektować redesign.

URL produkcyjny: **`https://wyczesany-hq.vercel.app`** (po zalogowaniu zobaczy to samo, bo nie ma jeszcze auth).

---

## 🔴 Priorytet 1 — KRYTYCZNE (to musi być)

### 1. `/` — Global dashboard (Linear v2, read-only)
- **URL**: `https://wyczesany-hq.vercel.app/`
- **Co chcemy zobaczyć**: sidebar + main z sekcjami Projekty, Luźne taski, Pomysły, Problemy; badge'y kontekstu przy każdym elemencie; brak guzików dodawania
- **Wariant A**: pełny widok (desktop ≥1440px)
- **Wariant B**: jeden projekt rozwinięty (klik w chevron), żeby pokazać listę tasków wewnątrz

### 2. `/c/Legnicka` — Dashboard kontekstu z projektami
- **URL**: `https://wyczesany-hq.vercel.app/c/{id-Legnickiej}`
- **Co chcemy zobaczyć**:
  - Top bar z breadcrumbem „Konteksty / Legnicka" i pill kontekstu
  - Sekcja Projekty z kartą „Remont witryny" (ma progress bar i 3 taski)
  - Sekcja Luźne taski
  - Sekcja Pomysły z chipem „Zmienic muzyke…"
  - Sekcja Problemy z chipem „Klimatyzacja hałasuje…"

### 3. `/c/Legnicka` + task wybrany — prawy panel szczegółów
- **Jak**: kliknij w task „Zatwierdzić projekt oklejenia" (ma notatki, 2 linki, 2 attachmenty)
- **Co chcemy zobaczyć**: pełny prawy panel 320px z inline edycjami tytułu, deadline, priorytetu, assignee, notatek, listą linków, kafelkami attachmentów

### 4. `/c/Salony` — dashboard wyższego kontekstu (agregacja w górę)
- **URL**: `https://wyczesany-hq.vercel.app/c/{id-Salony}`
- **Co chcemy zobaczyć**: jak agregacja działa — Salony pokazuje też rzeczy z Legnickiej, Luxfery itd., każdy element z badge'em kontekstu pochodzenia

### 5. `/settings/contexts` — ustawienia kontekstów (brutal style)
- **URL**: `https://wyczesany-hq.vercel.app/settings/contexts`
- **Co chcemy zobaczyć**:
  - Hierarchiczna lista z licznikami
  - Neo-brutalist warm style (grube bordery, twarde cienie) — żeby druga instancja Claude zobaczyła kontrast stylów aplikacji
- **Wariant B**: modal nowego kontekstu otwarty (klik „+ Nowy kontekst") — paleta 10 kolorów i dropdown rodzica

---

## 🟡 Priorytet 2 — bardzo przydatne

### 6. Sidebar rozwinięty w pełni
- **Jak**: rozwiń wszystkie konteksty w sidebarze
- **Co chcemy zobaczyć**: pełne drzewko 16 startowych kontekstów z licznikami `Xp · Yt`, kolorami, aktywnym stanem

### 7. Inline dodawanie pomysłu/problemu
- **Jak**: na `/c/Legnicka` kliknij „+ dodaj pomysł" (albo „+ dodaj problem")
- **Co chcemy zobaczyć**: input w stanie otwartym z placeholderem „Co chodzi Ci po głowie?" lub „Co blokuje?"

### 8. Menu akcji na chipie pomysłu
- **Jak**: najedź myszką na chip pomysłu „Zmienic muzyke w Legnickiej…"
- **Co chcemy zobaczyć**: 3 guziki po prawej (`Wyrzuć`, `→ Task`, `→ Projekt`)

### 9. Modal nowego projektu (Linear v2)
- **Jak**: kliknij „+ Nowy projekt" w top barze `/c/Legnicka`
- **Co chcemy zobaczyć**: modal w Linear v2 style z nazwą, opisem, deadline, statusem

### 10. Inline dodawanie taska
- **Jak**: w projekcie „Remont witryny" kliknij „+ Dodaj zadanie" na dole body projektu
- **Co chcemy zobaczyć**: input w stanie otwartym, placeholder „Co do zrobienia?"

### 11. Drag & drop w akcji (GIF lub screenshot)
- **Jak**: zacznij przeciągać task za grip (6 kropek po lewej)
- **Co chcemy zobaczyć**: jak wygląda grip, jak wygląda przesuwany task (opacity 0.4)
- **Uwaga**: GIF lub screen recording lepiej niż static screenshot

### 12. Checkbox UX
- **Co chcemy zobaczyć**: task zaznaczony (kremowe tło + zielony znaczek `✓`) i niezaznaczony obok siebie

---

## 🟢 Priorytet 3 — fajnie by było

### 13. `/dev/colors` — paleta 10 kolorów
Dla drugiej instancji Claude to ważne żeby znać dokładnie paletę z której korzystać w mockupach.

### 14. `/dev/design-system` — preview shadcn/ui komponentów
Żeby widzieć jakie gotowce są w projekcie (Button warianty, Dialog).

### 15. `/dev/actions-test` — debug page z formularzami
Tylko dla dowodu, że istnieje — nie do pracy z tym UI.

### 16. Empty states
- Screenshot kontekstu który nie ma żadnych projektów/tasków/pomysłów/problemów
- Np. nowy kontekst utworzony przez settings, bez zawartości

### 17. Error states
- Screenshot sytuacji gdy coś poszło nie tak (np. dodawanie pomysłu z pustym polem)
- Trudne do wymuszenia ale pokazuje jak UI reaguje na błędy

### 18. Mobile view (jeśli działa)
- `/c/Legnicka` na telefonie albo w DevTools ≤768px
- Prawdopodobnie złamane — też warto wiedzieć

---

## 📹 Nagrania ekranu (bardzo przydatne)

### A. Main user flow — 30 sekund
Cel: pokazać, jak Maciek używa dashboardu end-to-end.

1. Otwarcie `/` → przejście do `/c/Legnicka` (klik w sidebarze)
2. Dodanie nowego taska („Zadzwonić do Jana")
3. Klik w task → otwarcie panelu szczegółów
4. Edycja deadline + ustawienie priorytetu
5. Dodanie pomysłu → konwersja do taska („→ Task")
6. Drag taska z projektu do luźnych

### B. Hierarchia i agregacja w górę — 20 sekund
Cel: pokazać, że stojąc na Salonach widzi rzeczy z dzieci.

1. Klik w „Salony" w sidebarze
2. Przewiń dashboard, pokazując jak elementy mają różne badge'y kontekstu
3. Klik w „Legnicka" → ten sam element bez badge'a (bo już jesteś w tym kontekście)

### C. Settings flow — 20 sekund
Cel: CRUD kontekstów.

1. Wejście do `/settings/contexts`
2. Dodanie nowego kontekstu pod „Marka Osobista" → „TikTok"
3. Edycja koloru na inny
4. Próba usunięcia kontekstu, który ma dzieci → error message
5. Usunięcie pustego kontekstu

---

## 💡 Dodatkowe materiały wizualne

- **`design-linear-v2.html`** — plik HTML z referencyjnym designem Linear v2, z którego powstało UI dashboardu. **Warto wkleić do drugiej instancji Claude razem z briefingiem** żeby miała pełen obraz wizualny. Otwórz w przeglądarce i zrób screenshot, albo wklej cały kod HTML.
- **`design-propozycje.html`** — starsze propozycje stylu brutal, jeszcze używane w `/settings` i `/dev/*`.
- **Build info** (stopka sidebaru) — screenshot z widocznym hashem commita + czasem, żeby druga instancja Claude wiedziała jaki commit bierze pod uwagę.

---

## Jak zrobić szybko dobry screenshot

1. **Rozdzielczość**: 1440×900 lub 1920×1080. Nie robi 4K, bo Claude dostanie za duży obraz.
2. **Format**: PNG (nie JPG — straty jakości na UI). Nie większy niż 2 MB per screenshot.
3. **Nazewnictwo**: `01-global-dashboard.png`, `02-legnicka-context.png`, `03-task-detail-panel.png` itd. — numeracja pomaga w kolejności.
4. **Ukryj rzeczy osobiste**: jeśli coś wrażliwego jest w tasku, edytuj lokalnie w Prisma Studio albo użyj seedowanych danych.
5. **Dark mode przeglądarki**: aplikacja jest light-only. Upewnij się, że przeglądarka nie wymusza dark mode przez rozszerzenie.

---

## Skrót — minimum wymagane (6 screenshotów)

Jeśli Maciek nie ma czasu na wszystko, niech zrobi minimum:

1. `/` — global dashboard
2. `/c/Legnicka` — dashboard kontekstu z prawym panelem zamkniętym
3. `/c/Legnicka` — dashboard kontekstu z task wybranym (prawy panel otwarty)
4. `/settings/contexts` — lista kontekstów
5. Sidebar w pełni rozwinięty (crop samego sidebaru wystarczy)
6. `design-linear-v2.html` otwarty w przeglądarce

To da drugiej instancji Claude ~80% kontekstu wizualnego.
