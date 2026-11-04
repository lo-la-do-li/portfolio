const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Tokens are single-use and expire, so every submission must be verified server-side.
export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data: { success?: boolean } = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
