import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ContactForm from './ContactForm';

vi.mock('../actions', () => ({ sendContact: vi.fn() }));

describe('ContactForm', () => {
  it('shows field errors returned by the action and keeps the values', async () => {
    const action = vi.fn().mockResolvedValue({
      status: 'error',
      errors: { email: 'Please enter a valid email address.' },
      values: { name: 'Ada', email: 'nope', message: 'A long enough message.' },
    });
    render(<ContactForm action={action} />);

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    const email = await screen.findByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });

  it('shows a confirmation on success', async () => {
    const action = vi.fn().mockResolvedValue({ status: 'success' });
    render(<ContactForm action={action} />);

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('status')).toHaveTextContent(/your message is on its way/i);
  });
});
