import { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ZOOM_STEPS = [0.5, 0.6, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];

export default function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [zoomIdx, setZoomIdx] = useState(null); // null = fit-width mode
  const [fitWidth, setFitWidth] = useState(null);
  const containerRef = useRef(null);

  // Measure container width for fit-width mode
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      const w = containerRef.current?.clientWidth;
      if (w) setFitWidth(w - 32); // subtract padding
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
  }, []);

  const isFitMode = zoomIdx === null;
  const scale = isFitMode ? null : ZOOM_STEPS[zoomIdx];
  const pageWidth = isFitMode ? fitWidth : undefined;

  const zoomIn = () => {
    if (isFitMode) {
      // Jump to the closest zoom step >= 1.0
      setZoomIdx(ZOOM_STEPS.findIndex((s) => s >= 1.0));
    } else if (zoomIdx < ZOOM_STEPS.length - 1) {
      setZoomIdx(zoomIdx + 1);
    }
  };

  const zoomOut = () => {
    if (isFitMode) return;
    if (zoomIdx === 0) {
      setZoomIdx(null); // back to fit-width
    } else {
      setZoomIdx(zoomIdx - 1);
    }
  };

  const resetZoom = () => setZoomIdx(null);

  const zoomLabel = isFitMode
    ? 'Fit'
    : `${Math.round(ZOOM_STEPS[zoomIdx] * 100)}%`;

  return (
    <div className="pdf-viewer">
      {/* Controls */}
      <div className="pdf-controls">
        <span className="pdf-page-info">
          {numPages ? `${numPages} page${numPages > 1 ? 's' : ''}` : ''}
        </span>

        <div className="pdf-zoom-group">
          <button
            className="pdf-ctrl-btn"
            onClick={zoomOut}
            disabled={isFitMode}
            title="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          <button
            className="pdf-ctrl-btn pdf-zoom-label"
            onClick={resetZoom}
            title="Fit to width"
          >
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

      {/* Pages */}
      <div className="pdf-pages" ref={containerRef}>
        <div className="pdf-pages-inner">
          {file && fitWidth && (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="pdf-loading">Loading PDF…</div>}
              error={<div className="pdf-loading">Failed to load PDF</div>}
            >
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  width={pageWidth}
                  scale={scale}
                  className="pdf-page"
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              ))}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
