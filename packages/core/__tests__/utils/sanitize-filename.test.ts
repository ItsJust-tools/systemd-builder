import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../src/utils/sanitize-filename';

describe('sanitizeFilename', () => {
  it('replaces invalid OS characters with dashes', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('a-b-c-d-e-f-g-h-i-j');
  });

  it('replaces percent sign', () => {
    expect(sanitizeFilename('100% done')).toBe('100- done');
  });

  it('strips control characters', () => {
    expect(sanitizeFilename('file\u0000name\u001f')).toBe('filename');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeFilename('  my file  ')).toBe('my file');
  });

  it('removes leading dots to avoid hidden files', () => {
    expect(sanitizeFilename('..hidden')).toBe('hidden');
  });

  it('enforces a max length of 100 characters', () => {
    const long = 'x'.repeat(150);
    expect(sanitizeFilename(long)).toHaveLength(100);
  });

  it('returns fallback for empty or invalid input', () => {
    expect(sanitizeFilename('')).toBe('export');
    expect(sanitizeFilename('   ')).toBe('export');
    expect(sanitizeFilename('...')).toBe('export');
    // @ts-expect-error testing non-string input
    expect(sanitizeFilename(null)).toBe('export');
    // @ts-expect-error testing non-string input
    expect(sanitizeFilename(undefined)).toBe('export');
  });

  it('uses custom fallback when provided', () => {
    expect(sanitizeFilename('', 'unit')).toBe('unit');
  });

  it('preserves valid filenames unchanged', () => {
    expect(sanitizeFilename('my-app.service')).toBe('my-app.service');
  });
});
