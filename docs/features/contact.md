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

A hidden honeypot field catches simple bots. If spam gets through, add rate limiting or
Cloudflare Turnstile.
