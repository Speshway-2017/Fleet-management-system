/**
 * Standardize Employee ID Display Format across Fleet Management UI.
 * 
 * Rules:
 * 1. Never display "DRV-" prefix in the UI.
 * 2. Standardize Employee IDs to EMP-XXXXXX format.
 * 3. Converts values like "DRV-000001" -> "EMP-000001", "916115" -> "EMP-916115", etc.
 */
export function formatEmployeeId(empId) {
  if (!empId || typeof empId !== 'string') return "N/A";
  const trimmed = empId.trim();
  if (!trimmed) return "N/A";

  // If already starts with EMP- (case-insensitive)
  if (/^EMP-/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // If starts with DRV- (case-insensitive), replace prefix with EMP-
  if (/^DRV-/i.test(trimmed)) {
    return trimmed.toUpperCase().replace(/^DRV-/, 'EMP-');
  }

  // If numeric string or other format, extract digits
  const digits = trimmed.replace(/\D/g, '');
  if (digits) {
    return `EMP-${digits.padStart(6, '0')}`;
  }

  return `EMP-${trimmed.toUpperCase()}`;
}
