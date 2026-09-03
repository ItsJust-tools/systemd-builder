/**
 * Graceful clipboard helpers.
 *
 * `navigator.clipboard.writeText(...)` rejects when the page is loaded in an
 * unauthenticated iframe, over HTTP (e.g. local staging), or when the browser
 * clipboard permission is denied by policy. These helpers detect insecure
 * origins up front and fall back to `document.execCommand('copy')` via an
 * off-screen textarea so copying never throws an uncaught promise rejection.
 */

/** Result of a copy attempt. */
export interface CopyResult {
  /** True when the text was successfully copied to the clipboard. */
  success: boolean;
  /** True when the legacy `execCommand('copy')` fallback was used. */
  usedFallback: boolean;
  /** The underlying error, if the copy ultimately failed. */
  error?: unknown;
}

/**
 * True when the current origin is a secure context (HTTPS or localhost).
 * The Clipboard API is only available in secure contexts.
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.isSecureContext === 'boolean') return window.isSecureContext;
  // Fallback: treat localhost / loopback and HTTPS as secure.
  const protocol = window.location?.protocol ?? '';
  const hostname = window.location?.hostname ?? '';
  return (
    protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

/**
 * True when the async Clipboard API is available and usable.
 */
export function isClipboardApiAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  );
}

/**
 * Copy text using the legacy `document.execCommand('copy')` approach with an
 * off-screen textarea. Returns true on success, false otherwise.
 */
export function copyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  // Prevent the textarea from being visible or causing a scroll jump.
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  } finally {
    document.body.removeChild(textarea);
    if (selection && previousRange) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
  }
  return success;
}

/**
 * Copy `text` to the clipboard with a graceful fallback.
 *
 * 1. Prefers the async Clipboard API (`navigator.clipboard.writeText`).
 * 2. Falls back to `document.execCommand('copy')` via an off-screen textarea
 *    when the Clipboard API is unavailable, the origin is insecure, or the
 *    permission is rejected.
 *
 * Never throws. Returns a {@link CopyResult} describing the outcome.
 */
export async function copyTextToClipboard(text: string): Promise<CopyResult> {
  // Prefer the async Clipboard API when available and in a secure context.
  if (isClipboardApiAvailable() && isSecureContext()) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, usedFallback: false };
    } catch (error) {
      // Fall through to the legacy fallback on rejection.
      const fallbackOk = copyWithExecCommand(text);
      return fallbackOk
        ? { success: true, usedFallback: true }
        : { success: false, usedFallback: true, error };
    }
  }

  // Clipboard API unavailable or insecure origin — use the legacy fallback.
  const fallbackOk = copyWithExecCommand(text);
  return fallbackOk
    ? { success: true, usedFallback: true }
    : { success: false, usedFallback: true };
}
