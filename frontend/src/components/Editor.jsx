import { useState, useEffect, useRef, useCallback } from 'react';
import FormPane from './FormPane.jsx';
import PdfViewer from './PdfViewer.jsx';
import { buildLaTeX } from '../latex/builder.js';
import { buildAwesomeCV } from '../latex/awesomecv-builder.js';
import { buildDeedyResume } from '../latex/deedy-builder.js';

const TEMPLATES = {
  jakes: {
    label: "Jake's Resume",
    build: buildLaTeX,
    defaults: { fontSize: '11', marginTop: '0.5', marginBottom: '0.5', marginLeft: '0.5', marginRight: '0.5' },
  },
  awesomecv: {
    label: 'Awesome-CV',
    build: buildAwesomeCV,
    defaults: { fontSize: '11' },
  },
  deedy: {
    label: 'Deedy Resume',
    build: buildDeedyResume,
    defaults: {
      fontSize: '10',
      marginTop: '0.6',
      marginBottom: '0.6',
      marginLeft: '0.65',
      marginRight: '0.65',
      deedyColumnRatio: '0.34,0.66',
      deedySectionSpacing: '8',
    },
  },
};

const API = '/api';
const DEBOUNCE_MS = 1500;

export default function Editor({ resumeData, setResumeData, settings, setSettings, onBack, theme, toggleTheme, onSave, isSaving }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorLog, setErrorLog] = useState('');
  const [autoCompile, setAutoCompile] = useState(true);
  const [leftWidth, setLeftWidth] = useState(52); // percent
  const [saveState, setSaveState] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [saveError, setSaveError] = useState('');

  const debounceTimer = useRef(null);
  const prevPdfUrl = useRef(null);
  const isDragging = useRef(false);
  const saveStateTimer = useRef(null);

  // ── Compile ────────────────────────────────────────────────────────────────
  const compile = useCallback(async (data, cfg = {}) => {
    setStatus('compiling');
    setErrorLog('');
    try {
      const res = await fetch(`${API}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: (TEMPLATES[cfg.template] || TEMPLATES.jakes).build(data, cfg) }),
      });
      if (!res.ok) {
        const { error, detail } = await res.json();
        setStatus('error');
        setErrorLog(detail || error);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
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
    const build = (TEMPLATES[settings.template] || TEMPLATES.jakes).build;
    const blob = new Blob([build(resumeData, settings)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'resume.tex' });
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
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const move = (me) => {
      if (!isDragging.current) return;
      setLeftWidth(Math.min(Math.max((me.clientX / window.innerWidth) * 100, 20), 80));
    };
    const up = () => {
      isDragging.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const applyTemplateDefaults = (prev, templateKey) => {
    const selected = TEMPLATES[templateKey] || TEMPLATES.jakes;
    return { ...prev, ...(selected.defaults || {}), template: templateKey };
  };

  const statusLabel = { idle: 'Ready', compiling: 'Compiling…', ok: 'Compiled', error: 'Error' }[status];
  const statusColor = { idle: '#6c7086', compiling: '#f9e2af', ok: '#a6e3a1', error: '#f38ba8' }[status];

  const handleBack = async () => {
    // Trigger a final save before navigating back
    if (onSave) {
      await onSave();
    }
    onBack();
  };

  const handleSave = async () => {
    // Clear any existing timer
    if (saveStateTimer.current) {
      clearTimeout(saveStateTimer.current);
    }

    try {
      // Show "Saving…" immediately
      setSaveState('saving');
      setSaveError('');

      // Call the parent save function
      await onSave();

      // Show "Saved" briefly
      setSaveState('saved');

      // After 2 seconds, return to idle
      saveStateTimer.current = setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    } catch (err) {
      // Show error state
      setSaveState('error');
      setSaveError(err.message || 'Failed to save');

      // Auto-reset after 4 seconds
      saveStateTimer.current = setTimeout(() => {
        setSaveState('idle');
        setSaveError('');
      }, 4000);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveStateTimer.current) {
        clearTimeout(saveStateTimer.current);
      }
    };
  }, []);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="toolbar">
        {/* ── Zone 1: Context (What is being edited) ── */}
        <div className="toolbar-zone context-zone">
          <button className="btn btn-secondary back-button" onClick={handleBack}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <select
            className="template-select"
            value={settings.template || 'jakes'}
            onChange={(e) => setSettings((s) => applyTemplateDefaults(s, e.target.value))}
          >
            {Object.entries(TEMPLATES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* ── Zone Separator ── */}
        <div className="zone-divider" />

        {/* ── Zone 2: Iteration (Core workflow) ── */}
        <div className="toolbar-zone iteration-zone">
          <div className="compile-group">
            <button
              className="btn btn-primary compile-button"
              onClick={() => compile(resumeData, settings)}
              disabled={status === 'compiling'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Compile
            </button>

            <label className="toggle-label compact">
              <input
                type="checkbox"
                checked={autoCompile}
                onChange={(e) => setAutoCompile(e.target.checked)}
              />
              Auto
            </label>
          </div>

          <button
            className={`btn save-button ${
              saveState === 'saving' ? 'btn-saving' :
              saveState === 'saved' ? 'btn-saved' :
              saveState === 'error' ? 'btn-error' :
              'btn-success'
            }`}
            onClick={handleSave}
            disabled={saveState === 'saving'}
            title={saveError || 'Save resume to browser storage'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="save-button-text">
              {saveState === 'saving' && 'Saving…'}
              {saveState === 'saved' && '✓ Saved'}
              {saveState === 'error' && '✗ Failed'}
              {saveState === 'idle' && 'Save'}
            </span>
          </button>
        </div>

        {/* ── Zone Separator ── */}
        <div className="zone-divider" />

        {/* ── Zone 3: Output (Exports and settings) ── */}
        <div className="toolbar-zone output-zone">
          <button className="btn btn-secondary" onClick={downloadTex}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Save .tex
          </button>

          <button
            className="btn btn-export"
            onClick={downloadPdf}
            disabled={status === 'compiling'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Export PDF
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? (
            /* Sun icon */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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
            <PdfViewer file={pdfUrl} />
          ) : (
            <div className="preview-placeholder">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>{status === 'compiling' ? 'Compiling…' : 'Hit Compile to see preview'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
