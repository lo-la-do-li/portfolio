'use server';

import { Resend } from 'resend';
import { validateContact, type ContactErrors, type ContactFields } from './lib/validate';

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message?: string; errors?: ContactErrors; values: ContactFields };

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

export async function sendContact(_prev: ContactState, data: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field. Pretend success to bots.
  if (text(data, 'website')) return { status: 'success' };

  const values = {
    name: text(data, 'name').trim(),
    email: text(data, 'email').trim(),
    message: text(data, 'message').trim(),
  };

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) return { status: 'error', errors, values };

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error('Contact form is missing Resend environment variables.');
    return { status: 'error', message: 'Something went wrong. Please email me directly.', values };
  }

  try {
    const { error } = await new Resend(RESEND_API_KEY).emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: values.email,
      subject: `Portfolio message from ${values.name.replace(/[\r\n]+/g, ' ')}`,
      text: `From: ${values.name} <${values.email}>\n\n${values.message}`,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Contact form send failed:', err);
    return {
      status: 'error',
      message: 'Your message could not be sent. Please try again or email me directly.',
      values,
    };
  }

  return { status: 'success' };
}
