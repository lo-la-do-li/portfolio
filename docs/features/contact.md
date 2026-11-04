# Contact form

A form in the contact section that emails me through [Resend](https://resend.com), using a
Server Action. The `mailto:` link stays below it as a fallback.

## Pieces

- `features/contact/lib/validate.ts` — field validation, run on the server (the browser's
  own checks are bypassed with `noValidate` so messages are consistent).
- `features/contact/actions.ts` — `sendContact` Server Action: honeypot check, validation,
  then `resend.emails.send`. Returns a typed `ContactState`; on error it returns the
  submitted values so the form doesn't clear.
- `features/contact/components/ContactForm.tsx` — `useActionState` form with inline errors
  (`aria-invalid` + `aria-describedby`), a pending state, and `role="status"` / `role="alert"`
  regions.

## Setup

Copy `.env.example` to `.env.local` and set, locally and in Vercel:

| Variable             | Meaning                                                   |
| -------------------- | --------------------------------------------------------- |
| `RESEND_API_KEY`     | API key from the Resend dashboard                         |
| `CONTACT_TO_EMAIL`   | Inbox that receives messages                              |
| `CONTACT_FROM_EMAIL` | Sender on a domain verified in Resend, e.g. `Site <hi@…>` |

Without a verified domain, Resend only sends from `onboarding@resend.dev` to your own
account email, which is fine for testing.

## Spam

Two layers:

- A hidden honeypot field catches simple bots.
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) is rendered by
  `TurnstileWidget` and its token is verified server-side in `lib/turnstile.ts` before
  anything is sent. Tokens are single-use, so the widget resets after every submission. The
  action fails closed: missing keys or a failed check means no email.

Create a widget in the Cloudflare dashboard (Turnstile → Add widget, with
`loladolinsky.com` as a hostname) and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
`TURNSTILE_SECRET_KEY`. For local development use Cloudflare's
[test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), listed in
`.env.example`.
