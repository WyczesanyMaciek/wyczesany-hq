# Inwentaryzacja warstwy wizualnej — AFTER

## Podsumowanie refaktoru

| Metryka | BEFORE | AFTER |
|---------|--------|-------|
| Inline styles total | ~190 | ~61 |
| Stare klasy (lsec, chip-row, etc.) | 35+ | 0 |
| Unikalne klasy t-* | ~20 (czesciowe) | 80+ (kompletne) |
| Pliki z zerowymi inline styles | 4 | 10 |

## Inline styles — stan po refaktorze

Wszystkie pozostale inline styles to **dynamiczne wartosci** (kolor kontekstu, width postep,
opacity DnD, position relative, minHeight, resize, flex). Nie da sie ich wyniesc do CSS.

| Plik | Inline | Powod |
|------|:---:|-------|
| search-dialog.tsx | 16 | Nie w scope refaktoru (shadcn) |
| project-view.tsx | 14 | Dynamic colors, position, opacity, flex, minHeight |
| task-detail-panel.tsx | 10 | Dynamic bg/color na chipach statusu |
| sidebar.tsx | 5 | paddingLeft depth, overflow, flex |
| user-menu.tsx | 4 | Nie w scope (drobny komponent) |
| task-checkbox.tsx | 3 | Dynamic width/height (compact mode), lineHeight |
| project-card.tsx | 3 | Dynamic progress width, context color, flex |
| linear-new-project.tsx | 3 | flex, resize |
| linear-dashboard.tsx | 2 | marginLeft auto, dynamic color |
| task-row.tsx | 1 | DnD transform/transition/opacity |

## Pliki z zerowymi inline styles

- rail.tsx
- linear-add-task.tsx
- linear-add-item.tsx
- chip-actions.tsx
- tasks-section.tsx
- projects-section.tsx
- ideas-section.tsx
- problems-section.tsx
- dialog.tsx
- button.tsx

## Kompletna mapa klas t-*

### Layout
- `.t-app` `.t-main-grid` `.t-main-content` `.t-spacer` `.t-flex-spacer`

### Rail
- `.t-rail` `.t-rail-icon` `.t-rail-icon--active`

### Sidebar
- `.t-sidebar` `.t-sidebar-brand` `.t-sidebar-brand-label` `.t-sidebar-brand-title`
- `.t-sidebar-section` `.t-sidebar-item` `.t-sidebar-item--active` `.t-sidebar-item-count`
- `.t-sidebar-item-link` `.t-sidebar-item-text` `.t-sidebar-nav` `.t-sidebar-user-border`
- `.t-sidebar-footer` `.t-sidebar-footer-link` `.t-sidebar-footer-link--active` `.t-sidebar-build`
- `.t-search` `.t-search-kbd` `.t-nav-list` `.t-chevron-btn` `.t-chevron-btn--has-children`
- `.t-context-dot`

### Content
- `.t-content` `.t-content-header` `.t-breadcrumb`

### Section
- `.t-section` `.t-section--padded` `.t-section-header` `.t-section-title`
- `.t-section-counter` `.t-section-action`

### Task Row
- `.t-task-row` `.t-task-row--done` `.t-task-row--selected`
- `.t-task-checkbox` `.t-task-checkbox--done`
- `.t-priority-dot` `.t-priority-dot--critical/--high/--medium/--low`
- `.t-task-title` `.t-task-title--done`
- `.t-task-date` `.t-task-date--overdue`
- `.t-avatar` `.t-edit-inline`

### Badge
- `.t-badge` `.t-badge--todo/--progress/--blocked/--done` `.t-badge-dot`

### Project Card
- `.t-project-card` `.t-project-header` `.t-project-name` `.t-project-meta`
- `.t-project-grip` `.t-project-grip--hidden` `.t-project-tasks`
- `.t-context-badge` `.t-progress-bar` `.t-progress-fill` `.t-progress-text`
- `.t-collapse-icon` `.t-context-pill`

### Panel
- `.t-panel` `.t-panel-tabs` `.t-panel-tab` `.t-panel-tab--active`
- `.t-panel-header` `.t-panel-title` `.t-panel-title--editable` `.t-panel-breadcrumb`
- `.t-field-row` `.t-field-label` `.t-field-value`
- `.t-panel-section` `.t-panel-section-header`
- `.t-panel-chips` `.t-panel-chip` `.t-panel-chip-dot`
- `.t-panel-actions` `.t-panel-edit-input` `.t-panel-edit-input--title/--sm`
- `.t-panel-dropdown` `.t-panel-dropdown-item`
- `.t-panel-notes` `.t-panel-file-grid` `.t-panel-file-tile`
- `.t-panel-link-list` `.t-panel-link-row` `.t-panel-link` `.t-panel-link-host`
- `.t-panel-inline-form` `.t-panel-inline-form--att` `.t-panel-form-actions`

### Buttons
- `.t-btn-primary` `.t-btn-secondary` `.t-btn-ghost` `.t-btn-sm` `.t-btn-add-text`

### Inline Add
- `.t-add-task` `.t-add-item` `.t-inline-form` `.t-inline-input` `.t-inline-hint` `.t-inline-error`

### Chips (ideas/problems)
- `.t-chip-row` `.t-chip-icon` `.t-chip-content` `.t-chip-meta`
- `.t-chip-actions` `.t-chip-action-btn`

### Ideas/Problems
- `.t-idea-row` `.t-problem-row`

### Notes
- `.t-note-card` `.t-note-card-text` `.t-note-card-textarea` `.t-note-delete`

### Project View
- `.t-project-bar` `.t-project-bar-back` `.t-project-bar-crumb` `.t-project-bar-sep`
- `.t-project-view-header` `.t-project-view-title` `.t-project-view-desc` `.t-project-view-meta`
- `.t-status-btn` `.t-status-dropdown` `.t-status-dropdown-item` `.t-status-dropdown-item--active`

### Modal
- `.t-modal-overlay` `.t-modal` `.t-modal-title` `.t-modal-body`
- `.t-modal-field` `.t-modal-field-label` `.t-modal-field-row`
- `.t-modal-input` `.t-modal-footer`

### Misc
- `.t-task-list-wrapper` `.t-drop-zone` `.t-drop-zone--active` `.t-empty-state`
- `.t-placeholder`

## Zrodla prawdy

- **tasker-ds.css** — jedyny plik ze stylami komponentow
- **globals.css** — tokeny (:root), @theme inline, @layer base, import tasker-ds.css
