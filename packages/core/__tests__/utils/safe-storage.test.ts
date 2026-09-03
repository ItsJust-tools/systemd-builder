import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  isQuotaExceededError,
  isStorageBlockedError,
} from '../../src/utils/safe-storage';

describe('safe-storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('safeSetItem writes and returns true on success', () => {
    const onError = vi.fn();
    expect(safeSetItem(localStorage, 'k', 'v', onError)).toBe(true);
    expect(localStorage.getItem('k')).toBe('v');
    expect(onError).not.toHaveBeenCalled();
  });

  it('safeSetItem catches QuotaExceededError and returns false', () => {
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(safeSetItem(localStorage, 'k', 'v', onError)).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(DOMException);
    expect(onError.mock.calls[0][1]).toBe('k');
    expect(onError.mock.calls[0][2]).toBe('set');
  });

  it('safeSetItem catches SecurityError (private browsing) and returns false', () => {
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    expect(safeSetItem(localStorage, 'k', 'v', onError)).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('safeGetItem returns null on error without throwing', () => {
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    expect(safeGetItem(localStorage, 'k', onError)).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][2]).toBe('get');
  });

  it('safeGetItem returns stored value on success', () => {
    localStorage.setItem('k', 'hello');
    expect(safeGetItem(localStorage, 'k')).toBe('hello');
  });

  it('safeRemoveItem returns false on error without throwing', () => {
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    expect(safeRemoveItem(localStorage, 'k', onError)).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][2]).toBe('remove');
  });

  it('safeRemoveItem returns true on success', () => {
    localStorage.setItem('k', 'v');
    expect(safeRemoveItem(localStorage, 'k')).toBe(true);
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('isQuotaExceededError detects QuotaExceededError only', () => {
    expect(isQuotaExceededError(new DOMException('q', 'QuotaExceededError'))).toBe(true);
    expect(isQuotaExceededError(new DOMException('s', 'SecurityError'))).toBe(false);
    expect(isQuotaExceededError(new Error('x'))).toBe(false);
  });

  it('isStorageBlockedError detects quota and security errors', () => {
    expect(isStorageBlockedError(new DOMException('q', 'QuotaExceededError'))).toBe(true);
    expect(isStorageBlockedError(new DOMException('s', 'SecurityError'))).toBe(true);
    expect(isStorageBlockedError(new Error('x'))).toBe(false);
  });
});
