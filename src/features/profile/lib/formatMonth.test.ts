import { describe, expect, it } from 'vitest';
import { formatMonth } from './formatMonth';

describe('formatMonth', () => {
  it('formats an ISO month as a short month and year', () => {
    expect(formatMonth('2024-04')).toBe('Apr 2024');
    expect(formatMonth('2021-10')).toBe('Oct 2021');
  });

  // Runs in America/Denver (vitest.config.mts). Without the UTC pin, the first
  // of the month would format as the month before.
  it('is not shifted by the local timezone', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Denver');
    expect(formatMonth('2024-01')).toBe('Jan 2024');
  });
});
