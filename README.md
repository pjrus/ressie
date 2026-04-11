# ressie

A local web app for building and editing LaTeX resumes through a structured form interface — no LaTeX knowledge required. Includes a live PDF preview that recompiles as you type and supports multiple templates: Jake's Resume, Awesome-CV, and Deedy Resume.

## Privacy-First by Design

This is a privacy-oriented, local-first app.

- Resume content is edited locally in your browser UI.
- Compilation runs on your own local backend (`localhost`).
- No external cloud service is required for resume generation.
- No account, sign-in, or third-party tracking is built into the app.

---

## Features

- **Dashboard-based workflow** — create, search, open, duplicate, pin, archive, and delete resumes from a central dashboard
- **Custom tags** — add free-form tags to any resume (e.g. "internship", "ats-friendly", "google") directly from the dashboard card; filter the resume list by one or more tags; tags persist in localStorage
- **Form-based editor** — edit every section through clean input fields instead of raw LaTeX
- **Privacy-oriented workflow** — build and compile resumes fully on your machine (frontend + local backend)
- **Template switcher** — choose between Jake's Resume, Awesome-CV, and Deedy Resume from the Resume Editor section header
- **Live PDF preview** — auto-compiles 1.5 s after you stop typing; side-by-side with the editor
- **Full screen PDF viewer** — expand the PDF preview to fill the entire screen for distraction-free review; exit with Esc or the close button
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
| Templates | [Jake's Resume](https://github.com/jakegut/resume), [Awesome-CV](https://github.com/posquit0/Awesome-CV), Deedy Resume (app-adapted) |

---

## Prerequisites

- **Node.js** ≥ 18
- **Tectonic** — the LaTeX compiler

Install Tectonic on macOS:
```bash
brew install tectonic
```

Install Tectonic on Linux:

Ubuntu / Debian:
```bash
sudo apt update
sudo apt install tectonic
```

Fedora:
```bash
sudo dnf install tectonic
```

Arch Linux:
```bash
sudo pacman -S tectonic
```

Install Tectonic on Windows:

Using winget:
```powershell
winget install TectonicTypesetting.Tectonic
```

Using Chocolatey:
```powershell
choco install tectonic
```

> On first compile, Tectonic downloads the required LaTeX packages automatically (~30 s). Subsequent compiles are fast.

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd ressie
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

## Docker Deployment

This app can run as a single Docker service: the backend serves the compiled frontend and handles `/api/compile` on the same origin.

### Build locally

```bash
docker build -t tex-resume-app .
docker run -p 3001:3001 tex-resume-app
```

### Render

Use the included `render.yaml` and create a new Web Service from the repo. Render will build the Dockerfile and expose the app on the service URL.

### Notes

- The container installs Tectonic at build time. If you change the version, update the URL in the `Dockerfile`.
- The app listens on `PORT` when provided by the host platform, otherwise it defaults to `3001`.

### 3. Open in browser

```
http://localhost:5173
```

---

## App Flow

1. Open the app on the **Dashboard** to view all resumes.
2. Create a resume (name + template) or open an existing one.
3. Tag resumes with labels (e.g. "internship", "google") using the tag icon on each card; filter by tags using the tag filter bar.
4. Work in the **Editor** with side-by-side form and PDF preview.
5. Change template from the **Resume Editor** section header when needed.
6. Auto-compile updates preview after a short debounce, or use **Compile** manually.
7. Use **Full Screen** in the editor toolbar to review the PDF without distractions; press Esc or click "Exit Full Screen" to return.
8. Use **Save** to persist changes, then go **Back** to return to the Dashboard.

---

## Project Structure

```
ressie/
├── package.json                  # Root scripts (dev, setup)
│
├── backend/
│   ├── server.js                 # Express API — compiles LaTeX via tectonic
│   ├── package.json
│   └── templates/
│       ├── awesome-cv.cls
│       ├── altacv.cls
│       ├── paarangat.tex         # Jake's template pre-filled reference
│       └── deedy/
│           └── deedy-template.tex # Deedy-style reference template/assets
│
└── frontend/
    ├── vite.config.js            # Proxies /api → backend
    ├── index.html
    └── src/
        ├── App.jsx               # Root app flow: dashboard, editor navigation, state orchestration
        ├── App.css               # All styles with CSS variable theming
        ├── main.jsx
        ├── data/
        │   └── defaultData.js    # Initial resume data model + uid helper
        ├── latex/
        │   ├── builder.js        # Converts data model → Jake's LaTeX source
        │   ├── awesomecv-builder.js # Converts data model → Awesome-CV source
        │   ├── deedy-builder.js  # Converts data model → Deedy-style source
        │   └── utils.js          # Shared escaping + date helpers
        └── components/
            ├── Dashboard.jsx     # Resume list, tag filter bar, tag editor, and quick actions
            ├── Editor.jsx        # Form + PDF preview workspace (incl. fullscreen overlay)
            ├── CreateResumeModal.jsx # Create new resume dialog
            ├── QuickActionsMenu.jsx  # Card actions (rename, duplicate, archive, etc.)
            ├── FormPane.jsx      # All section editors + drag-and-drop
            └── PdfViewer.jsx     # PDF preview with zoom controls
```

---

## API

The backend exposes two endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/compile` | Body: `{ source: string }`. Compiles LaTeX and returns a PDF binary. |
| `GET` | `/api/template` | Returns the default `.tex` template as plain text. |

All template compilation uses the same API path (`POST /api/compile`). The frontend sends a fully self-contained `.tex` document generated by the selected builder.

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

Toggle with the ☀️ / 🌙 button in the top toolbar. Preference is saved to `localStorage`.

---

## Notes

- **Special characters** — the LaTeX builder automatically escapes `&`, `%`, `$`, `#`, `_`, `{`, `}`, `^`, `~` in all form fields, so you can type plain text freely.
- **Date ranges** — use `--` for an en-dash, e.g. `Jan. 2024 -- Present`.
- **First compile** — Tectonic downloads ~30 MB of LaTeX packages on the first run. This is cached and subsequent compiles are fast.
