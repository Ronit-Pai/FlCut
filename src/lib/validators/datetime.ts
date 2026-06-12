export type DateTimeValidationResult =
  | { valid: true; date: Date }
  | { valid: false; error: string };

export function parseOptionalDateTime(
  value: unknown,
): Date | null | { error: string } {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value !== "string") {
    return { error: "Date must be a string." };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { error: "Invalid date format. Expected an ISO 8601 string." };
  }

  return date;
}

export function requireFutureDate(
  date: Date,
  fieldLabel: string,
  now: Date = new Date(),
): DateTimeValidationResult {
  if (date <= now) {
    return { valid: false, error: `${fieldLabel} must be in the future.` };
  }
  return { valid: true, date };
}
