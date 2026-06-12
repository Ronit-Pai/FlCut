export const ALIAS_REGEX = /^[a-z0-9-]{3,30}$/;

export type AliasValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateAlias(value: string): AliasValidationResult {
  if (!ALIAS_REGEX.test(value)) {
    return {
      valid: false,
      error:
        "Invalid alias format. Use 3–30 lowercase letters(a-z), numbers(0-9), or hyphens(-).",
    };
  }

  return { valid: true };
}
