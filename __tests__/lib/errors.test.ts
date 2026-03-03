import { describe, it, expect } from 'vitest';
import { AppError, toAppError } from '@/lib/errors';

describe('AppError', () => {
  it('sets message and status', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
  });

  it('sets name to AppError', () => {
    const err = new AppError('oops', 500);
    expect(err.name).toBe('AppError');
  });

  it('is instance of Error', () => {
    const err = new AppError('oops', 500);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('toAppError', () => {
  it('returns AppError as-is', () => {
    const original = new AppError('conflict', 409);
    const result = toAppError(original);
    expect(result).toBe(original);
  });

  it('wraps plain Error with status 500', () => {
    const err = new Error('something broke');
    const result = toAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('something broke');
    expect(result.status).toBe(500);
  });

  it('converts string to AppError with status 500', () => {
    const result = toAppError('some string error');
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('some string error');
    expect(result.status).toBe(500);
  });

  it('converts unknown object to AppError via String()', () => {
    const result = toAppError({ code: 42 });
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('[object Object]');
    expect(result.status).toBe(500);
  });

  it('converts null to AppError', () => {
    const result = toAppError(null);
    expect(result.message).toBe('null');
    expect(result.status).toBe(500);
  });
});
