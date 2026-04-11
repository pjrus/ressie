import { useState } from 'react';

const TEMPLATES = [
  { value: 'jakes', label: "Jake's Resume" },
  { value: 'awesomecv', label: 'Awesome-CV' },
  { value: 'deedy', label: 'Deedy Resume' },
];

export default function CreateResumeModal({ onClose, onCreate, existingCount }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('jakes');
  const suggestedName = `Resume ${existingCount + 1}`;

  const handleCreate = () => {
    const finalName = name.trim() || suggestedName;
    onCreate(finalName, template);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Resume</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label htmlFor="resume-name">Resume Name</label>
            <input
              id="resume-name"
              type="text"
              className="form-input"
              placeholder={suggestedName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <small>Leave blank to use: {suggestedName}</small>
          </div>

          <div className="form-group">
            <label>Template</label>
            <div className="template-options">
              {TEMPLATES.map(t => (
                <label key={t.value} className="template-option">
                  <input
                    type="radio"
                    name="template"
                    value={t.value}
                    checked={template === t.value}
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Create Resume</button>
        </div>
      </div>
    </div>
  );
}
