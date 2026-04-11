import { esc, hrefUrl, formatDateRange } from './utils.js';

function makePreamble(settings = {}) {
  const fontSize = settings.fontSize || '10';
  const marginTop = settings.marginTop || '0.6';
  const marginBottom = settings.marginBottom || '0.6';
  const marginLeft = settings.marginLeft || '0.65';
  const marginRight = settings.marginRight || '0.65';

  return `%% Deedy-inspired resume (single-column, modern-deedy-style)
\\documentclass[${fontSize}pt,letterpaper]{article}
\\usepackage[top=${marginTop}in,bottom=${marginBottom}in,left=${marginLeft}in,right=${marginRight}in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[dvipsnames]{xcolor}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{ragged2e}

\\definecolor{deedyblue}{HTML}{1E4E79}
\\definecolor{deedytext}{HTML}{1B1B1B}
\\definecolor{deedymuted}{HTML}{5D6D7E}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\setlist[itemize]{leftmargin=*, itemsep=1pt, topsep=2pt, parsep=0pt, partopsep=0pt}

\\titleformat{\\section}{\\large\\bfseries\\color{deedyblue}}{}{0em}{}[\\vspace{2pt}\\hrule\\vspace{3pt}]
\\titleformat{\\subsection}{\\normalsize\\bfseries\\color{deedyblue}}{}{0em}{}
\\titlespacing*{\\section}{0pt}{4pt}{2pt}

\\newcommand{\\sectionsep}{\\vspace{6pt}}
`;
}

function buildHeader(header = {}) {
  const parts = [];
  if (header.phone) parts.push(esc(header.phone));
  if (header.email) parts.push(`\\href{mailto:${header.email}}{${esc(header.email)}}`);

  if (header.website) {
    const siteUrl = hrefUrl(header.website);
    const label = header.website.replace(/^https?:\/\//i, '');
    parts.push(`\\href{${siteUrl}}{${esc(label)}}`);
  }

  if (header.linkedin) {
    const liUrl = hrefUrl(header.linkedin);
    const label = header.linkedin.replace(/^https?:\/\//i, '');
    parts.push(`\\href{${liUrl}}{${esc(label)}}`);
  }

  return `\\begin{center}
{\\Huge\\bfseries ${esc(header.name)}}\\\\[2pt]
{\\small\\color{deedymuted}${parts.join(' \\textbar\\ ')} }
\\end{center}`;
}

function sectionByType(data, type) {
  return data.sections.find((section) => section.type === type);
}

function buildHeadingRow(left, right, leftWidth = '0.72\\linewidth', rightWidth = '0.24\\linewidth') {
  const leftText = left ? `\\textbf{${esc(left)}}` : '';
  const rightText = right ? `\\textit{${esc(right)}}` : '';
  return `\\noindent\\begin{minipage}[t]{${leftWidth}}
\\raggedright
${leftText}
\\end{minipage}\\hfill
\\begin{minipage}[t]{${rightWidth}}
\\raggedleft
${rightText}
\\end{minipage}`;
}

function buildEducationSection(sec) {
  if (!sec?.entries?.length) return '';
  const rows = sec.entries.map((entry) => {
    const when = formatDateRange(entry.dateRange);
    const schoolLine = buildHeadingRow(entry.institution, when);
    const location = entry.location ? `\\textit{${esc(entry.location)}}` : '';

    return `\\par\\noindent ${schoolLine}
\\par\\noindent ${esc(entry.degree)}${location ? `\\par\\noindent ${location}` : ''}
\\par`;
  }).join('\n\\sectionsep\n');

  return `\\section{${esc(sec.title || 'Education')}}
${rows}`;
}

function buildExperienceSection(sec) {
  if (!sec?.entries?.length) return '';
  const rows = sec.entries.map((entry) => {
    const when = formatDateRange(entry.dateRange);
    const heading = buildHeadingRow(
      `${entry.role}${entry.company ? ` | ${entry.company}` : ''}`,
      when,
      '0.72\\linewidth',
      '0.24\\linewidth'
    );
    const location = entry.location ? `\\textit{${esc(entry.location)}}` : '';
    const bullets = (entry.bullets || [])
      .filter((bullet) => bullet.trim())
      .map((bullet) => `  \\item ${esc(bullet)}`)
      .join('\n');

    return `\\par\\noindent ${heading}
  ${location}
  ${bullets ? `\\begin{itemize}
${bullets}
\\end{itemize}` : ''}`;
  }).join('\n\\sectionsep\n');

  return `\\section{${esc(sec.title || 'Experience')}}
${rows}`;
}

function buildProjectsSection(sec) {
  if (!sec?.entries?.length) return '';
  const rows = sec.entries.map((entry) => {
    const when = formatDateRange(entry.dateRange);
    const link = hrefUrl(entry.link);
    const metaParts = [];

    if (entry.tech) metaParts.push(`\\textit{${esc(entry.tech)}}`);
    if (link) metaParts.push(`\\href{${link}}{${esc(entry.link)}}`);

    const bullets = (entry.bullets || [])
      .filter((bullet) => bullet.trim())
      .map((bullet) => `  \\item ${esc(bullet)}`)
      .join('\n');

    return `\\par\\noindent ${buildHeadingRow(entry.name, when)}
${metaParts.join('\\,\\textbar\\,')}
${bullets ? `\\begin{itemize}
${bullets}
\\end{itemize}` : ''}`;
  }).join('\n\\sectionsep\n');

  return `\\section{${esc(sec.title || 'Projects')}}
${rows}`;
}

function buildSkillsSection(sec) {
  if (!sec?.entries?.length) return '';
  const rows = sec.entries
    .filter((entry) => entry.label || entry.value)
    .map((entry) => `\\textbf{${esc(entry.label)}}: ${esc(entry.value)}`)
    .join('\\\\\n');

  return `\\section{${esc(sec.title || 'Skills')}}
${rows}`;
}

function buildCertificationsSection(sec) {
  if (!sec?.entries?.length) return '';
  const rows = sec.entries
    .filter((entry) => entry.text)
    .map((entry) => {
      const link = hrefUrl(entry.url);
      return link ? `\\href{${link}}{${esc(entry.text)}}` : esc(entry.text);
    })
    .join('\\\\\n');

  return `\\section{${esc(sec.title || 'Awards')}}
${rows}`;
}

function buildSectionOrder(data) {
  const order = ['education', 'experience', 'projects', 'skills', 'certifications'];
  return order
    .map((type) => sectionByType(data, type))
    .filter(Boolean)
    .map((sec) => {
      switch (sec.type) {
        case 'education': return buildEducationSection(sec);
        case 'experience': return buildExperienceSection(sec);
        case 'projects': return buildProjectsSection(sec);
        case 'skills': return buildSkillsSection(sec);
        case 'certifications': return buildCertificationsSection(sec);
        default: return '';
      }
    })
    .filter(Boolean)
    .join('\n\\sectionsep\n');
}

export function buildDeedyResume(data, settings = {}) {
  const preamble = makePreamble(settings);
  const header = buildHeader(data.header || {});
  const body = buildSectionOrder(data);
  const sectionSpacing = settings.deedySectionSpacing || '8';

  return `${preamble}
\\begin{document}
${header}

\\vspace{${sectionSpacing}pt}
\\RaggedRight

${body || '% No content'}

\\end{document}
`;
}
