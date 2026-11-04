export type ContactFields = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

export const LIMITS = { name: 100, email: 254, message: 5000, messageMin: 10 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared by the form (via the action's response) and the server action itself.
export function validateContact(input: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > LIMITS.name)
    errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!email) errors.email = 'Please enter your email.';
  else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email))
    errors.email = 'Please enter a valid email address.';

  if (message.length < LIMITS.messageMin)
    errors.message = `Please write at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.message)
    errors.message = `Keep your message under ${LIMITS.message} characters.`;

  return errors;
}
