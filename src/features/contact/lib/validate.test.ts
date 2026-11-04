import { describe, expect, it } from 'vitest';
import { LIMITS, validateContact } from './validate';

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello, I would like to talk.' };

describe('validateContact', () => {
  it('accepts valid input', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('requires every field, ignoring whitespace', () => {
    expect(Object.keys(validateContact({ name: ' ', email: '', message: '   ' }))).toEqual([
      'name',
      'email',
      'message',
    ]);
  });

  it('rejects malformed emails', () => {
    expect(validateContact({ ...valid, email: 'not-an-email' }).email).toBeDefined();
  });

  it('rejects too-short and too-long messages', () => {
    expect(validateContact({ ...valid, message: 'hi' }).message).toBeDefined();
    expect(
      validateContact({ ...valid, message: 'a'.repeat(LIMITS.message + 1) }).message
    ).toBeDefined();
  });
});
