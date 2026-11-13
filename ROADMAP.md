# Ressie Roadmap

**Ressie** is a privacy-first, local-first LaTeX résumé workbench ("The Ledger & the Sheet").  
This roadmap tracks what is already built and outlines planned milestones grounded in the current codebase.

---

## Current State (Shipped)

- **Multi-resume dashboard** — create, search, pin, duplicate, rename, archive, tag/filter, and delete résumés stored in `localStorage` (`frontend/src/utils/storageManager.js`, `Dashboard.jsx`).
- **JSON backup & restore** — export and import résumé JSON files (`ImportResumeModal.jsx`, `storageManager.js`).
- **Form-based LaTeX editor** — structured editing for Header, Education, Experience, Projects, Technical Skills, and Awards / Certifications with drag-and-drop section reordering via `@dnd-kit` (`FormPane.jsx`).
- **Three LaTeX templates** — live switching between Jake's Resume (`builder.js`), Awesome-CV (`awesomecv-builder.js`), and Deedy Resume (`deedy-builder.js`).
- **Local LaTeX compilation & live PDF preview** — debounced auto-compile via Express + Tectonic (`backend/server.js`), zoomable PDF viewer with fullscreen mode (`PdfViewer.jsx`, `Editor.jsx`), and `.tex` / `.pdf` export.
- **"The Ledger & the Sheet" design system** — Warm Paper / Ultramarine light theme, inverted dark mode, square-cornered hairline UI, responsive mobile sheet/drawer, and keyboard help modal (`DESIGN.md`, `frontend/src/styles/`, `HelpModal.jsx`).
- **Docker & Render deployment** — single-container production build serving the Vite frontend from Express (`Dockerfile`, `render.yaml`).

---

## Near-Term (v1.1 — Completing Existing Foundations)

1. **Version History UI**
   - Wire `frontend/src/utils/versionManager.js` (`saveVersion`, `loadVersions`, `restoreVersion`) into `Editor.jsx` and `App.jsx`.
   - Add a version history drawer/panel to browse auto-saves and manual snapshots, label checkpoints, and restore previous states.
2. **AltaCV Template Support**
   - `backend/templates/altacv.cls` is already bundled in the backend; add `frontend/src/latex/altacv-builder.js` and register AltaCV in the template switcher (`CreateResumeModal.jsx`, `Editor.jsx`).
3. **Rich Inline Formatting & Field Controls**
   - Support safe inline formatting (bold, italic, inline links) in bullet points without requiring raw LaTeX.
   - Add bullet-level drag-and-drop reordering and quick duplicate/move actions within Experience and Projects.
4. **Page-Fit & Margin Controls**
   - Expose per-résumé typography/spacing settings (font size, page margins, section spacing, page size A4 vs. US Letter) in `settings` so users can fit a résumé onto 1 page without editing `.tex`.
   - Show a clear page-count badge / 1-page overflow indicator in the preview header.

---

## Mid-Term (v1.2 — Smarter Authoring & Portability)

1. **Custom Sections & Flexible Schema**
   - Allow users to add custom/generic sections (e.g., Publications, Volunteer, Summary/Objective, Coursework) beyond the six fixed section types.
2. **Raw `.tex` Escape Hatch (Split / Inspect Mode)**
   - Add a read-only or editable `.tex` drawer in the editor so power users can inspect generated LaTeX, see exact error line numbers from `X-Compile-Log` / compile `detail`, and optionally tweak output.
3. **Improved Compile Diagnostics**
   - Parse Tectonic / `pdflatex` error logs on the backend into structured line/message diagnostics highlighted in the UI.
4. **Optional `.tex` / PDF Import**
   - Parse common `.tex` templates (starting with Jake's Resume) or structured JSON Resume (`jsonresume.org`) schemas into Ressie's data model.
5. **Storage Resilience**
   - Add `localStorage` quota monitoring and bulk export (`.zip` of all résumés as JSON + `.tex`) to prevent silent data loss when thumbnails and version histories accumulate.

---

## Long-Term (v2.0 — Power Workflows, Still Local-First)

1. **IndexedDB Migration**
   - Move résumé data, version snapshots, and rendered thumbnails from `localStorage` to IndexedDB for higher capacity and faster non-blocking reads.
2. **Tailoring & Diff View**
   - Compare two résumé versions or two tailored variants side by side (e.g., base résumé vs. role-specific variant) with section/bullet diffs.
3. **Optional Local-First AI Assist (BYO Key / Local LLM)**
   - Opt-in, user-configured local (Ollama) or BYO-key assistance for bullet-point tightening, action-verb suggestions, and keyword alignment against a pasted job description — disabled by default to preserve zero-telemetry privacy.
4. **Desktop / Offline Packaging**
   - Package Ressie as a standalone desktop app (e.g., Tauri or Electron) bundling Tectonic so non-technical users don't need Node.js or Homebrew.

---

## Technical Debt, Testing & Documentation

- **Automated Testing**
  - Add unit tests for LaTeX escaping and all template builders (`frontend/src/latex/*.js`) and `storageManager.js` / `versionManager.js` (e.g., via Vitest).
  - Add backend API integration tests for `POST /api/compile` and `GET /api/health`.
- **Documentation Sync**
  - Update `README.md` to match the current codebase (replace references to `App.css` and Catppuccin Latte/Mocha with `frontend/src/styles/` and `DESIGN.md`, and document JSON import/export and `HelpModal`).
- **Dependency Hygiene**
  - Remove unused `multer` from `backend/package.json` (and `html2canvas` from root `package.json` if only needed in `frontend/`) and address open Dependabot PRs.
- **Backend Compile Concurrency & Caching**
  - Add basic compile request cancellation / queuing on the frontend (`AbortController`) and optional caching of identical `.tex` payloads to avoid redundant Tectonic runs.
