import { esc, hrefUrl, formatDateRange } from './utils.js';

// ── Preamble (Harvard OCS CV style) ───────────────────────────────────────────
function makePreamble(settings = {}) {
  const fontSize     = settings.fontSize     || '11';
  const marginTop    = settings.marginTop    || '0.6';
  const marginBottom = settings.marginBottom || '0.6';
  const marginLeft   = settings.marginLeft   || '0.65';
  const marginRight  = settings.marginRight  || '0.65';

  return `%% Harvard CV Template
\\documentclass[letterpaper,${fontSize}pt]{article}

\\usepackage[top=${marginTop}in, bottom=${marginBottom}in, left=${marginLeft}in, right=${marginRight}in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0pt}
\\setlength{\\parindent}{0pt}

% Classic Harvard CV: centered bold section titles with a full-width rule below
\\titleformat{\\section}
  {\\vspace{4pt}\\normalsize\\bfseries\\centering}
  {}{0em}{}
  [\\vspace{2pt}\\titlerule\\vspace{4pt}]
\\titlespacing*{\\section}{0pt}{6pt}{4pt}

% Entry header: bold left, regular right; italic left, regular right
\\newcommand{\\harvardEntry}[4]{
  \\vspace{2pt}
  \\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}lr}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & #4 \\\\
  \\end{tabular*}\\par\\vspace{1pt}
}

\\newcommand{\\harvardProject}[2]{
  \\vspace{2pt}
  \\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}lr}
    #1 & #2 \\\\
  \\end{tabular*}\\par\\vspace{1pt}
}

\\newenvironment{harvardBullets}{
  \\begin{itemize}[leftmargin=1.4em, itemsep=1pt, parsep=0pt, topsep=2pt, partopsep=0pt]
}{
  \\end{itemize}\\vspace{2pt}
}
`;
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildHeader(h = {}) {
  const parts = [];
  if (h.phone)    parts.push(esc(h.phone));
  if (h.email)    parts.push(`\\href{mailto:${h.email}}{${esc(h.email)}}`);
  if (h.linkedin) parts.push(`\\href{${hrefUrl(h.linkedin)}}{${esc(h.linkedin)}}`);
  if (h.website)  parts.push(`\\href{${hrefUrl(h.website)}}{${esc(h.website)}}`);

  return `\\begin{center}
  {\\LARGE\\bfseries ${esc(h.name)}} \\\\[4pt]
  {\\small ${parts.join(' $\\cdot$ ')}}
\\end{center}
\\vspace{2pt}`;
}

function buildEducation(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) =>
    `\\harvardEntry{${esc(e.institution)}}{${esc(e.location)}}{${esc(e.degree)}}{${esc(formatDateRange(e.dateRange))}}`
  ).join('\n');

  return `\\section{${esc(sec.title)}}
${rows}`;
}

function buildExperience(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) => {
    const bullets = (e.bullets || [])
      .filter((b) => b.trim())
      .map((b) => `  \\item ${esc(b)}`)
      .join('\n');

    const header = `\\harvardEntry{${esc(e.company || e.role)}}{${esc(e.location)}}{${esc(e.company ? e.role : '')}}{${esc(formatDateRange(e.dateRange))}}`;
    return bullets
      ? `${header}\n\\begin{harvardBullets}\n${bullets}\n\\end{harvardBullets}`
      : header;
  }).join('\n');

  return `\\section{${esc(sec.title)}}
${rows}`;
}

function buildProjects(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) => {
    const nameStr = `\\textbf{${esc(e.name)}}`;
    const techStr = e.tech ? ` (\\textit{${esc(e.tech)}})` : '';
    const linkHref = hrefUrl(e.link);
    const linkStr = linkHref ? ` $\\cdot$ \\href{${linkHref}}{\\underline{${esc(e.link)}}}` : '';
    const heading = `${nameStr}${techStr}${linkStr}`;

    const bullets = (e.bullets || [])
      .filter((b) => b.trim())
      .map((b) => `  \\item ${esc(b)}`)
      .join('\n');

    const header = `\\harvardProject{${heading}}{${esc(formatDateRange(e.dateRange))}}`;
    return bullets
      ? `${header}\n\\begin{harvardBullets}\n${bullets}\n\\end{harvardBullets}`
      : header;
  }).join('\n');

  return `\\section{${esc(sec.title)}}
${rows}`;
}

function buildSkills(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries
    .filter((r) => r.label || r.value)
    .map((r) => `\\textbf{${esc(r.label)}:} ${esc(r.value)}`)
    .join(' \\\\\n');

  if (!rows) return '';
  return `\\section{${esc(sec.title)}}
\\vspace{2pt}
${rows}
\\vspace{2pt}`;
}

function buildCertifications(sec) {
  if (!sec.entries?.length) return '';
  const items = sec.entries
    .filter((i) => i.text)
    .map((i) => {
      const href = hrefUrl(i.url);
      return href
        ? `  \\item \\href{${href}}{\\underline{${esc(i.text)}}}`
        : `  \\item ${esc(i.text)}`;
    })
    .join('\n');

  if (!items) return '';
  return `\\section{${esc(sec.title)}}
\\begin{harvardBullets}
${items}
\\end{harvardBullets}`;
}

function buildSection(sec) {
  switch (sec.type) {
    case 'education':      return buildEducation(sec);
    case 'experience':     return buildExperience(sec);
    case 'projects':       return buildProjects(sec);
    case 'skills':         return buildSkills(sec);
    case 'certifications': return buildCertifications(sec);
    default:               return `% Unknown section type: ${sec.type}`;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildHarvardCV(data, settings = {}) {
  const body = (data.sections || [])
    .map(buildSection)
    .filter(Boolean)
    .join('\n\n');

  return `${makePreamble(settings)}
\\begin{document}

${buildHeader(data.header)}

${body}

\\end{document}
`;
}
