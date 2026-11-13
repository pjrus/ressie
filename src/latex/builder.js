import { esc, hrefUrl, formatDateRange } from './utils.js';

// ── Preamble (parameterised) ──────────────────────────────────────────────────
function makePreamble(settings = {}) {
  const fontSize     = settings.fontSize     || '11';
  const marginTop    = settings.marginTop    || '0.5';
  const marginBottom = settings.marginBottom || '0.5';
  const marginLeft   = settings.marginLeft   || '0.5';
  const marginRight  = settings.marginRight  || '0.5';

  return `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,${fontSize}pt]{article}

\\usepackage{latexsym}
\\usepackage[top=${marginTop}in, bottom=${marginBottom}in, left=${marginLeft}in, right=${marginRight}in]{geometry}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
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
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
`;
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildHeader(h) {
  const parts = [];
  if (h.phone)    parts.push(esc(h.phone));
  if (h.email)    parts.push(`\\href{mailto:${h.email}}{\\underline{${esc(h.email)}}}`);
  if (h.linkedin) parts.push(`\\href{${hrefUrl(h.linkedin)}}{\\underline{${esc(h.linkedin)}}}`);
  if (h.website)  parts.push(`\\href{${hrefUrl(h.website)}}{\\underline{${esc(h.website)}}}`);

  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${esc(h.name)}} \\\\ \\vspace{1pt}
    \\small ${parts.join(' $|$\n    ')}
\\end{center}`;
}

function buildEducation(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) =>
    `    \\resumeSubheading\n      {${esc(e.institution)}}{${esc(e.location)}}\n      {${esc(e.degree)}}{${esc(formatDateRange(e.dateRange))}}`
  ).join('\n');
  return `%-----------${sec.title.toUpperCase()}-----------
\\section{${esc(sec.title)}}
  \\resumeSubHeadingListStart
${rows}
  \\resumeSubHeadingListEnd`;
}

function buildExperience(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) => {
    const bullets = (e.bullets || [])
      .filter((b) => b.trim())
      .map((b) => `        \\resumeItem{${esc(b)}}`)
      .join('\n');
    return `    \\resumeSubheading\n      {${esc(e.role)}}{${esc(formatDateRange(e.dateRange))}}\n      {${esc(e.company)}}{${esc(e.location)}}${bullets ? `\n      \\resumeItemListStart\n${bullets}\n      \\resumeItemListEnd` : ''}`;
  }).join('\n\n');
  return `%-----------${sec.title.toUpperCase()}-----------
\\section{${esc(sec.title)}}
  \\resumeSubHeadingListStart

${rows}

  \\resumeSubHeadingListEnd`;
}

function buildProjects(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries.map((e) => {
    const nameStr = `\\textbf{${esc(e.name)}}`;
    const techStr = e.tech ? ` $|$ \\emph{${esc(e.tech)}}` : '';
    const linkHref = hrefUrl(e.link);
    const linkStr = linkHref ? ` $|$ \\href{${linkHref}}{\\underline{${esc(e.link)}}}` : '';
    const heading = `${nameStr}${techStr}${linkStr}`;
    const bullets = (e.bullets || [])
      .filter((b) => b.trim())
      .map((b) => `            \\resumeItem{${esc(b)}}`)
      .join('\n');
    return `      \\resumeProjectHeading\n          {${heading}}{${esc(formatDateRange(e.dateRange))}}${bullets ? `\n          \\resumeItemListStart\n${bullets}\n          \\resumeItemListEnd` : ''}`;
  }).join('\n\n');
  return `%-----------${sec.title.toUpperCase()}-----------
\\section{${esc(sec.title)}}
    \\resumeSubHeadingListStart

${rows}

    \\resumeSubHeadingListEnd`;
}

function buildSkills(sec) {
  if (!sec.entries?.length) return '';
  const rows = sec.entries
    .filter((r) => r.label || r.value)
    .map((r) => `     \\textbf{${esc(r.label)}}{: ${esc(r.value)}}`)
    .join(' \\\\\n');
  return `%-----------${sec.title.toUpperCase()}-----------
\\section{${esc(sec.title)}}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${rows}
    }}
 \\end{itemize}`;
}

function buildCertifications(sec) {
  if (!sec.entries?.length) return '';
  const items = sec.entries
    .filter((i) => i.text)
    .map((i) => {
      const href = hrefUrl(i.url);
      return href
        ? `     \\href{${href}}{\\underline{${esc(i.text)}}}`
        : `     ${esc(i.text)}`;
    })
    .join(' \\\\\n');
  return `%-----------${sec.title.toUpperCase()}-----------
\\section{${esc(sec.title)}}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${items}
    }}
 \\end{itemize}`;
}

function buildSection(sec) {
  switch (sec.type) {
    case 'education':     return buildEducation(sec);
    case 'experience':    return buildExperience(sec);
    case 'projects':      return buildProjects(sec);
    case 'skills':        return buildSkills(sec);
    case 'certifications': return buildCertifications(sec);
    default: return `% Unknown section type: ${sec.type}`;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildLaTeX(data, settings = {}) {
  const body = data.sections
    .map(buildSection)
    .filter(Boolean)
    .join('\n\n');

  return `${makePreamble(settings)}
\\begin{document}

%-----------HEADING-----------
${buildHeader(data.header)}

${body}

%-------------------------------------------
\\end{document}
`;
}
