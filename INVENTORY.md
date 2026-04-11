# Inwentaryzacja — stan po mega-prompt

## Metryki

| Metryka | Phase 2 (before) | Mega-prompt (after) |
|---------|:-:|:-:|
| Inline styles | ~61 | ~66 (nowe komponenty) |
| Stare klasy (lsec, etc.) | 0 | 0 |
| Unikalne klasy t-* w CSS | ~100 | 214 |
| MCP tools | 10 | 18 |
| Prisma models | 11 | 12 (+Subtask) |
| Server actions | ~25 | ~40 |
| Queries | 4 | 7 |

## Nowe komponenty

| Komponent | Plik | Opis |
|-----------|------|------|
| QuickAddModal | `components/dashboard/quick-add-modal.tsx` | N shortcut, 4 typy, kontekst/projekt select |
| SubtaskList | `components/dashboard/shared/subtask-list.tsx` | Checklista krokow w panelu bocznym |

## Nowe server actions (Etap 2)

- `addSubtask`, `toggleSubtask`, `deleteSubtask`, `updateSubtaskTitle`, `reorderSubtasks`
- `updateIdea` (content, description)
- `updateProblem` (content, description, priority)
- `archiveContext`, `unarchiveContext`

## Nowe queries (Etap 2)

- `getOverdueTasks()` — deadline <= today, not done
- `getMyTasks(assignee?)` — pogrupowane po kontekscie
- `getUrgentProblems()` — priority >= 2

## Nowe MCP tools (Etap 9)

| Tool | Typ | Opis |
|------|-----|------|
| get_overdue | READ | Przeterminowane taski |
| get_urgent_problems | READ | Problemy pilne (prio >= 2) |
| search | READ | Full-text po taskach/projektach/ideach/problemach |
| get_project | READ | Pelne szczegoly projektu z subtaskami |
| update_task | WRITE | Zmiana title/priority/deadline/assignee/notes/done |
| add_subtask | WRITE | Dodaj krok do taska |
| toggle_subtask | WRITE | Przelacz status subtasku |
| convert_idea | WRITE | Konwertuj pomysl na task/projekt |

## Prisma schema changes

- **Context:** +icon (String?), +description (String?), +archived (Boolean)
- **Idea:** +description (String?)
- **Problem:** +description (String?), +priority (Int, 0-3)
- **Task:** +subtasks relation
- **Subtask:** nowy model (id, title, done, order, taskId)

## CSS nowe klasy

### Quick Add
t-quickadd-backdrop, t-quickadd, t-quickadd-input, t-quickadd-options,
t-quickadd-chip, t-quickadd-chip--active, t-quickadd-select, t-quickadd-footer,
t-quickadd-hint, t-quickadd-sep

### Subtask
t-subtask-list, t-subtask-item, t-subtask-checkbox, t-subtask-checkbox--done,
t-subtask-title, t-subtask-title--done, t-subtask-delete, t-subtask-add,
t-subtask-input, t-subtask-progress

### Global Dashboard
t-global-dashboard, t-dashboard-section, t-dashboard-section-title,
t-counter-bar, t-counter-card, t-counter-value, t-counter-label,
t-context-grid, t-context-card, t-context-card-icon, t-context-card-body,
t-context-card-name, t-context-card-count, t-overdue-badge

### Empty states / Skeletons
t-empty-state--centered, t-empty-icon, t-empty-text,
t-skeleton, t-skeleton-row, t-skeleton-card

### Animacje
t-btn-primary:active, t-btn-secondary:active, t-btn-ghost:active (scale 0.97)

## Changelog mega-prompt

### Dodane (features)
1. **Prisma: Subtask model** + nowe pola (icon, description, priority, archived)
2. **Server actions:** subtasks CRUD, updateIdea/Problem, archiveContext
3. **Queries:** getOverdueTasks, getMyTasks, getUrgentProblems
4. **Quick Add Modal** z klawiszem N, 4 typy, kontekst/projekt select
5. **Subtask Checklist** w panelu bocznym (toggle, edit, add, delete)
6. **Button active feedback** (scale 0.97)
7. **Global Dashboard** z sekcjami: Dzisiaj, Liczniki, Problemy pilne, Konteksty
8. **MCP Server:** 8 nowych tools (total: 18)
9. **Empty states + loading skeletons** (CSS + project section)
10. **Rail:** Plus button dla Quick Add

### Wymaga dalszej pracy
- Etap 5: Idea/Problem panel (rozbudowa panelu bocznego o typy)
- Etap 7: Keyboard shortcuts hook (poza N i /, ktore juz dzialaja)
- Etap 10: FilterBar z URL params
- Etap 12: Settings page cleanup
- Collapsible sections z Framer Motion
- DnD na subtaskach
