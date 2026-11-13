// Shared LaTeX utilities used by all template builders

// Escape LaTeX special characters in plain text
export const esc = (s = '') =>
  String(s).replace(/[\\{}\$%#&_^~]/g, (c) => ({
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    $: '\\$',
    '%': '\\%',
    '#': '\\#',
    '&': '\\&',
    _: '\\_',
    '^': '\\^{}',
    '~': '\\~{}',
  }[c] ?? c));

// Normalise a URL: prepend https:// only if no protocol present
export const hrefUrl = (url) => {
  if (!url?.trim()) return '';
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};

// Format a dateRange object { startMonth, startYear, endMonth, endYear, present }
export const MONTH_LABELS = {
  Jan: 'Jan.', Feb: 'Feb.', Mar: 'Mar.', Apr: 'Apr.',
  May: 'May',  Jun: 'Jun.', Jul: 'Jul.', Aug: 'Aug.',
  Sep: 'Sep.', Oct: 'Oct.', Nov: 'Nov.', Dec: 'Dec.',
};

export function formatDateRange(dr) {
  if (!dr) return '';
  const { startMonth, startYear, endMonth, endYear, present } = dr;
  const start = [startMonth ? MONTH_LABELS[startMonth] : '', startYear].filter(Boolean).join(' ');
  let end = '';
  if (present) {
    end = 'Present';
  } else {
    end = [endMonth ? MONTH_LABELS[endMonth] : '', endYear].filter(Boolean).join(' ');
  }
  if (!start && !end) return '';
  if (!end) return start;
  if (!start) return end;
  return `${start} -- ${end}`;
}
