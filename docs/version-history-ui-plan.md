# Version History UI — Implementation Plan

## Goal

Wire `src/utils/versionManager.js` (`saveVersion`, `loadVersions`, `restoreVersion`, `deleteVersion`) into `src/components/Editor.jsx` and `src/App.jsx`, and add a Version History drawer/panel so users can browse auto-saves and manual snapshots, label checkpoints, and restore previous résumé states.

---

## Current State & Existing Foundations

- **`src/utils/versionManager.js`** already implements `localStorage`-backed version storage under `ressie:resume:<id>:versions`:
  - `saveVersion(resumeId, data, settings, label = '', isManual = false)` — deep-clones `data` and `settings`, assigns `versionId` and `timestamp`, appends, and prunes to the 20 most recent entries via `pruneVersions`.
  - `loadVersions(resumeId)` — loads version history (with legacy key migration).
  - `restoreVersion(resumeId, versionId)` — returns deep-cloned `{ data, settings }` for a given `versionId`.
  - `deleteVersion(resumeId, versionId)` and `clearVersions(resumeId)`.
- **`src/utils/storageManager.js`** already includes `loadVersions(metadata.id)` in `exportFullBackup()`.
- **`src/App.jsx`** owns `activeResumeId`, `resumeData`, `settings`, and `handleSaveResume`.
- **`src/components/Editor.jsx`** owns the editor toolbar, mobile action drawer (`drawerOpen`), `handleSave`, and the debounced LaTeX `compile(resumeData, settings)` loop.

---

## Proposed Changes

### 1. `src/utils/versionManager.js`
- Add `renameVersion(resumeId, versionId, newLabel)` to allow labeling or relabeling an existing checkpoint (and promoting it to `isManual: true` if desired, or keeping its type).
- Add a lightweight `hasContentChanged(resumeId, data, settings)` helper (comparing against the latest stored version) so periodic auto-saves do not create duplicate entries when nothing was edited.

### 2. `src/App.jsx`
- Ensure `handleSaveResume` (or a dedicated `handleRestoreVersion` callback) cleanly updates `resumeData`, `settings`, persists via `saveResume(activeResumeId, nextData, nextSettings)`, and refreshes `resumesList` so the dashboard metadata (`updatedAt`, template) stays in sync after a restore.

### 3. `src/components/Editor.jsx`
- **Toolbar & Mobile Drawer**:
  - Add a **History** button in the desktop `.toolbar-group--right` (or next to **Save** in `.toolbar-group--left`) and a matching entry in the mobile side drawer.
  - Clicking toggles `historyOpen` state (closing on `Escape`).
- **Auto-save Snapshots**:
  - Add a debounced/periodic auto-save effect (e.g., every 30s of idle after edits, or on significant debounced changes) that calls `saveVersion(activeResumeId, resumeData, settings, '', false)` when `hasContentChanged` is true, and refreshes the drawer list if open.
- **Manual Checkpoints**:
  - When the user clicks **Save** (or creates a snapshot from inside the Version History drawer), allow saving a labeled manual checkpoint via `saveVersion(activeResumeId, resumeData, settings, label, true)`.
- **Restore Flow**:
  - Before applying a restored version, save a safety auto-snapshot of the current state (if changed) so the user never loses in-progress edits.
  - Call `restoreVersion(activeResumeId, versionId)`, update `resumeData` and `settings`, persist via `onSave`, and trigger `compile(restored.data, restored.settings)` if auto-compile is off or let the auto-compile effect run.

### 4. `src/components/VersionHistoryDrawer.jsx` (New)
- Slide-over drawer anchored to the right edge of the editor, styled to match Ressie's **"The Ledger & the Sheet"** design tokens (`--bg-surface`, `--border`, `--radius-sm: 0`, `--font-mono` with `tabular-nums` for timestamps, `--accent` for active/manual indicators).
- **Header**: Title (`Version History`), close button (`Esc` or backdrop click).
- **Create Checkpoint Bar**: Optional text input (`Checkpoint label...`) + **Save Snapshot** button.
- **Filter Tabs**: `All` | `Checkpoints` (`isManual`) | `Auto-saves`.
- **Version List** (newest first):
  - Displays label, formatted timestamp (and relative time), `Checkpoint` / `Auto` badge, and template name (`settings.template`).
  - Actions per item:
    - **Restore** — restores `data` and `settings` into the editor.
    - **Label / Rename** — inline input to set or edit `version.label`.
    - **Delete** — removes the entry via `deleteVersion`.
- **Empty State**: Clear prompt explaining that auto-saves and manual checkpoints will appear here.

### 5. Styling (`src/styles/editor.css`, `src/styles/responsive.css`)
- Add `.version-drawer-backdrop`, `.version-drawer`, `.version-drawer-header`, `.version-checkpoint-form`, `.version-filter-tabs`, `.version-list`, `.version-item`, and badge styles using existing CSS variables in `src/styles/variables.css`.
- Ensure full-width / responsive layout on mobile viewports (`max-width: 639px`).

---

## Verification Plan

1. **Build check**: Run `npm run build` and confirm zero Vite/Rollup errors.
2. **Manual UI & Persistence Testing (`npm run dev`)**:
   - Open a résumé in the editor; make edits and verify an auto-save appears in the Version History drawer without duplicating unchanged states.
   - Create a labeled manual checkpoint from the drawer and verify it persists across page reloads (`localStorage` key `ressie:resume:<id>:versions`).
   - Filter between `All`, `Checkpoints`, and `Auto-saves`.
   - Rename an existing version label and delete a version.
   - Restore an older version and verify:
     - Current unsaved edits are captured in a pre-restore snapshot.
     - `FormPane` fields and `settings` (including template) update immediately.
     - `PdfViewer` recompiles and displays the restored résumé.
   - Verify light/dark theme contrast and mobile drawer behavior.
