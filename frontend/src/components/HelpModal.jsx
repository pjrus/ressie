import { useState } from 'react';

const SCHEMA_SNIPPET = `{
  "metadata": {
    "name": "My Resume",
    "template": "jakes",
    "tags": [],
    "pinned": false,
    "archived": false
  },
  "data": {
    "header": {
      "name": "",
      "phone": "",
      "email": "",
      "linkedin": "",
      "website": ""
    },
    "sections": [
      {
        "id": "sec1",
        "type": "education",
        "title": "Education",
        "entries": [
          {
            "institution": "",
            "location": "",
            "degree": "",
            "dateRange": { "start": "Aug 2019", "end": "May 2023", "present": false }
          }
        ]
      },
      {
        "id": "sec2",
        "type": "experience",
        "title": "Experience",
        "entries": [
          {
            "role": "",
            "company": "",
            "location": "",
            "dateRange": { "start": "Jan 2023", "end": "", "present": true },
            "bullets": ["Did X which improved Y by Z%"]
          }
        ]
      },
      {
        "id": "sec3",
        "type": "projects",
        "title": "Projects",
        "entries": [
          {
            "name": "",
            "tech": "React, Node.js",
            "link": "",
            "dateRange": { "start": "Mar 2024", "end": "", "present": false },
            "bullets": ["Built X using Y"]
          }
        ]
      },
      {
        "id": "sec4",
        "type": "skills",
        "title": "Skills",
        "entries": [
          { "label": "Languages", "value": "Python, JavaScript, Go" },
          { "label": "Tools", "value": "Git, Docker, AWS" }
        ]
      },
      {
        "id": "sec5",
        "type": "certifications",
        "title": "Certifications",
        "entries": [
          { "text": "AWS Solutions Architect", "url": "" }
        ]
      }
    ]
  },
  "settings": {
    "template": "jakes"
  }
}`;

const PROMPTS = [
  {
    id: 'quick',
    label: 'Quick Convert',
    description: 'Paste this into any AI chat (Claude, ChatGPT) along with your CV text. The AI will return a JSON file you can import directly.',
    text: `Convert my resume/CV into the JSON format below. Output ONLY the raw JSON — no markdown fences, no explanation.

The "template" field must be one of: "jakes", "awesomecv", or "deedy".
For "id" fields, use short random strings like "a1b2c3".
For "dateRange", use month+year strings like "Jan 2022" or leave blank. Set "present": true for current roles.
Only include section types that exist in my CV: education, experience, projects, skills, certifications.

JSON schema to follow:
${SCHEMA_SNIPPET}

My resume/CV:
[PASTE YOUR CV TEXT HERE]`,
  },
  {
    id: 'structured',
    label: 'Section by Section',
    description: 'Better for long or complex CVs. Guides the AI to process each section carefully and avoid missing details.',
    text: `I want to convert my resume into a specific JSON format for an app called ressie. Process each section carefully — do not skip any entries.

Rules:
- Output ONLY raw JSON, no markdown or explanation
- "template": use "jakes" unless I specify otherwise
- "id" fields: any short unique string (e.g. "e1", "s2", "p3")
- "dateRange": { "start": "Mon YYYY", "end": "Mon YYYY", "present": true/false }
- "bullets": array of achievement strings, each starting with an action verb
- "skills" entries: { "label": "Category", "value": "comma-separated items" }
- Only include sections present in my CV

Here is the required JSON schema:
${SCHEMA_SNIPPET}

Now here is my full resume. Convert all sections faithfully:

[PASTE YOUR CV TEXT HERE]`,
  },
  {
    id: 'update',
    label: 'Update Existing JSON',
    description: 'Already have a JSON file from this app? Use this prompt to add or change content with AI help.',
    text: `I have an existing resume JSON file for the ressie app. I want to update it with the changes described below.

Rules:
- Output ONLY the complete updated JSON — no markdown, no explanation
- Preserve all existing fields and IDs unless I ask to change them
- Keep the same schema structure (metadata, data, settings)
- For new entries, generate short unique "id" strings
- For "dateRange": { "start": "Mon YYYY", "end": "Mon YYYY", "present": true/false }

My current JSON:
[PASTE YOUR CURRENT JSON HERE]

Changes I want:
[DESCRIBE WHAT YOU WANT TO ADD OR CHANGE]`,
  },
];

export default function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('quick');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const active = PROMPTS.find(p => p.id === activeTab);

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '660px', width: '100%' }}
      >
        <div className="modal-header">
          <h2>Import Help — CV to JSON</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content" style={{ padding: '0' }}>
          <p style={{ padding: '16px 20px 0', margin: 0, fontSize: '13px', color: 'var(--tx-secondary)', lineHeight: '1.5' }}>
            Copy a prompt below, paste it into an AI assistant (Claude, ChatGPT, etc.) along with your CV text, then save the output as a <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', padding: '1px 5px' }}>.json</code> file and use <strong>Import Resume</strong> to load it.
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginTop: '16px', padding: '0 20px' }}>
            {PROMPTS.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === p.id ? '2px solid var(--accent)' : '2px solid transparent',
                  padding: '8px 14px',
                  marginBottom: '-1px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: activeTab === p.id ? 600 : 400,
                  color: activeTab === p.id ? 'var(--accent)' : 'var(--tx-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          <div style={{ padding: '16px 20px 20px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--tx-secondary)', lineHeight: '1.5' }}>
              {active.description}
            </p>

            <div style={{ position: 'relative' }}>
              <pre style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                padding: '14px',
                fontSize: '11.5px',
                lineHeight: '1.55',
                color: 'var(--tx-primary)',
                overflowY: 'auto',
                maxHeight: '320px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                fontFamily: 'var(--font-mono)',
              }}>
                {active.text}
              </pre>

              <button
                onClick={() => handleCopy(active.id, active.text)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: copiedId === active.id ? 'var(--success)' : 'var(--bg-surface)',
                  color: copiedId === active.id ? 'var(--success-fg)' : 'var(--tx-secondary)',
                  border: `1px solid ${copiedId === active.id ? 'var(--success)' : 'var(--border)'}`,
                  padding: '5px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {copiedId === active.id ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
