import { useRef, useEffect, useState } from 'react';

export default function QuickActionsMenu({ resumeId, resume, onAction, isOpen, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action) => {
    onAction(action);
    onClose();
  };

  return (
    <div className="quick-actions-menu" ref={menuRef}>
      <button className="quick-action-item" onClick={() => handleAction('open')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Open
      </button>

      <button className="quick-action-item" onClick={() => handleAction('rename')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Rename
      </button>

      <button className="quick-action-item" onClick={() => handleAction('duplicate')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
        Duplicate
      </button>

      <button className="quick-action-item" onClick={() => handleAction('export')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export JSON
      </button>

      <button className="quick-action-item" onClick={() => handleAction('export-pdf')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 11v6" />
          <path d="M9.5 14.5 12 17l2.5-2.5" />
        </svg>
        Export PDF
      </button>

      <div className="quick-actions-divider" />

      <button
        className="quick-action-item"
        onClick={() => handleAction(resume.pinned ? 'unpin' : 'pin')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={resume.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.46 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.04 1.51 4.04 3 5.5m-12-12v6h6" />
        </svg>
        {resume.pinned ? 'Unpin' : 'Pin'}
      </button>

      <button
        className="quick-action-item"
        onClick={() => handleAction(resume.archived ? 'unarchive' : 'archive')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="21 8 21 21 3 21 3 8" />
          <line x1="1" y1="3" x2="23" y2="3" />
          <path d="M10 12v4" />
          <path d="M14 12v4" />
        </svg>
        {resume.archived ? 'Restore' : 'Archive'}
      </button>

      <button className="quick-action-item danger" onClick={() => handleAction('delete')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        Delete
      </button>
    </div>
  );
}
