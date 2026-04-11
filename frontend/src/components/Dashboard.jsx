import { useState } from 'react';
import CreateResumeModal from './CreateResumeModal.jsx';
import QuickActionsMenu from './QuickActionsMenu.jsx';
import {
  updateResumeMeta,
  deleteResume,
  archiveResume,
  duplicateResume,
  exportResumeJSON,
  loadResumesList,
} from '../utils/storageManager.js';
import { getThumbnail } from '../utils/thumbnailManager.js';

export default function Dashboard({ resumesList, onSelectResume, onUpdate, theme, toggleTheme }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastEdited');
  const [filterBy, setFilterBy] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter resumes
  let filtered = resumesList.filter(r => {
    if (filterBy === 'pinned') return r.pinned && !r.archived;
    if (filterBy === 'archived') return r.archived;
    return !r.archived;
  });

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'lastEdited') return b.lastEditedAt - a.lastEditedAt;
    if (sortBy === 'created') return b.createdAt - a.createdAt;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // Get 5 most recent
  const recent = [...resumesList]
    .filter(r => !r.archived)
    .sort((a, b) => b.lastEditedAt - a.lastEditedAt)
    .slice(0, 5);

  const refreshList = () => {
    const newList = loadResumesList();
    onUpdate(newList);
  };

  const handleQuickAction = (resumeId, action) => {
    const resume = resumesList.find(r => r.id === resumeId);
    if (!resume) return;

    switch (action) {
      case 'open':
        onSelectResume(resumeId);
        break;

      case 'rename':
        setRenameId(resumeId);
        setRenameValue(resume.name);
        break;

      case 'duplicate':
        const dupName = `${resume.name} (Copy)`;
        duplicateResume(resumeId, dupName);
        refreshList();
        break;

      case 'export':
        const json = exportResumeJSON(resumeId);
        if (json) {
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${resume.name}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
        break;

      case 'pin':
      case 'unpin':
        updateResumeMeta(resumeId, { pinned: !resume.pinned });
        refreshList();
        break;

      case 'archive':
      case 'unarchive':
        if (resume.archived) {
          updateResumeMeta(resumeId, { archived: false });
        } else {
          archiveResume(resumeId);
        }
        refreshList();
        break;

      case 'delete':
        setDeleteConfirmId(resumeId);
        break;

      default:
        break;
    }
  };

  const handleRenameConfirm = () => {
    if (renameValue.trim()) {
      updateResumeMeta(renameId, { name: renameValue.trim() });
      refreshList();
    }
    setRenameId(null);
  };

  const handleDeleteConfirm = () => {
    deleteResume(deleteConfirmId);
    refreshList();
    setDeleteConfirmId(null);
  };

  return (
    <div className="dashboard">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group toolbar-group--left">
          <span className="toolbar-title">TeX Resume - Dashboard</span>
        </div>

        <div className="toolbar-group toolbar-group--right">
          <button className="theme-toggle theme-toggle--inline" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? (
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Empty state */}
        {resumesList.length === 0 ? (
          <div className="empty-state">
            <h2>Welcome to TeX Resume Editor</h2>
            <p>Create your first resume to get started</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create First Resume
            </button>
          </div>
        ) : (
          <>
            {/* Recent activity */}
            {recent.length > 0 && (
              <section className="recent-activity">
                <h3>Recent Resumes</h3>
                <div className="activity-list">
                  {recent.map(r => (
                    <div
                      key={r.id}
                      className="activity-item"
                      onClick={() => onSelectResume(r.id)}
                    >
                      <div className="activity-info">
                        <span className="activity-name">{r.name}</span>
                        <span className="activity-time">
                          {new Date(r.lastEditedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Controls */}
            <section className="dashboard-controls">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New Resume
              </button>

              <input
                type="text"
                className="search-input"
                placeholder="Search by name or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="lastEdited">Most Recent</option>
                <option value="created">Creation Date</option>
                <option value="name">Name A-Z</option>
              </select>
            </section>

            {/* Filters */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
                onClick={() => setFilterBy('all')}
              >
                All ({resumesList.filter(r => !r.archived).length})
              </button>
              <button
                className={`filter-btn ${filterBy === 'pinned' ? 'active' : ''}`}
                onClick={() => setFilterBy('pinned')}
              >
                Pinned ({resumesList.filter(r => r.pinned && !r.archived).length})
              </button>
              <button
                className={`filter-btn ${filterBy === 'archived' ? 'active' : ''}`}
                onClick={() => setFilterBy('archived')}
              >
                Archived ({resumesList.filter(r => r.archived).length})
              </button>
            </div>

            {/* Resume grid */}
            {filtered.length === 0 ? (
              <div className="no-results">
                <p>No resumes found</p>
              </div>
            ) : (
              <div className="resume-grid">
                {filtered.map(resume => (
                  <div key={resume.id} className="resume-card">
                    <div className="card-header">
                      <div className="card-title" onClick={() => onSelectResume(resume.id)}>
                        <h3>{resume.name}</h3>
                      </div>
                      <div className="card-actions">
                        {resume.pinned && <span className="pin-badge">📌</span>}
                        <button
                          className="card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === resume.id ? null : resume.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        <QuickActionsMenu
                          resumeId={resume.id}
                          resume={resume}
                          isOpen={menuOpenId === resume.id}
                          onClose={() => setMenuOpenId(null)}
                          onAction={(action) => handleQuickAction(resume.id, action)}
                        />
                      </div>
                    </div>

                    <div className="card-meta">
                      <span className="badge">{resume.template}</span>
                      <span className="date">{new Date(resume.lastEditedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Thumbnail preview */}
                    {getThumbnail(resume.id) && (
                      <div className="card-preview">
                        <img
                          src={getThumbnail(resume.id)}
                          alt={`${resume.name} thumbnail`}
                          onClick={() => onSelectResume(resume.id)}
                        />
                      </div>
                    )}

                    {resume.tags.length > 0 && (
                      <div className="card-tags">
                        {resume.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rename Modal */}
      {renameId && (
        <div className="modal-overlay" onClick={() => setRenameId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rename Resume</h2>
              <button className="modal-close" onClick={() => setRenameId(null)}>✕</button>
            </div>
            <div className="modal-content">
              <input
                type="text"
                className="form-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                  if (e.key === 'Escape') setRenameId(null);
                }}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRenameId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRenameConfirm}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Resume</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmId(null)}>✕</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to permanently delete this resume? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--error)', color: 'var(--tx-primary)' }} onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateResumeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(name, template) => {
            setShowCreateModal(false);
            onSelectResume(null, { name, template });
          }}
          existingCount={resumesList.length}
        />
      )}
    </div>
  );
}
