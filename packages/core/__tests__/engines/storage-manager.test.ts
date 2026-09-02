import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../../src/engines/storage-manager';

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager('test');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves and loads data from localStorage', async () => {
    await manager.save('key1', { name: 'test' });
    const result = manager.load<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null for missing keys', () => {
    const result = manager.load('nonexistent');
    expect(result).toBeNull();
  });

  it('removes data from localStorage', async () => {
    await manager.save('key2', 'value');
    manager.remove('key2');
    expect(manager.load('key2')).toBeNull();
  });

  it('handles different data types', async () => {
    await manager.save('string', 'hello');
    await manager.save('number', 42);
    await manager.save('array', [1, 2, 3]);

    expect(manager.load<string>('string')).toBe('hello');
    expect(manager.load<number>('number')).toBe(42);
    expect(manager.load<number[]>('array')).toEqual([1, 2, 3]);
  });

  it('handles QuotaExceededError defensively without throwing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    // Defensive: save must not throw and must log a warning.
    await expect(manager.save('overflow', 'x'.repeat(1024))).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Quota exceeded'));
    warnSpy.mockRestore();
  });

  it('invokes onStorageError handler on quota exceeded', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onStorageError = vi.fn();
    const managerWithHandler = new StorageManager('test', '1.0.0', 2048, onStorageError);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    await managerWithHandler.save('overflow', 'x'.repeat(1024));
    expect(onStorageError).toHaveBeenCalledTimes(1);
    expect(onStorageError.mock.calls[0][0]).toBeInstanceOf(DOMException);
    expect(onStorageError.mock.calls[0][1]).toBe('test:overflow');
    warnSpy.mockRestore();
  });

  it('logs warning on version mismatch', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await manager.save('key', 'value', '1.0');
    manager.load<string>('key', '2.0');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Version mismatch'));
    warnSpy.mockRestore();
  });

  it('returns corrupt status for invalid stored JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('test:bad', '{invalid');
    const result = manager.loadEntry('bad');
    expect(result.status).toBe('corrupt');
    expect(result.data).toBeNull();
    warnSpy.mockRestore();
  });

  it('compresses large data and loads it back', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const largeData = 'x'.repeat(3000);
    await manager.save('compressed', largeData);

    const loaded = manager.load<string>('compressed');
    expect(loaded).toBe(largeData);

    const entry = manager.loadEntry<string>('compressed');
    expect(entry.status).toBe('ok');
    warnSpy.mockRestore();
  });

  it('handles non-QuotaExceededError on save defensively', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    await expect(manager.save('blocked', 'value')).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to set'),
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });
});
