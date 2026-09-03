/**
 * Defensive wrappers around the Web Storage API (localStorage / sessionStorage).
 *
 * Browsers in Private/Incognito mode or devices with low disk space can throw
 * `DOMException: QuotaExceededError` or `SecurityError` on `setItem`/`getItem`.
 * These helpers ensure such failures never break the application state flow or
 * cause UI freezes — they catch the error, log a warning, and (optionally)
 * invoke a caller-supplied handler (e.g. to surface a non-intrusive toast).
 */

/** Minimal subset of the Storage interface used by these helpers. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export type StorageAction = 'set' | 'get' | 'remove';

/** Callback invoked when a storage operation fails. */
export type StorageErrorHandler = (error: unknown, key: string, action: StorageAction) => void;

/** True when the error is a quota-exceeded DOMException. */
export function isQuotaExceededError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

/** True when the error is a storage-blocking DOMException (private browsing, etc.). */
export function isStorageBlockedError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'SecurityError')
  );
}

/**
 * Safely write a value to storage. Returns `true` on success, `false` on
 * failure. Never throws.
 */
export function safeSetItem(
  storage: StorageLike,
  key: string,
  value: string,
  onError?: StorageErrorHandler
): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    onError?.(error, key, 'set');
    return false;
  }
}

/**
 * Safely read a value from storage. Returns the stored value or `null` on
 * failure. Never throws.
 */
export function safeGetItem(
  storage: StorageLike,
  key: string,
  onError?: StorageErrorHandler
): string | null {
  try {
    return storage.getItem(key);
  } catch (error) {
    onError?.(error, key, 'get');
    return null;
  }
}

/**
 * Safely remove a value from storage. Returns `true` on success, `false` on
 * failure. Never throws.
 */
export function safeRemoveItem(
  storage: StorageLike,
  key: string,
  onError?: StorageErrorHandler
): boolean {
  try {
    storage.removeItem?.(key);
    return true;
  } catch (error) {
    onError?.(error, key, 'remove');
    return false;
  }
}
