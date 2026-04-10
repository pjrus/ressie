import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Find LaTeX engine
async function findLatexEngine() {
  const candidates = ['tectonic', 'pdflatex', 'xelatex', 'lualatex'];
  for (const cmd of candidates) {
    try {
      await execAsync(`which ${cmd}`);
      return cmd;
    } catch {
      // not found, try next
    }
  }
  return null;
}

// Strip pdflatex-only directives that break tectonic
function sanitizeForTectonic(source) {
  return source
    .replace(/\\input\{glyphtounicode\}/g, '')
    .replace(/\\pdfgentounicode\s*=\s*\d+/g, '');
}

// Compile LaTeX source to PDF, return PDF buffer
async function compileLaTeX(source) {
  const engine = await findLatexEngine();
  if (!engine) {
    throw new Error(
      'No LaTeX engine found. Install tectonic: brew install tectonic'
    );
  }

  // Create a temp directory
  if (engine === 'tectonic') source = sanitizeForTectonic(source);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'texresume-'));
  const texFile = path.join(tmpDir, 'resume.tex');
  const pdfFile = path.join(tmpDir, 'resume.pdf');

  try {
    await fs.writeFile(texFile, source, 'utf8');

    let cmd;
    if (engine === 'tectonic') {
      cmd = `tectonic --outdir "${tmpDir}" "${texFile}"`;
    } else {
      // pdflatex / xelatex / lualatex — run twice for proper cross-references
      const flags = `-interaction=nonstopmode -halt-on-error -output-directory="${tmpDir}"`;
      cmd = `${engine} ${flags} "${texFile}" && ${engine} ${flags} "${texFile}"`;
    }

    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 60000,
      env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
    });

    const pdfBuffer = await fs.readFile(pdfFile);
    return { pdf: pdfBuffer, log: stdout + stderr };
  } finally {
    // Clean up temp dir
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// POST /api/compile — body: { source: string }
app.post('/api/compile', async (req, res) => {
  const source = req.body?.source ?? req.body;
  if (!source || typeof source !== 'string') {
    return res.status(400).json({ error: 'Missing LaTeX source' });
  }

  try {
    const { pdf, log } = await compileLaTeX(source);
    res.set('Content-Type', 'application/pdf');
    res.set('X-Compile-Log', Buffer.from(log).toString('base64'));
    res.send(pdf);
  } catch (err) {
    const msg = err.message || 'Compilation failed';
    // Try to extract useful error lines from stdout/stderr
    const detail = err.stderr || err.stdout || '';
    res.status(422).json({ error: msg, detail });
  }
});

// GET /api/template — returns the default Jake's resume .tex populated with Paarangat's data
app.get('/api/template', async (req, res) => {
  try {
    const tplPath = path.join(__dirname, 'templates', 'paarangat.tex');
    const source = await fs.readFile(tplPath, 'utf8');
    res.set('Content-Type', 'text/plain');
    res.send(source);
  } catch {
    res.status(404).json({ error: 'Template not found' });
  }
});

// GET /api/health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  findLatexEngine().then((e) =>
    console.log(`LaTeX engine: ${e ?? 'NONE — install tectonic: brew install tectonic'}`)
  );
});
