import { useRef, useState } from 'react';
import { importResumeJSON, validateResumeJSON } from '../utils/storageManager';

const ImportResumeModal = ({ onClose, onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSelectedFile(file);
    setParsedData(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      const validation = validateResumeJSON(data, 'single');
      if (!validation.isValid) {
        setError(validation.errors[0]);
        setSelectedFile(null);
        return;
      }

      setParsedData(data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Could not read file. Make sure it\'s valid JSON.');
      } else {
        setError(`Error reading file: ${err.message}`);
      }
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setLoading(true);
    setError('');

    try {
      const newId = importResumeJSON(parsedData);
      if (!newId) {
        setError('Failed to import resume. Please check the file format.');
        setLoading(false);
        return;
      }

      setImportSuccess(true);
      const resumeName = parsedData.metadata?.name || 'Imported Resume';

      // Call parent callback
      setTimeout(() => {
        onImportSuccess(newId, resumeName);
      }, 500);
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Resume</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <p style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--tx-secondary)' }}>
            Select a JSON file exported from this app to import a resume.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            className="import-file-section"
            onClick={handleFileSelect}
            disabled={loading || importSuccess}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{selectedFile ? 'Change file' : 'Click to select a file'}</span>
            </div>
          </button>

          {selectedFile && !error && !importSuccess && (
            <div className="import-file-selected">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{selectedFile.name}</span>
            </div>
          )}

          {error && (
            <div className="import-error">
              {error}
            </div>
          )}

          {importSuccess && (
            <div className="import-success">
              ✓ Resume imported successfully! Loading...
            </div>
          )}

          {parsedData && !error && !importSuccess && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '6px', fontSize: '12px', color: 'var(--tx-secondary)' }}>
              <strong>Resume Name:</strong> {parsedData.metadata?.name || 'Unnamed'}
              <br />
              <strong>Template:</strong> {parsedData.metadata?.template || 'Unknown'}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!parsedData || loading || importSuccess}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportResumeModal;
