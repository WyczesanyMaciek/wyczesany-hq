# Inwentaryzacja warstwy wizualnej — BEFORE

## Inline styles per plik

| Plik | Inline styles |
|------|:---:|
| project-view.tsx | 53 |
| task-detail-panel.tsx | 42 |
| linear-new-project.tsx | 22 |
| sidebar.tsx | 19 |
| search-dialog.tsx | 16 |
| project-card.tsx | 10 |
| linear-dashboard.tsx | 5 |
| linear-add-task.tsx | 5 |
| user-menu.tsx | 4 |
| linear-add-item.tsx | 4 |
| task-checkbox.tsx | 3 |
| task-row.tsx | 2 |
| tasks-section.tsx | 2 |
| rail.tsx | 1 |
| projects-section.tsx | 1 |
| problems-section.tsx | 1 |
| **TOTAL** | **~190** |

## Stare klasy (non t-*)

| Klasa | Uzycia |
|-------|:---:|
| lsec | 5 |
| lsec-head | 5 |
| cnt | 4 |
| txt | 2 |
| meta | 2 |
| ln | 2 |
| grip | 2 |
| chip-row | 2 |
| add | 2 |
| url | 1 |
| tile add | 1 |
| pill-ctx | 1 |
| llinks | 1 |
| lbar | 1 |
| icn p / icn i | 2 |
| ic | 1 |
| files | 1 |
| crumb | 1 |

## t-* klasy juz w uzyciu

Czesciowo wdrozone: t-rail, t-sidebar, t-task-row, t-project-card, t-panel, t-badge, t-section-header/title/counter, t-btn-primary/secondary, t-field-row/label/value, t-panel-tabs/tab.

## Brakujace t-* klasy w komponentach

- sidebar.tsx: brand header, footer, search kbd — inline styles
- tasks-section.tsx: wrapper div — inline styles
- ideas-section.tsx: chip-row, icn, txt, meta — stare klasy
- problems-section.tsx: chip-row, icn, txt, meta — stare klasy
- project-card.tsx: grip, progress wrapper — inline styles
- task-detail-panel.tsx: chipy statusu, buttony, form fields — inline styles
- project-view.tsx: lsec, lsec-head, cnt, lbar, crumb — stare klasy + inline
- linear-new-project.tsx: modal — inline styles
- linear-add-task.tsx: input wrapper — inline styles
- linear-add-item.tsx: input wrapper — inline styles
- chip-actions.tsx: actions div — no t-* class
- task-checkbox.tsx: caly komponent — inline styles

## globals.css — stare reguly do usuniecia

- .eyebrow (zastapiony przez t-sidebar-section / t-section-title)
- .ds-card, .ds-card:hover
- .ds-btn, .ds-btn:active, .ds-btn-sm, .ds-btn-md, .ds-btn-primary/secondary/ghost
- .ds-badge
- .ds-input, .ds-input::placeholder, .ds-input:hover, .ds-input:focus
- .brutal-card, .brutal-btn, .brutal-btn-primary

## Cel refaktoru

- Zero inline styles (wyjatki: dynamiczne color, width, paddingLeft, opacity, transform/transition z DnD)
- Zero starych klas (lsec, lbar, chip-row, etc.)
- Kazdy komponent uzywa t-* klas z tasker-ds.css
- globals.css = tylko tokeny, resety, Tailwind, import tasker-ds.css
