import { useState, useEffect, useRef } from 'react';

function formatRelativeTime(timestamp) {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatExactTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions,
  templateLabels = {},
  onCreateCheckpoint,
  onRestore,
  onRename,
  onDelete,
  feedbackMessage = '',
}) {
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'manual' | 'auto'
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (editingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setEditingValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const manualCount = versions.filter((v) => v.isManual).length;
  const autoCount = versions.length - manualCount;

  const sortedVersions = [...versions].reverse();
  const filteredVersions = sortedVersions.filter((v) => {
    if (filter === 'manual') return v.isManual;
    if (filter === 'auto') return !v.isManual;
    return true;
  });

  const handleSubmitCheckpoint = (e) => {
    e.preventDefault();
    onCreateCheckpoint(checkpointLabel);
    setCheckpointLabel('');
  };

  const startRename = (version) => {
    setEditingId(version.versionId);
    setEditingValue(version.label || '');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const commitRename = (versionId) => {
    const trimmed = editingValue.trim();
    if (trimmed) {
      onRename(versionId, trimmed);
    }
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <>
      <div className="version-drawer-backdrop" onClick={onClose} />
      <aside
        className="version-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Version History"
      >
        <div className="version-drawer-header">
          <div className="version-drawer-title-group">
            <h2>Version History</h2>
            <span className="version-count mono">{versions.length} / 20</span>
          </div>
          <button
            type="button"
            className="version-drawer-close"
            onClick={onClose}
            aria-label="Close version history"
            title="Close (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="version-checkpoint-form" onSubmit={handleSubmitCheckpoint}>
          <input
            type="text"
            className="field-input version-checkpoint-input"
            placeholder="Checkpoint label (optional)…"
            value={checkpointLabel}
            onChange={(e) => setCheckpointLabel(e.target.value)}
            maxLength={80}
          />
          <button type="submit" className="btn btn-primary version-checkpoint-btn">
            Save Snapshot
          </button>
        </form>

        {feedbackMessage && (
          <div className="version-feedback" role="status">
            {feedbackMessage}
          </div>
        )}

        <div className="version-filter-tabs" role="tablist" aria-label="Filter versions">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`version-filter-tab ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span className="mono">{versions.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'manual'}
            className={`version-filter-tab ${filter === 'manual' ? 'is-active' : ''}`}
            onClick={() => setFilter('manual')}
          >
            Checkpoints <span className="mono">{manualCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'auto'}
            className={`version-filter-tab ${filter === 'auto' ? 'is-active' : ''}`}
            onClick={() => setFilter('auto')}
          >
            Auto-saves <span className="mono">{autoCount}</span>
          </button>
        </div>

        <div className="version-list">
          {filteredVersions.length === 0 ? (
            <div className="version-empty-state">
              {versions.length === 0 ? (
                <>
                  <p className="version-empty-title">No versions yet</p>
                  <p className="version-empty-copy">
                    Auto-saves are captured as you edit, or save a labeled snapshot above to mark a milestone.
                  </p>
                </>
              ) : (
                <>
                  <p className="version-empty-title">
                    {filter === 'manual' ? 'No checkpoints yet' : 'No auto-saves yet'}
                  </p>
                  <p className="version-empty-copy">
                    {filter === 'manual'
                      ? 'Save a snapshot above to create a labeled checkpoint.'
                      : 'Automatic snapshots will appear here as you make edits.'}
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredVersions.map((version) => {
              const isEditing = editingId === version.versionId;
              const tplKey = version.settings?.template || 'jakes';
              const tplName = templateLabels[tplKey] || tplKey;

              return (
                <div key={version.versionId} className="version-item">
                  <div className="version-item-top">
                    {isEditing ? (
                      <div className="version-rename-row">
                        <input
                          ref={renameInputRef}
                          type="text"
                          className="field-input version-rename-input"
                          value={editingValue}
                          maxLength={80}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitRename(version.versionId);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelRename();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="version-action-btn version-action-btn--primary"
                          onClick={() => commitRename(version.versionId)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="version-action-btn"
                          onClick={cancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="version-item-label" title={version.label}>
                          {version.label}
                        </span>
                        <span
                          className={`version-badge ${
                            version.isManual ? 'version-badge--manual' : 'version-badge--auto'
                          }`}
                        >
                          {version.isManual ? 'Checkpoint' : 'Auto'}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="version-item-meta">
                    <span className="version-item-time mono" title={new Date(version.timestamp).toLocaleString()}>
                      {formatRelativeTime(version.timestamp)} · {formatExactTime(version.timestamp)}
                    </span>
                    <span className="version-item-template">{tplName}</span>
                  </div>

                  {!isEditing && (
                    <div className="version-item-actions">
                      <button
                        type="button"
                        className="version-action-btn version-action-btn--restore"
                        onClick={() => onRestore(version.versionId)}
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        className="version-action-btn"
                        onClick={() => startRename(version)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="version-action-btn version-action-btn--danger"
                        onClick={() => onDelete(version.versionId)}
                        aria-label={`Delete version ${version.label}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
