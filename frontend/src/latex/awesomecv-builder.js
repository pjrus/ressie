import { esc, hrefUrl, formatDateRange } from './utils.js';

// Split "First Last Name" → { first: "First", last: "Last Name" }
function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  const last = parts.pop();
  return { first: parts.join(' '), last };
}

// ── Preamble ─────────────────────────────────────────────────────────────────
function makePreamble(settings = {}) {
  const fontSize = settings.fontSize || '11';
  return `%% Awesome-CV — https://github.com/posquit0/Awesome-CV
\\documentclass[${fontSize}pt, a4paper]{awesome-cv}

\\geometry{left=1.4cm, top=.8cm, right=1.4cm, bottom=1.8cm, footskip=.5cm}

\\colorlet{awesome}{awesome-skyblue}
\\setbool{acvSectionColorHighlight}{true}
`;
}

// ── Header ────────────────────────────────────────────────────────────────────
function buildHeader(h) {
  const { first, last } = splitName(h.name);
  const lines = [`\\name{${esc(first)}}{${esc(last)}}`];

  if (h.phone)    lines.push(`\\mobile{${esc(h.phone)}}`);
  if (h.email)    lines.push(`\\email{${esc(h.email)}}`);
  if (h.linkedin) {
    // \linkedin expects just the handle after linkedin.com/in/
    const handle = h.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '');
    lines.push(`\\linkedin{${esc(handle)}}`);
  }
  if (h.website) {
    const url = h.website.replace(/^https?:\/\//i, '');
    lines.push(`\\homepage{${esc(url)}}`);
  }

  return lines.join('\n');
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildEducation(sec) {
  if (!sec.entries?.length) return '';
  const entries = sec.entries.map((e) =>
    `  \\cventry\n    {${esc(e.degree)}}\n    {${esc(e.institution)}}\n    {${esc(e.location)}}\n    {${esc(formatDateRange(e.dateRange))}}\n    {}`
  ).join('\n\n');
  return `\\cvsection{${esc(sec.title)}}\n\\begin{cventries}\n\n${entries}\n\n\\end{cventries}`;
}

function buildExperience(sec) {
  if (!sec.entries?.length) return '';
  const entries = sec.entries.map((e) => {
    const bullets = (e.bullets || []).filter((b) => b.trim());
    const desc = bullets.length
      ? `    {%\n      \\begin{cvitems}\n${bullets.map((b) => `        \\item {${esc(b)}}`).join('\n')}\n      \\end{cvitems}\n    }`
      : '    {}';
    return `  \\cventry\n    {${esc(e.role)}}\n    {${esc(e.company)}}\n    {${esc(e.location)}}\n    {${esc(formatDateRange(e.dateRange))}}\n${desc}`;
  }).join('\n\n');
  return `\\cvsection{${esc(sec.title)}}\n\\begin{cventries}\n\n${entries}\n\n\\end{cventries}`;
}

function buildProjects(sec) {
  if (!sec.entries?.length) return '';
  const entries = sec.entries.map((e) => {
    const link = hrefUrl(e.link);
    const subtitle = [e.tech ? `\\textit{${esc(e.tech)}}` : '', link ? `\\href{${link}}{${esc(e.link)}}` : ''].filter(Boolean).join(' $|$ ');
    const bullets = (e.bullets || []).filter((b) => b.trim());
    const desc = bullets.length
      ? `    {%\n      \\begin{cvitems}\n${bullets.map((b) => `        \\item {${esc(b)}}`).join('\n')}\n      \\end{cvitems}\n    }`
      : '    {}';
    return `  \\cventry\n    {${subtitle}}\n    {${esc(e.name)}}\n    {}\n    {${esc(formatDateRange(e.dateRange))}}\n${desc}`;
  }).join('\n\n');
  return `\\cvsection{${esc(sec.title)}}\n\\begin{cventries}\n\n${entries}\n\n\\end{cventries}`;
}

function buildSkills(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries
    .filter((r) => r.label || r.value)
    .map((r) => `  \\cvskill\n    {${esc(r.label)}}\n    {${esc(r.value)}}`)
    .join('\n\n');
  return `\\cvsection{${esc(sec.title)}}\n\\begin{cvskills}\n\n${rows}\n\n\\end{cvskills}`;
}

function buildCertifications(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries
    .filter((i) => i.text)
    .map((i) => {
      const href = hrefUrl(i.url);
      const title = href ? `\\href{${href}}{${esc(i.text)}}` : esc(i.text);
      return `  \\cvhonor\n    {${title}}\n    {}\n    {}\n    {}`;
    })
    .join('\n\n');
  return `\\cvsection{${esc(sec.title)}}\n\\begin{cvhonors}\n\n${rows}\n\n\\end{cvhonors}`;
}

function buildSectionContent(sec) {
  switch (sec.type) {
    case 'education':      return buildEducation(sec);
    case 'experience':     return buildExperience(sec);
    case 'projects':       return buildProjects(sec);
    case 'skills':         return buildSkills(sec);
    case 'certifications': return buildCertifications(sec);
    default: return `% Unknown section type: ${sec.type}`;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function buildAwesomeCV(data, settings = {}) {
  const preamble = makePreamble(settings);
  const header = buildHeader(data.header);
  const body = data.sections
    .map(buildSectionContent)
    .filter(Boolean)
    .join('\n\n');

  return `${preamble}
${header}

\\begin{document}

\\makecvheader[C]

${body}

\\end{document}
`;
}
