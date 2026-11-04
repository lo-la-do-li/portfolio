'use client';

import { useActionState } from 'react';
import { buttonClass } from '@/components/buttonClass';
import { sendContact, type ContactState } from '../actions';
import { LIMITS } from '../lib/validate';

const initial: ContactState = { status: 'idle' };

const fieldClass =
  'mt-2 block w-full border border-rule bg-transparent px-3 py-2 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-accent';
const labelClass = 'font-mono text-xs uppercase tracking-[0.14em] text-fg';

export default function ContactForm({
  action = sendContact,
}: {
  action?: (prev: ContactState, data: FormData) => Promise<ContactState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  if (state.status === 'success') {
    return (
      <p role="status" className="max-w-prose text-lg text-fg">
        Thanks — your message is on its way. I’ll reply by email soon.
      </p>
    );
  }

  const errors = state.status === 'error' ? (state.errors ?? {}) : {};
  const values = state.status === 'error' ? state.values : { name: '', email: '', message: '' };

  return (
    <form action={formAction} noValidate className="max-w-prose space-y-5">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={LIMITS.name}
          defaultValue={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={fieldClass}
        />
        {errors.name && (
          <p id="contact-name-error" className="mt-1 text-sm text-accent">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={LIMITS.email}
          defaultValue={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={fieldClass}
        />
        {errors.email && (
          <p id="contact-email-error" className="mt-1 text-sm text-accent">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={LIMITS.message}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={fieldClass}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-sm text-accent">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div role="alert" className="min-h-6 text-sm text-accent">
        {state.status === 'error' ? state.message : null}
      </div>

      <button type="submit" disabled={pending} className={`${buttonClass} disabled:opacity-60`}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
