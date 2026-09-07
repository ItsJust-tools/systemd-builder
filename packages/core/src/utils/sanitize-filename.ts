/**
 * Sanitize a filename so it is safe across Windows, Linux, and macOS filesystems.
 *
 * Replaces invalid OS characters (`\ / : * ? " < > |` and `%`), strips control
 * characters, trims surrounding whitespace, removes leading dots (hidden files),
 * and enforces a maximum length of 100 characters.
 *
 * @param filename - The raw filename to sanitize.
 * @param fallback - Fallback name used when the result would be empty.
 * @returns A filesystem-safe filename.
 */
export function sanitizeFilename(filename: string, fallback = 'export'): string {
  if (!filename || typeof filename !== 'string') {
    return fallback;
  }

  const sanitized = filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .trim()
    .replace(/^[.]+/, '');

  if (!sanitized) {
    return fallback;
  }

  return sanitized.slice(0, 100).trim();
}
