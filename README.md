# ressie

A local-first web app for building and editing LaTeX resumes through a structured form interface — no LaTeX knowledge required. Includes an in-browser WebAssembly LaTeX compiler with a live PDF preview that recompiles as you type, supporting four templates: **Jake's Resume**, **Awesome-CV**, **Deedy Resume**, and **Harvard CV**.

## Privacy-First by Design

This is a privacy-oriented, local-first app.

- Resume content is edited and stored locally in your browser (`localStorage`).
- LaTeX compilation runs client-side in your browser via WebAssembly (`@siglum/engine`).
- No backend server or account is required.
- No sign-in or third-party tracking is built into the app.

---

## Features

- **Dashboard-based workflow** — create, search, open, duplicate, pin, archive, and delete resumes from a central dashboard
- **Custom tags** — add free-form tags to any resume (e.g. "internship", "ats-friendly", "google") directly from the dashboard card; filter the resume list by one or more tags
- **JSON import / export & AI helper** — import/export individual resumes or full backups as JSON, with built-in AI conversion prompts in the Help modal
- **Form-based editor** — edit every section through clean input fields instead of raw LaTeX
- **Template switcher** — choose between Jake's Resume, Awesome-CV, Deedy Resume, and Harvard CV
- **Live PDF preview** — auto-compiles in-browser 1.5 s after you stop typing; side-by-side with the editor
- **Full screen PDF viewer** — expand the PDF preview to fill the entire screen for distraction-free review; exit with Esc or the close button
- **Drag-and-drop sections** — reorder Education, Experience, Projects, Skills, and Certifications with a grab handle
- **Add / remove sections & entries** — add any section type, remove individual entries, or delete entire sections
- **Editable section titles** — rename any section inline
- **Bullet point editor** — add, edit, and remove bullet points per experience or project entry
- **Save / Export** — download the generated `.tex` source or compiled `.pdf` at any time
- **Light & dark mode** — pure white (light) and true black (dark) with a dark purple accent, respects system preference, persists across sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, `@dnd-kit`, `react-pdf`, `html2canvas` |
| LaTeX engine | `@siglum/engine` (TeX Live WebAssembly in a Web Worker) |
| Templates | [Jake's Resume](https://github.com/jakegut/resume), [Awesome-CV](https://github.com/posquit0/Awesome-CV), Deedy Resume, Harvard CV |
| Deployment | Static build via GitHub Actions → GitHub Pages |

---

## Prerequisites

- **Node.js** ≥ 18

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/pjrus/ressie.git
cd ressie
npm install --legacy-peer-deps
```

### 2. Start the app

```bash
npm run dev
```

### 3. Open in browser

```
http://localhost:5173
```

### Build for production

```bash
npm run build
npm run preview
```

---

## App Flow

1. Open the app on the **Dashboard** to view all resumes.
2. Create a resume (name + template), or import an existing JSON resume.
3. Tag resumes with labels (e.g. "internship", "google") using the tag icon on each card; filter by tags using the tag filter bar.
4. Work in the **Editor** with side-by-side form and live PDF preview.
5. Change template from the **Resume Editor** section header when needed.
6. Auto-compile updates the preview after a short debounce, or use **Compile** manually.
7. Use **Full Screen** in the editor toolbar to review the PDF without distractions; press Esc or click "Exit Full Screen" to return.
8. Use **Save** to persist changes, then go **Back** to return to the Dashboard.

---

## Project Structure

```
ressie/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions build & GitHub Pages deploy
├── index.html                        # App entry HTML & theme-color metadata
├── package.json                      # Dependencies & Vite scripts (dev, build, preview)
├── vite.config.js                    # Vite config (GitHub Pages base path & blake3 shim)
├── DESIGN.md                         # Design system tokens & rules
├── ROADMAP.md                        # Product & engineering roadmap
└── src/
    ├── main.jsx                      # React entry point
    ├── App.jsx                       # Root app flow: dashboard, editor navigation, state
    ├── App.css                       # Stylesheet entry importing src/styles/*
    ├── data/
    │   └── defaultData.js            # Initial resume data model, settings & uid helper
    ├── hooks/
    │   └── useMediaQuery.js          # Responsive breakpoint hook
    ├── latex/
    │   ├── wasmCompiler.js           # In-browser @siglum/engine WASM compiler queue
    │   ├── blake3-shim.js            # Pure-JS hash shim for Vite bundling
    │   ├── awesome-cv.cls            # Bundled Awesome-CV class file for WASM MEMFS
    │   ├── builder.js                # Data model → Jake's Resume LaTeX source
    │   ├── awesomecv-builder.js      # Data model → Awesome-CV LaTeX source
    │   ├── deedy-builder.js          # Data model → Deedy Resume LaTeX source
    │   ├── harvard-builder.js        # Data model → Harvard CV LaTeX source
    │   └── utils.js                  # Shared LaTeX escaping, URL & date range helpers
    ├── styles/
    │   ├── variables.css             # Theme tokens (light/dark, accent, typography)
    │   ├── base.css                  # Reset, typography rules, toolbar, buttons
    │   ├── dashboard.css             # Dashboard cards, tags, filters, modals
    │   ├── editor.css                # Split layout, form fields, PDF viewer
    │   └── responsive.css            # Mobile sheet & drawer adjustments
    ├── utils/
    │   ├── storageManager.js         # localStorage persistence, JSON import/export & backups
    │   ├── thumbnailManager.js       # Resume card thumbnail capture via html2canvas
    │   └── versionManager.js         # Version snapshot helpers
    └── components/
        ├── Dashboard.jsx             # Resume list, search, tag filter, backup & quick actions
        ├── Editor.jsx                # Form + live PDF preview workspace & fullscreen overlay
        ├── FormPane.jsx              # Section editors & drag-and-drop reordering
        ├── PdfViewer.jsx             # PDF preview with zoom controls
        ├── CreateResumeModal.jsx     # New resume dialog
        ├── ImportResumeModal.jsx     # JSON resume import dialog
        ├── HelpModal.jsx             # JSON schema & AI conversion prompts
        └── QuickActionsMenu.jsx      # Card actions (rename, duplicate, archive, etc.)
```

---

## Supported Section Types

| Section | Fields |
|---|---|
| **Header** | Name, Phone, Email, LinkedIn, Website |
| **Education** | Institution, Location, Degree / Description, Dates |
| **Experience** | Role, Company, Location, Dates, Bullet points |
| **Projects** | Name, Dates, Technologies, Link (optional), Bullet points |
| **Technical Skills** | Category label + skills (repeating rows) |
| **Awards / Certifications** | One text item + optional URL per entry |

---

## Theming

Colors are defined as CSS custom properties in `src/styles/variables.css`:

| Variable | Light | Dark |
|---|---|---|
| `--bg-base` | `#ffffff` | `#000000` |
| `--bg-surface` | `#ffffff` | `#0a0a0b` |
| `--accent` | `#581c87` | `#9333ea` |
| `--tx-primary` | `#111113` | `#f5f5f5` |

Toggle with the ☀️ / 🌙 button in the top toolbar. Preference is saved to `localStorage`.

---

## Notes

- **Special characters** — the LaTeX builders automatically escape `&`, `%`, `$`, `#`, `_`, `{`, `}`, `^`, `~`, and `\` in all form fields, so you can type plain text freely.
- **First compile** — `@siglum/engine` fetches its WASM runtime and required TeX Live bundles on the first compile and caches them in browser storage for subsequent compiles.
