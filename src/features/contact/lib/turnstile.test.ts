import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

afterEach(() => vi.unstubAllGlobals());

const stubFetch = (impl: () => Promise<unknown>) => vi.stubGlobal('fetch', vi.fn(impl));

describe('verifyTurnstile', () => {
  it('rejects an empty token without calling Cloudflare', async () => {
    stubFetch(() => Promise.reject(new Error('should not be called')));
    expect(await verifyTurnstile('', 'secret')).toBe(false);
  });

  it('accepts a token Cloudflare approves', async () => {
    stubFetch(async () => ({ ok: true, json: async () => ({ success: true }) }));
    expect(await verifyTurnstile('token', 'secret')).toBe(true);
  });

  it('rejects a token Cloudflare refuses', async () => {
    stubFetch(async () => ({ ok: true, json: async () => ({ success: false }) }));
    expect(await verifyTurnstile('token', 'secret')).toBe(false);
  });

  it('fails closed when the request errors', async () => {
    stubFetch(() => Promise.reject(new Error('network')));
    expect(await verifyTurnstile('token', 'secret')).toBe(false);
  });
});
