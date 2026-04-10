# TeX Resume Editor

A local web app for building and editing LaTeX resumes through a structured form interface — no LaTeX knowledge required. Built on [Jake's Resume Template](https://github.com/jakegut/resume), with a live PDF preview that recompiles as you type.

---

## Features

- **Form-based editor** — edit every section through clean input fields instead of raw LaTeX
- **Live PDF preview** — auto-compiles 1.5 s after you stop typing; side-by-side with the editor
- **Drag-and-drop sections** — reorder Education, Experience, Projects, Skills, and Certifications with a grab handle
- **Add / remove sections & entries** — add any section type, remove individual entries, or delete entire sections
- **Editable section titles** — rename any section inline
- **Bullet point editor** — add, edit, and remove bullet points per experience or project entry
- **Save / Export** — download the generated `.tex` source or the compiled PDF at any time
- **Light & dark mode** — Catppuccin Latte (light) and Mocha (dark), respects system preference, persists across sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, `@monaco-editor/react` → swapped for form UI, `@dnd-kit` |
| Backend | Node.js, Express |
| LaTeX engine | [Tectonic](https://tectonic-typesetting.github.io) (auto-downloads packages on first compile) |
| Template | [Jake's Resume Template](https://github.com/jakegut/resume) |

---

## Prerequisites

- **Node.js** ≥ 18
- **Tectonic** — the LaTeX compiler

Install Tectonic on macOS:
```bash
brew install tectonic
```

> On first compile, Tectonic downloads the required LaTeX packages automatically (~30 s). Subsequent compiles are fast.

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd texResumeApp
npm run setup      # installs deps in both backend/ and frontend/
```

### 2. Start the app

Open two terminals:

```bash
# Terminal 1 — backend (port 3001)
cd backend
node server.js

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Or from the root using `concurrently`:

```bash
npm run dev
```

### 3. Open in browser

```
http://localhost:5173
```

---

## Project Structure

```
texResumeApp/
├── package.json                  # Root scripts (dev, setup)
│
├── backend/
│   ├── server.js                 # Express API — compiles LaTeX via tectonic
│   ├── package.json
│   └── templates/
│       └── paarangat.tex         # Jake's template pre-filled (default resume)
│
└── frontend/
    ├── vite.config.js            # Proxies /api → backend
    ├── index.html
    └── src/
        ├── App.jsx               # Root: toolbar, split pane, compile logic
        ├── App.css               # All styles with CSS variable theming
        ├── main.jsx
        ├── data/
        │   └── defaultData.js    # Initial resume data model + uid helper
        ├── latex/
        │   └── builder.js        # Converts data model → Jake's LaTeX source
        └── components/
            └── FormPane.jsx      # All section editors + drag-and-drop
```

---

## API

The backend exposes two endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/compile` | Body: `{ source: string }`. Compiles LaTeX and returns a PDF binary. |
| `GET` | `/api/template` | Returns the default `.tex` template as plain text. |

---

## Supported Section Types

| Section | Fields |
|---|---|
| **Header** | Name, Phone, Email, LinkedIn, Website |
| **Education** | Institution, Location, Degree / Description, Dates |
| **Experience** | Role, Company, Location, Dates, Bullet points |
| **Projects** | Name, Dates, Technologies, Link (optional), Bullet points |
| **Technical Skills** | Category label + skills (repeating rows) |
| **Awards / Certifications** | One text item per entry |

---

## Theming

Colors are defined as CSS custom properties in `App.css`:

| Variable | Dark (Mocha) | Light (Latte) |
|---|---|---|
| `--bg-base` | `#1e1e2e` | `#eff1f5` |
| `--accent` | `#cba6f7` | `#8839ef` |
| `--tx-primary` | `#cdd6f4` | `#4c4f69` |

Toggle with the ☀️ / 🌙 button in the toolbar. Preference is saved to `localStorage`.

---

## Notes

- **Special characters** — the LaTeX builder automatically escapes `&`, `%`, `$`, `#`, `_`, `{`, `}`, `^`, `~` in all form fields, so you can type plain text freely.
- **Date ranges** — use `--` for an en-dash, e.g. `Jan. 2024 -- Present`.
- **First compile** — Tectonic downloads ~30 MB of LaTeX packages on the first run. This is cached and subsequent compiles are fast.
