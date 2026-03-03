import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'skip', 'included')).toBe('base included');
  });

  it('deduplicates conflicting tailwind classes (last wins)', () => {
    // tailwind-merge resolves conflicts: p-4 wins over p-2
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null', () => {
    expect(cn(undefined, null, 'valid')).toBe('valid');
  });

  it('merges array inputs', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
});
