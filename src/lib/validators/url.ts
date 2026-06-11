const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !isValidHttpUrl(trimmed)) {
    return null;
  }

  return trimmed;
}
