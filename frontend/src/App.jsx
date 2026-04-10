import { useState, useEffect, useRef, useCallback } from 'react';
import FormPane from './components/FormPane.jsx';
import { defaultResumeData, defaultSettings } from './data/defaultData.js';
import { buildLaTeX } from './latex/builder.js';

const API = '/api';
const DEBOUNCE_MS = 1500;

export default function App() {
  const [resumeData, setResumeData]   = useState(defaultResumeData);
  const [settings,   setSettings]     = useState(defaultSettings);
  const [pdfUrl,     setPdfUrl]       = useState(null);
  const [status,     setStatus]       = useState('idle');
  const [errorLog,   setErrorLog]     = useState('');
  const [autoCompile,setAutoCompile]  = useState(true);
  const [leftWidth,  setLeftWidth]    = useState(52); // percent
  const [theme,      setTheme]        = useState(
    () => localStorage.getItem('theme') ??
          (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
  );

  // Apply theme to <html> and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const debounceTimer = useRef(null);
  const prevPdfUrl    = useRef(null);
  const isDragging    = useRef(false);

  // ── Compile ────────────────────────────────────────────────────────────────
  const compile = useCallback(async (data, cfg = {}) => {
    setStatus('compiling');
    setErrorLog('');
    try {
      const res = await fetch(`${API}/compile`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ source: buildLaTeX(data, cfg) }),
      });
      if (!res.ok) {
        const { error, detail } = await res.json();
        setStatus('error');
        setErrorLog(detail || error);
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      if (prevPdfUrl.current) URL.revokeObjectURL(prevPdfUrl.current);
      prevPdfUrl.current = url;
      setPdfUrl(url);
      setStatus('ok');
    } catch (e) {
      setStatus('error');
      setErrorLog(e.message);
    }
  }, []);

  // ── Auto-compile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoCompile) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => compile(resumeData, settings), DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [resumeData, settings, autoCompile, compile]);

  // ── Download .tex ──────────────────────────────────────────────────────────
  const downloadTex = () => {
    const blob = new Blob([buildLaTeX(resumeData, settings)], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'resume.tex' });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download PDF ───────────────────────────────────────────────────────────
  const downloadPdf = async () => {
    let url = prevPdfUrl.current;
    if (!url) { await compile(resumeData, settings); url = prevPdfUrl.current; }
    if (!url) return;
    Object.assign(document.createElement('a'), { href: url, download: 'resume.pdf' }).click();
  };

  // ── Resizable divider ──────────────────────────────────────────────────────
  const onDividerMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';
    const move = (me) => {
      if (!isDragging.current) return;
      setLeftWidth(Math.min(Math.max((me.clientX / window.innerWidth) * 100, 20), 80));
    };
    const up = () => {
      isDragging.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',   up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
  };

  const statusLabel = { idle: 'Ready', compiling: 'Compiling…', ok: 'Compiled', error: 'Error' }[status];
  const statusColor = { idle: '#6c7086', compiling: '#f9e2af', ok: '#a6e3a1', error: '#f38ba8' }[status];

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <span className="toolbar-title">TeX Resume</span>
        <div className="toolbar-sep" />

        <button
          className="btn btn-primary"
          onClick={() => compile(resumeData, settings)}
          disabled={status === 'compiling'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Compile
        </button>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoCompile}
            onChange={(e) => setAutoCompile(e.target.checked)}
          />
          Auto
        </label>

        <div className="toolbar-sep" />

        <button className="btn btn-secondary" onClick={downloadTex}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Save .tex
        </button>

        <button
          className="btn btn-success"
          onClick={downloadPdf}
          disabled={status === 'compiling'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Export PDF
        </button>

        <div className="toolbar-spacer" />

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? (
            /* Sun icon */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1"  x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            /* Moon icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div className="toolbar-sep" />
        <div className="status-dot" style={{ background: statusColor }} />
        <span className="status-text">{statusLabel}</span>
      </div>

      {/* ── Split layout ── */}
      <div className="layout">
        {/* Form pane */}
        <div className="pane" style={{ width: `${leftWidth}%` }}>
          <div className="pane-label">Resume Editor</div>
          <FormPane
            data={resumeData}
            onChange={setResumeData}
            settings={settings}
            onSettingsChange={setSettings}
          />
          {status === 'error' && errorLog && (
            <div className="error-panel">{errorLog}</div>
          )}
        </div>

        {/* Divider */}
        <div className="divider" onMouseDown={onDividerMouseDown} />

        {/* PDF preview pane */}
        <div className="pane preview-wrap" style={{ width: `${100 - leftWidth}%` }}>
          <div className="pane-label">PDF Preview</div>
          {pdfUrl ? (
            <iframe key={pdfUrl} src={pdfUrl} title="PDF Preview" />
          ) : (
            <div className="preview-placeholder">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>{status === 'compiling' ? 'Compiling…' : 'Hit Compile to see preview'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
