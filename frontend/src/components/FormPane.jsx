import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uid } from '../data/defaultData.js';

// ── New-entry factories ───────────────────────────────────────────────────────
const newEntry = {
  education:     () => ({ id: uid(), institution: '', location: '', degree: '', dates: '' }),
  experience:    () => ({ id: uid(), role: '', company: '', location: '', dates: '', bullets: [''] }),
  projects:      () => ({ id: uid(), name: '', tech: '', link: '', dates: '', bullets: [''] }),
  skills:        () => ({ id: uid(), label: '', value: '' }),
  certifications:() => ({ id: uid(), text: '', url: '' }),
};

const SECTION_TYPES = [
  { type: 'education',      label: 'Education' },
  { type: 'experience',     label: 'Experience' },
  { type: 'projects',       label: 'Projects' },
  { type: 'skills',         label: 'Technical Skills' },
  { type: 'certifications', label: 'Awards / Certifications' },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, multiline, half }) {
  return (
    <div className={`field${half ? ' field--half' : ''}`}>
      {label && <label className="field-label">{label}</label>}
      {multiline ? (
        <textarea
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
        />
      ) : (
        <input
          className="field-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function BulletList({ bullets, onChange }) {
  const update = (i, val) => { const n = [...bullets]; n[i] = val; onChange(n); };
  const remove = (i) => onChange(bullets.filter((_, j) => j !== i));
  const add    = () => onChange([...bullets, '']);

  return (
    <div className="bullet-list">
      <span className="field-label">Bullet Points</span>
      {bullets.map((b, i) => (
        <div key={i} className="bullet-row">
          <span className="bullet-dot">•</span>
          <textarea
            className="field-input bullet-input"
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Describe what you did…"
            rows={2}
          />
          <button className="icon-btn danger" onClick={() => remove(i)} title="Remove">✕</button>
        </div>
      ))}
      <button className="add-inline-btn" onClick={add}>+ bullet</button>
    </div>
  );
}

// ── Entry editors ─────────────────────────────────────────────────────────────

function EducationEntry({ entry, onChange, onRemove }) {
  const u = (k, v) => onChange({ ...entry, [k]: v });
  return (
    <div className="entry-card">
      <div className="entry-header">
        <span className="entry-label">{entry.institution || 'New Institution'}</span>
        <button className="icon-btn danger sm" onClick={onRemove}>✕</button>
      </div>
      <div className="field-grid">
        <Field label="Institution" value={entry.institution} onChange={(v) => u('institution', v)} placeholder="University Name" half />
        <Field label="Location"    value={entry.location}    onChange={(v) => u('location', v)}    placeholder="City, State"     half />
        <Field label="Degree / Description" value={entry.degree} onChange={(v) => u('degree', v)} placeholder="Bachelor of Science…" />
        <Field label="Dates"       value={entry.dates}       onChange={(v) => u('dates', v)}       placeholder="Jan. 2020 -- Dec. 2023" half />
      </div>
    </div>
  );
}

function ExperienceEntry({ entry, onChange, onRemove }) {
  const u = (k, v) => onChange({ ...entry, [k]: v });
  return (
    <div className="entry-card">
      <div className="entry-header">
        <span className="entry-label">{entry.role || 'New Role'}{entry.company ? ` · ${entry.company}` : ''}</span>
        <button className="icon-btn danger sm" onClick={onRemove}>✕</button>
      </div>
      <div className="field-grid">
        <Field label="Role / Title" value={entry.role}     onChange={(v) => u('role', v)}     placeholder="Software Engineer"   half />
        <Field label="Company"      value={entry.company}  onChange={(v) => u('company', v)}  placeholder="Company Name"        half />
        <Field label="Location"     value={entry.location} onChange={(v) => u('location', v)} placeholder="City, State / Remote" half />
        <Field label="Dates"        value={entry.dates}    onChange={(v) => u('dates', v)}    placeholder="Jan. 2022 -- Present" half />
      </div>
      <BulletList bullets={entry.bullets || []} onChange={(v) => u('bullets', v)} />
    </div>
  );
}

function ProjectEntry({ entry, onChange, onRemove }) {
  const u = (k, v) => onChange({ ...entry, [k]: v });
  return (
    <div className="entry-card">
      <div className="entry-header">
        <span className="entry-label">{entry.name || 'New Project'}</span>
        <button className="icon-btn danger sm" onClick={onRemove}>✕</button>
      </div>
      <div className="field-grid">
        <Field label="Project Name"      value={entry.name}  onChange={(v) => u('name', v)}  placeholder="My Awesome Project"          half />
        <Field label="Dates"             value={entry.dates} onChange={(v) => u('dates', v)} placeholder="Jan. 2023 -- Present"         half />
        <Field label="Technologies"      value={entry.tech}  onChange={(v) => u('tech', v)}  placeholder="React, Node.js, MongoDB" />
        <Field label="Link (optional)"   value={entry.link}  onChange={(v) => u('link', v)}  placeholder="github.com/you/project" />
      </div>
      <BulletList bullets={entry.bullets || []} onChange={(v) => u('bullets', v)} />
    </div>
  );
}

function SkillsEntry({ entry, onChange, onRemove }) {
  const u = (k, v) => onChange({ ...entry, [k]: v });
  return (
    <div className="entry-card entry-card--inline">
      <Field label="Category" value={entry.label} onChange={(v) => u('label', v)} placeholder="Languages" half />
      <Field label="Skills"   value={entry.value} onChange={(v) => u('value', v)} placeholder="Python, JavaScript, TypeScript…" />
      <button className="icon-btn danger sm entry-remove" onClick={onRemove}>✕</button>
    </div>
  );
}

function CertEntry({ entry, onChange, onRemove }) {
  const u = (k, v) => onChange({ ...entry, [k]: v });
  return (
    <div className="entry-card">
      <div className="entry-header">
        <span className="entry-label">{entry.text || 'New Award / Certification'}</span>
        <button className="icon-btn danger sm" onClick={onRemove}>✕</button>
      </div>
      <div className="field-grid">
        <Field
          label="Title"
          value={entry.text}
          onChange={(v) => u('text', v)}
          placeholder="Google Cloud Professional Certificate (2024)"
        />
        <Field
          label="Link (optional)"
          value={entry.url}
          onChange={(v) => u('url', v)}
          placeholder="coursera.org/verify/abc123"
        />
      </div>
    </div>
  );
}

// ── Section content (entry list + add button) ─────────────────────────────────

const ADD_LABELS = {
  education:     '+ Add Education',
  experience:    '+ Add Experience',
  projects:      '+ Add Project',
  skills:        '+ Add Skill Category',
  certifications:'+ Add Award / Cert',
};

function SectionContent({ section, onUpdateEntries }) {
  const entries = section.entries || [];
  const upd = (i, v) => { const n = [...entries]; n[i] = v; onUpdateEntries(n); };
  const rem = (i) => onUpdateEntries(entries.filter((_, j) => j !== i));
  const add = () => onUpdateEntries([...entries, newEntry[section.type]()]);

  const renderEntry = (e, i) => {
    const props = { key: e.id, entry: e, onChange: (v) => upd(i, v), onRemove: () => rem(i) };
    switch (section.type) {
      case 'education':     return <EducationEntry  {...props} />;
      case 'experience':    return <ExperienceEntry {...props} />;
      case 'projects':      return <ProjectEntry    {...props} />;
      case 'skills':        return <SkillsEntry     {...props} />;
      case 'certifications':return <CertEntry       {...props} />;
      default: return null;
    }
  };

  return (
    <div className="section-body">
      {entries.map((e, i) => renderEntry(e, i))}
      <button className="add-entry-btn" onClick={add}>{ADD_LABELS[section.type]}</button>
    </div>
  );
}

// ── Sortable section card ─────────────────────────────────────────────────────

function SortableSectionCard({ section, onUpdate, onRemove }) {
  const [collapsed, setCollapsed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="section-card">
      {/* Header row */}
      <div className="section-card-header">
        <button className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5"  cy="3"  r="1.3"/>
            <circle cx="11" cy="3"  r="1.3"/>
            <circle cx="5"  cy="8"  r="1.3"/>
            <circle cx="11" cy="8"  r="1.3"/>
            <circle cx="5"  cy="13" r="1.3"/>
            <circle cx="11" cy="13" r="1.3"/>
          </svg>
        </button>

        <input
          className="section-title-input"
          value={section.title}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          placeholder="Section title"
        />

        <button
          className="icon-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button className="icon-btn danger" onClick={onRemove} title="Remove section">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <SectionContent
          section={section}
          onUpdateEntries={(entries) => onUpdate({ ...section, entries })}
        />
      )}
    </div>
  );
}

// ── Header editor (not draggable) ─────────────────────────────────────────────

function HeaderEditor({ header, onChange }) {
  const u = (k, v) => onChange({ ...header, [k]: v });
  return (
    <div className="section-card section-card--header">
      <div className="section-card-header" style={{ cursor: 'default' }}>
        <span className="drag-handle-placeholder" />
        <span className="section-title-static">Header</span>
      </div>
      <div className="section-body">
        <div className="field-grid">
          <Field label="Full Name"         value={header.name}     onChange={(v) => u('name', v)}     placeholder="Your Name" />
          <Field label="Phone"             value={header.phone}    onChange={(v) => u('phone', v)}    placeholder="0400 000 000"            half />
          <Field label="Email"             value={header.email}    onChange={(v) => u('email', v)}    placeholder="you@email.com"           half />
          <Field label="LinkedIn URL"      value={header.linkedin} onChange={(v) => u('linkedin', v)} placeholder="linkedin.com/in/yourname" half />
          <Field label="Website / GitHub"  value={header.website}  onChange={(v) => u('website', v)}  placeholder="github.com/yourname"     half />
        </div>
      </div>
    </div>
  );
}

// ── Add Section dropdown ──────────────────────────────────────────────────────

function AddSectionMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="add-section-wrap">
      <button className="add-section-btn" onClick={() => setOpen((o) => !o)}>
        + Add Section
      </button>
      {open && (
        <>
          <div className="dropdown-backdrop" onClick={() => setOpen(false)} />
          <div className="dropdown">
            {SECTION_TYPES.map(({ type, label }) => (
              <button
                key={type}
                className="dropdown-item"
                onClick={() => {
                  onAdd(type, label);
                  setOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── FormPane root ─────────────────────────────────────────────────────────────

export default function FormPane({ data, onChange }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const setHeader   = (h) => onChange({ ...data, header: h });
  const setSections = (s) => onChange({ ...data, sections: s });

  const updateSection = (id, updated) =>
    setSections(data.sections.map((s) => (s.id === id ? updated : s)));

  const removeSection = (id) =>
    setSections(data.sections.filter((s) => s.id !== id));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = data.sections.findIndex((s) => s.id === active.id);
    const to   = data.sections.findIndex((s) => s.id === over.id);
    setSections(arrayMove(data.sections, from, to));
  };

  const addSection = (type, label) => {
    setSections([
      ...data.sections,
      { id: `sec-${uid()}`, type, title: label, entries: [newEntry[type]()] },
    ]);
  };

  return (
    <div className="form-pane">
      <HeaderEditor header={data.header} onChange={setHeader} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={data.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {data.sections.map((section) => (
            <SortableSectionCard
              key={section.id}
              section={section}
              onUpdate={(u) => updateSection(section.id, u)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddSectionMenu onAdd={addSection} />
    </div>
  );
}
