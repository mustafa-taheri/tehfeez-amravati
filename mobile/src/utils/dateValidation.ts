const dateRegex: RegExp = /^\d{2}-\d{2}-\d{4}$/;

/**
 * Validates that a string is strictly in DD-MM-YYYY format and is a valid calendar date.
 * @param dateString The date string to validate (e.g., "25-12-2026").
 * @returns boolean True if valid, false otherwise.
 */
export function validateDDMMYYYY(dateString: string): boolean {
  // 1. Enforce strict format (no slashes allowed)
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // 2. Extract and parse digits safely
  const [dayStr, monthStr, yearStr] = dateString.split("-");
  const day: number = parseInt(dayStr, 10);
  const month: number = parseInt(monthStr, 10);
  const year: number = parseInt(yearStr, 10);

  // 3. Create Date object (Months are 0-indexed: 0 = January, 1 = February)
  const dateObj: Date = new Date(year, month - 1, day);

  // 4. Verify calendar logic to prevent automatic JavaScript rollover
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}
