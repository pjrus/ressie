import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
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
const emptyDateRange = () => ({ startMonth: '', startYear: '', endMonth: '', endYear: '', present: false });

const newEntry = {
  education:     () => ({ id: uid(), institution: '', location: '', degree: '', dateRange: emptyDateRange() }),
  experience:    () => ({ id: uid(), role: '', company: '', location: '', dateRange: emptyDateRange(), bullets: [''] }),
  projects:      () => ({ id: uid(), name: '', tech: '', link: '', dateRange: emptyDateRange(), bullets: [''] }),
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

const MONTHS = [
  { val: 'Jan', label: 'Jan.' },
  { val: 'Feb', label: 'Feb.' },
  { val: 'Mar', label: 'Mar.' },
  { val: 'Apr', label: 'Apr.' },
  { val: 'May', label: 'May'  },
  { val: 'Jun', label: 'Jun.' },
  { val: 'Jul', label: 'Jul.' },
  { val: 'Aug', label: 'Aug.' },
  { val: 'Sep', label: 'Sep.' },
  { val: 'Oct', label: 'Oct.' },
  { val: 'Nov', label: 'Nov.' },
  { val: 'Dec', label: 'Dec.' },
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

function DateRangePicker({ value, onChange }) {
  const dr = value || emptyDateRange();
  const u = (k, v) => onChange({ ...dr, [k]: v });

  return (
    <div className="field">
      <label className="field-label">Dates</label>
      <div className="date-range-picker">
        {/* Start date */}
        <div className="date-part">
          <select
            className="date-select"
            value={dr.startMonth}
            onChange={(e) => u('startMonth', e.target.value)}
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m.val} value={m.val}>{m.label}</option>
            ))}
          </select>
          <input
            className="field-input date-year-input"
            type="text"
            value={dr.startYear}
            onChange={(e) => u('startYear', e.target.value)}
            placeholder="Year"
            maxLength="4"
          />
        </div>

        <span className="date-separator">—</span>

        {/* End date or Present */}
        {dr.present ? (
          <span className="present-badge">Present</span>
        ) : (
          <div className="date-part">
            <select
              className="date-select"
              value={dr.endMonth}
              onChange={(e) => u('endMonth', e.target.value)}
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
            <input
              className="field-input date-year-input"
              type="text"
              value={dr.endYear}
              onChange={(e) => u('endYear', e.target.value)}
              placeholder="Year"
              maxLength="4"
            />
          </div>
        )}

        <label className="present-check-label">
          <input
            type="checkbox"
            checked={dr.present || false}
            onChange={(e) => u('present', e.target.checked)}
          />
          Present
        </label>
      </div>
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
        <DateRangePicker value={entry.dateRange} onChange={(v) => u('dateRange', v)} />
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
        <DateRangePicker value={entry.dateRange} onChange={(v) => u('dateRange', v)} />
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
        <Field label="Project Name"    value={entry.name}  onChange={(v) => u('name', v)}  placeholder="My Awesome Project" />
        <DateRangePicker value={entry.dateRange} onChange={(v) => u('dateRange', v)} />
        <Field label="Technologies"    value={entry.tech}  onChange={(v) => u('tech', v)}  placeholder="React, Node.js, MongoDB" />
        <Field label="Link (optional)" value={entry.link}  onChange={(v) => u('link', v)}  placeholder="github.com/you/project" />
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
        <div className="field cert-url-field">
          <label className="field-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4, verticalAlign: 'middle' }}>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Hyperlink (optional)
          </label>
          <input
            className="field-input"
            type="text"
            value={entry.url}
            onChange={(e) => u('url', e.target.value)}
            placeholder="coursera.org/verify/abc123"
          />
        </div>
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
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 639px)');

  useEffect(() => {
    if (!open || isMobile) return;

    const updateMenuPosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const viewportPad = 12;
      const gap = 6;
      const minMenuHeight = 140;
      const preferredMenuHeight = 280;

      const spaceBelow = window.innerHeight - rect.bottom - viewportPad;
      const spaceAbove = rect.top - viewportPad;
      // Only open upward if there's very little space below AND significantly more space above
      const openUpward = spaceBelow < 80 && spaceAbove > 200;

      const available = Math.max(minMenuHeight, openUpward ? spaceAbove - gap : spaceBelow - gap);
      const maxHeight = Math.min(preferredMenuHeight, available);
      const top = openUpward
        ? Math.max(viewportPad, rect.top - maxHeight - gap)
        : rect.bottom + gap;

      // Calculate menu width (consistent with minWidth set below)
      const menuWidth = Math.max(rect.width, 190);
      // Position menu at button's left, but constrain if it would overflow right edge
      const maxLeftPos = window.innerWidth - menuWidth - viewportPad;
      const left = Math.min(rect.left, maxLeftPos);

      setMenuStyle({
        top: `${Math.round(top)}px`,
        left: `${Math.round(Math.max(viewportPad, left))}px`,
        minWidth: `${Math.round(Math.max(rect.width, 190))}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, isMobile]);

  return (
    <div className="add-section-wrap">
      <button ref={buttonRef} className="add-section-btn" onClick={() => setOpen((o) => !o)}>
        + Add Section
      </button>
      {open && (
        <>
          <div className="dropdown-backdrop" onClick={() => setOpen(false)} />
          <div
            className={isMobile ? 'add-section-sheet' : 'dropdown dropdown--floating'}
            style={isMobile ? undefined : menuStyle}
          >
            {isMobile && (
              <button className="add-section-sheet-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
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

// ── Advanced Settings ─────────────────────────────────────────────────────────

function AdvancedSettings({ settings, onChange }) {
  const [open, setOpen] = useState(false);
  const u = (k, v) => onChange({ ...settings, [k]: v });

  return (
    <div className="advanced-settings-card">
      <button className="advanced-settings-toggle" onClick={() => setOpen((o) => !o)}>
        <svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        Advanced Settings
      </button>
      {open && (
        <div className="advanced-settings-body">
          <p className="advanced-hint">Leave blank to use recommended defaults shown as placeholders.</p>
          <div className="field-grid">
            <Field
              label="Font Size (pt)"
              value={settings.fontSize || ''}
              onChange={(v) => u('fontSize', v)}
              placeholder="11 (default)"
              half
            />
            <div className="field field--half" />
            <Field
              label="Top Margin (in)"
              value={settings.marginTop || ''}
              onChange={(v) => u('marginTop', v)}
              placeholder="0.5 (default)"
              half
            />
            <Field
              label="Bottom Margin (in)"
              value={settings.marginBottom || ''}
              onChange={(v) => u('marginBottom', v)}
              placeholder="0.5 (default)"
              half
            />
            <Field
              label="Left Margin (in)"
              value={settings.marginLeft || ''}
              onChange={(v) => u('marginLeft', v)}
              placeholder="0.5 (default)"
              half
            />
            <Field
              label="Right Margin (in)"
              value={settings.marginRight || ''}
              onChange={(v) => u('marginRight', v)}
              placeholder="0.5 (default)"
              half
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── FormPane root ─────────────────────────────────────────────────────────────

export default function FormPane({ data, onChange, settings, onSettingsChange }) {
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
      <AdvancedSettings settings={settings || {}} onChange={onSettingsChange} />
    </div>
  );
}
