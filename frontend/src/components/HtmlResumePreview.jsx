import { useState, useRef, useEffect, forwardRef } from 'react';
import { formatDateRange, hrefUrl } from '../latex/utils.js';

const ZOOM_STEPS = [0.5, 0.6, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5];
const SHEET_WIDTH_PX = 816; // 8.5in * 96dpi

const HtmlResumePreview = forwardRef(function HtmlResumePreview({ resumeData, settings = {} }, ref) {
  const [zoomIdx, setZoomIdx] = useState(null); // null = fit-width
  const [fitScale, setFitScale] = useState(0.85);
  const containerRef = useRef(null);
  const sheetRef = useRef(null);
  const [sheetHeight, setSheetHeight] = useState(1056);

  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      const w = containerRef.current?.clientWidth;
      if (w) {
        const available = Math.max(w - 32, 240);
        setFitScale(Math.min(available / SHEET_WIDTH_PX, 1.25));
      }
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!sheetRef.current) return;
    const measureSheet = () => {
      if (sheetRef.current) setSheetHeight(sheetRef.current.offsetHeight);
    };
    measureSheet();
    const obs = new ResizeObserver(measureSheet);
    obs.observe(sheetRef.current);
    return () => obs.disconnect();
  }, [resumeData, settings]);

  const isFitMode = zoomIdx === null;
  const scale = isFitMode ? fitScale : ZOOM_STEPS[zoomIdx];

  const zoomIn = () => {
    if (isFitMode) {
      const next = ZOOM_STEPS.findIndex((s) => s > fitScale);
      setZoomIdx(next === -1 ? ZOOM_STEPS.length - 1 : next);
    } else if (zoomIdx < ZOOM_STEPS.length - 1) {
      setZoomIdx(zoomIdx + 1);
    }
  };

  const zoomOut = () => {
    if (isFitMode) {
      const prev = [...ZOOM_STEPS].reverse().findIndex((s) => s < fitScale);
      setZoomIdx(prev === -1 ? 0 : ZOOM_STEPS.length - 1 - prev);
    } else if (zoomIdx === 0) {
      setZoomIdx(null);
    } else {
      setZoomIdx(zoomIdx - 1);
    }
  };

  const resetZoom = () => setZoomIdx(null);
  const zoomLabel = isFitMode ? 'Fit' : `${Math.round(ZOOM_STEPS[zoomIdx] * 100)}%`;

  const template = settings.template || 'jakes';
  const fontSize = `${settings.fontSize || (template === 'deedy' ? '10' : '11')}pt`;
  const paddingTop = `${settings.marginTop || (template === 'harvard' ? '0.6' : '0.5')}in`;
  const paddingBottom = `${settings.marginBottom || (template === 'harvard' ? '0.6' : '0.5')}in`;
  const paddingLeft = `${settings.marginLeft || (template === 'harvard' ? '0.65' : '0.5')}in`;
  const paddingRight = `${settings.marginRight || (template === 'harvard' ? '0.65' : '0.5')}in`;

  const h = resumeData?.header || {};
  const sections = resumeData?.sections || [];
  const sep = template === 'harvard' ? ' · ' : ' | ';

  const contactItems = [];
  if (h.phone) contactItems.push(<span key="phone">{h.phone}</span>);
  if (h.email) contactItems.push(<a key="email" href={`mailto:${h.email}`}>{h.email}</a>);
  if (h.linkedin) contactItems.push(<a key="linkedin" href={hrefUrl(h.linkedin)} target="_blank" rel="noreferrer">{h.linkedin}</a>);
  if (h.website) contactItems.push(<a key="website" href={hrefUrl(h.website)} target="_blank" rel="noreferrer">{h.website}</a>);

  return (
    <div className="html-preview-viewer" ref={ref}>
      <div className="pdf-controls">
        <span className="pdf-page-info">Live HTML</span>
        <div className="pdf-zoom-group">
          <button className="pdf-ctrl-btn" onClick={zoomOut} title="Zoom out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button className="pdf-ctrl-btn pdf-zoom-label" onClick={resetZoom} title="Fit to width">
            {zoomLabel}
          </button>
          <button
            className="pdf-ctrl-btn"
            onClick={zoomIn}
            disabled={!isFitMode && zoomIdx >= ZOOM_STEPS.length - 1}
            title="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" /><line x1="11" y1="8" x2="11" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      <div className="html-preview-pages" ref={containerRef}>
        <div
          className="html-preview-scale-wrap"
          style={{
            width: `${SHEET_WIDTH_PX * scale}px`,
            height: `${sheetHeight * scale}px`,
          }}
        >
          <div
            ref={sheetRef}
            className={`resume-sheet resume-sheet--${template}`}
            style={{
              fontSize,
              padding: `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Header */}
            <div className="rs-header">
              <div className="rs-name">{h.name || 'Your Name'}</div>
              {contactItems.length > 0 && (
                <div className="rs-contact">
                  {contactItems.map((item, idx) => (
                    <span key={item.key}>
                      {idx > 0 && sep}
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sections */}
            {sections.map((sec) => {
              if (!sec.entries?.length) return null;
              return (
                <div key={sec.id} className="rs-section">
                  <div className="rs-section-title">{sec.title}</div>

                  {sec.type === 'education' && sec.entries.map((e, i) => (
                    <div key={e.id || i} className="rs-entry">
                      <div className="rs-row-split">
                        <span className="rs-primary">{e.institution}</span>
                        <span>{e.location}</span>
                      </div>
                      <div className="rs-row-split rs-secondary">
                        <span>{e.degree}</span>
                        <span>{formatDateRange(e.dateRange)}</span>
                      </div>
                    </div>
                  ))}

                  {sec.type === 'experience' && sec.entries.map((e, i) => {
                    const bullets = (e.bullets || []).filter((b) => b.trim());
                    return (
                      <div key={e.id || i} className="rs-entry">
                        <div className="rs-row-split">
                          <span className="rs-primary">
                            {template === 'harvard' ? (e.company || e.role) : e.role}
                          </span>
                          <span>
                            {template === 'harvard' ? e.location : formatDateRange(e.dateRange)}
                          </span>
                        </div>
                        <div className="rs-row-split rs-secondary">
                          <span>
                            {template === 'harvard' ? (e.company ? e.role : '') : e.company}
                          </span>
                          <span>
                            {template === 'harvard' ? formatDateRange(e.dateRange) : e.location}
                          </span>
                        </div>
                        {bullets.length > 0 && (
                          <ul className="rs-bullets">
                            {bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  {sec.type === 'projects' && sec.entries.map((e, i) => {
                    const bullets = (e.bullets || []).filter((b) => b.trim());
                    return (
                      <div key={e.id || i} className="rs-entry">
                        <div className="rs-row-split">
                          <span>
                            <span className="rs-primary">{e.name}</span>
                            {e.tech && <span className="rs-secondary"> | {e.tech}</span>}
                            {e.link && (
                              <>
                                {' | '}
                                <a href={hrefUrl(e.link)} target="_blank" rel="noreferrer">{e.link}</a>
                              </>
                            )}
                          </span>
                          <span>{formatDateRange(e.dateRange)}</span>
                        </div>
                        {bullets.length > 0 && (
                          <ul className="rs-bullets">
                            {bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  {sec.type === 'skills' && sec.entries
                    .filter((r) => r.label || r.value)
                    .map((r, i) => (
                      <div key={r.id || i} className="rs-skill-line">
                        <span className="rs-primary">{r.label}:</span> {r.value}
                      </div>
                    ))}

                  {sec.type === 'certifications' && (
                    <ul className="rs-bullets">
                      {sec.entries.filter((c) => c.text).map((c, i) => (
                        <li key={c.id || i}>
                          {c.url ? (
                            <a href={hrefUrl(c.url)} target="_blank" rel="noreferrer">{c.text}</a>
                          ) : c.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default HtmlResumePreview;
