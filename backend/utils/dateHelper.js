export const parseDateTimeIST = (dateStr) => {
  if (!dateStr) return new Date(NaN);
  let str = String(dateStr).trim();
  // Check if string already has timezone information:
  // - ends with Z (e.g. 2026-08-27T04:50:00Z)
  // - ends with an offset like +05:30, +0530, +05, -08:00, etc.
  // - contains GMT or UTC
  const hasTimezone = /(?:Z|[-+]\d{2}(?::?\d{2})?)$/i.test(str) || str.includes('GMT') || str.includes('UTC');
  if (!hasTimezone) {
    str = str.includes('T') ? str + '+05:30' : str + ' +05:30';
  }
  return new Date(str);
};
