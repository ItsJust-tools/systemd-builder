import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  copyTextToClipboard,
  copyWithExecCommand,
  isClipboardApiAvailable,
  isSecureContext,
} from '../../src/utils/clipboard';

describe('clipboard utils', () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  const originalDocument = globalThis.document;

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore globals.
    Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true });
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', { value: originalDocument, configurable: true });
  });

  describe('isSecureContext', () => {
    it('returns false when window is undefined', () => {
      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
      expect(isSecureContext()).toBe(false);
    });

    it('uses window.isSecureContext when present', () => {
      Object.defineProperty(globalThis, 'window', {
        value: { isSecureContext: true, location: { protocol: 'https:', hostname: 'example.com' } },
        configurable: true,
      });
      expect(isSecureContext()).toBe(true);
    });

    it('treats HTTPS as secure when isSecureContext is absent', () => {
      Object.defineProperty(globalThis, 'window', {
        value: { location: { protocol: 'https:', hostname: 'example.com' } },
        configurable: true,
      });
      expect(isSecureContext()).toBe(true);
    });

    it('treats localhost as secure', () => {
      Object.defineProperty(globalThis, 'window', {
        value: { location: { protocol: 'http:', hostname: 'localhost' } },
        configurable: true,
      });
      expect(isSecureContext()).toBe(true);
    });

    it('treats plain HTTP as insecure', () => {
      Object.defineProperty(globalThis, 'window', {
        value: { location: { protocol: 'http:', hostname: 'example.com' } },
        configurable: true,
      });
      expect(isSecureContext()).toBe(false);
    });
  });

  describe('isClipboardApiAvailable', () => {
    it('returns false when navigator.clipboard is missing', () => {
      Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
      expect(isClipboardApiAvailable()).toBe(false);
    });

    it('returns true when writeText exists', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText: vi.fn() } },
        configurable: true,
      });
      expect(isClipboardApiAvailable()).toBe(true);
    });
  });

  describe('copyWithExecCommand', () => {
    it('returns false when document is undefined', () => {
      Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true });
      expect(copyWithExecCommand('text')).toBe(false);
    });

    it('uses execCommand copy via off-screen textarea', () => {
      const execSpy = vi.fn(() => true);
      const appendChild = vi.fn();
      const removeChild = vi.fn();
      const select = vi.fn();
      const setSelectionRange = vi.fn();
      const setAttribute = vi.fn();
      const style: Record<string, string> = {};

      Object.defineProperty(globalThis, 'document', {
        value: {
          createElement: vi.fn(() => ({
            value: '',
            setAttribute,
            select,
            setSelectionRange,
            style,
          })),
          execCommand: execSpy,
          body: { appendChild, removeChild },
          getSelection: vi.fn(() => ({ rangeCount: 0, removeAllRanges: vi.fn() })),
        },
        configurable: true,
      });

      expect(copyWithExecCommand('hello')).toBe(true);
      expect(execSpy).toHaveBeenCalledWith('copy');
      expect(appendChild).toHaveBeenCalledTimes(1);
      expect(removeChild).toHaveBeenCalledTimes(1);
      expect(select).toHaveBeenCalled();
      expect(setSelectionRange).toHaveBeenCalledWith(0, 5);
    });

    it('returns false when execCommand throws', () => {
      Object.defineProperty(globalThis, 'document', {
        value: {
          createElement: vi.fn(() => ({
            value: '',
            setAttribute: vi.fn(),
            select: vi.fn(),
            setSelectionRange: vi.fn(),
            style: {},
          })),
          execCommand: vi.fn(() => {
            throw new Error('denied');
          }),
          body: { appendChild: vi.fn(), removeChild: vi.fn() },
          getSelection: vi.fn(() => ({ rangeCount: 0, removeAllRanges: vi.fn() })),
        },
        configurable: true,
      });

      expect(copyWithExecCommand('hello')).toBe(false);
    });
  });

  describe('copyTextToClipboard', () => {
    it('uses the async Clipboard API in a secure context', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, 'window', {
        value: { isSecureContext: true, location: { protocol: 'https:', hostname: 'example.com' } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText } },
        configurable: true,
      });

      const result = await copyTextToClipboard('hello');
      expect(result).toEqual({ success: true, usedFallback: false });
      expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('falls back to execCommand when the Clipboard API rejects', async () => {
      const writeText = vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
      Object.defineProperty(globalThis, 'window', {
        value: { isSecureContext: true, location: { protocol: 'https:', hostname: 'example.com' } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: {
          createElement: vi.fn(() => ({
            value: '',
            setAttribute: vi.fn(),
            select: vi.fn(),
            setSelectionRange: vi.fn(),
            style: {},
          })),
          execCommand: vi.fn(() => true),
          body: { appendChild: vi.fn(), removeChild: vi.fn() },
          getSelection: vi.fn(() => ({ rangeCount: 0, removeAllRanges: vi.fn() })),
        },
        configurable: true,
      });

      const result = await copyTextToClipboard('hello');
      expect(result.success).toBe(true);
      expect(result.usedFallback).toBe(true);
    });

    it('uses execCommand fallback on insecure origins', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: { location: { protocol: 'http:', hostname: 'example.com' } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText: vi.fn() } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: {
          createElement: vi.fn(() => ({
            value: '',
            setAttribute: vi.fn(),
            select: vi.fn(),
            setSelectionRange: vi.fn(),
            style: {},
          })),
          execCommand: vi.fn(() => true),
          body: { appendChild: vi.fn(), removeChild: vi.fn() },
          getSelection: vi.fn(() => ({ rangeCount: 0, removeAllRanges: vi.fn() })),
        },
        configurable: true,
      });

      const result = await copyTextToClipboard('hello');
      expect(result.success).toBe(true);
      expect(result.usedFallback).toBe(true);
    });

    it('returns failure when both methods fail', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: { location: { protocol: 'http:', hostname: 'example.com' } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText: vi.fn() } },
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: {
          createElement: vi.fn(() => ({
            value: '',
            setAttribute: vi.fn(),
            select: vi.fn(),
            setSelectionRange: vi.fn(),
            style: {},
          })),
          execCommand: vi.fn(() => false),
          body: { appendChild: vi.fn(), removeChild: vi.fn() },
          getSelection: vi.fn(() => ({ rangeCount: 0, removeAllRanges: vi.fn() })),
        },
        configurable: true,
      });

      const result = await copyTextToClipboard('hello');
      expect(result.success).toBe(false);
      expect(result.usedFallback).toBe(true);
    });
  });
});
