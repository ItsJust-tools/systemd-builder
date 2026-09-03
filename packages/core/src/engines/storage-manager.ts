import type { StorageData } from '../types';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import {
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  isQuotaExceededError,
  type StorageErrorHandler,
} from '../utils/safe-storage';

export type StorageLoadStatus = 'missing' | 'ok' | 'corrupt';

export interface StorageLoadResult<T> {
  status: StorageLoadStatus;
  data: T | null;
}

export class StorageManager {
  private prefix: string;
  private defaultVersion?: string;
  private compressionThresholdBytes: number;
  private onStorageError?: StorageErrorHandler;

  constructor(
    prefix = 'itsjust',
    defaultVersion = '1.0.0',
    compressionThresholdBytes = 2048,
    onStorageError?: StorageErrorHandler
  ) {
    this.prefix = prefix;
    this.defaultVersion = defaultVersion;
    this.compressionThresholdBytes = Math.max(0, compressionThresholdBytes);
    this.onStorageError = onStorageError;
  }

  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }

  private handleError(error: unknown, key: string, action: 'set' | 'get' | 'remove') {
    if (isQuotaExceededError(error)) {
      console.warn(
        `[StorageManager] Quota exceeded ${action === 'set' ? 'saving' : action === 'get' ? 'reading' : 'removing'} "${key}"`
      );
    } else {
      console.warn(`[StorageManager] Failed to ${action} "${key}":`, error);
    }
    this.onStorageError?.(error, key, action);
  }

  /**
   * Persist data to localStorage. Defensive: never throws — on failure it logs
   * a warning and invokes the optional `onStorageError` handler so callers can
   * surface a non-intrusive toast without breaking the state flow.
   */
  async save<T>(key: string, data: T, version?: string): Promise<void> {
    const serialized = JSON.stringify(data);
    let storedData: unknown = data;
    let encoding: StorageData<unknown>['encoding'] = 'plain';
    if (serialized.length >= this.compressionThresholdBytes) {
      const compressed = compressToUTF16(serialized);
      if (compressed.length < serialized.length) {
        storedData = compressed;
        encoding = 'lz-string';
      }
    }
    const entry: StorageData<unknown> = {
      data: storedData,
      savedAt: new Date().toISOString(),
      version: version ?? this.defaultVersion ?? '1.0.0',
      encoding,
    };
    safeSetItem(localStorage, this.key(key), JSON.stringify(entry), (error, k, action) =>
      this.handleError(error, k, action)
    );
  }

  loadEntry<T>(key: string, expectedVersion?: string): StorageLoadResult<T> {
    const raw = safeGetItem(localStorage, this.key(key), (error, k, action) =>
      this.handleError(error, k, action)
    );
    if (!raw) return { status: 'missing', data: null };
    try {
      const entry: StorageData<unknown> = JSON.parse(raw);
      if (expectedVersion && entry.version !== expectedVersion) {
        console.warn(
          `[StorageManager] Version mismatch for "${key}": expected ${expectedVersion}, got ${entry.version}`
        );
      }
      if (entry.encoding === 'lz-string') {
        if (typeof entry.data !== 'string') {
          return { status: 'corrupt', data: null };
        }
        const decompressed = decompressFromUTF16(entry.data);
        if (decompressed == null) {
          return { status: 'corrupt', data: null };
        }
        return { status: 'ok', data: JSON.parse(decompressed) as T };
      }
      return { status: 'ok', data: entry.data as T };
    } catch (error) {
      console.warn(`[StorageManager] Failed to load "${key}":`, error);
      return { status: 'corrupt', data: null };
    }
  }

  load<T>(key: string, expectedVersion?: string): T | null {
    return this.loadEntry<T>(key, expectedVersion).data;
  }

  remove(key: string): void {
    safeRemoveItem(localStorage, this.key(key), (error, k, action) =>
      this.handleError(error, k, action)
    );
  }
}

export const storageManager = new StorageManager();
