import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from './error';

afterEach(() => {
  vi.restoreAllMocks();
});

// Errors thrown in Server Components reach the browser like this: a generic
// message plus a digest that matches the server logs
function serverError() {
  return Object.assign(new Error('An error occurred in the Server Components render.'), {
    digest: '1234567890',
  });
}

describe('ErrorPage', () => {
  it('explains what happened and logs the error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = serverError();
    render(<ErrorPage error={error} retry={() => {}} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Something went wrong' })
    ).toBeInTheDocument();
    expect(screen.getByText('Reference: 1234567890')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('leaves out the reference when there is no digest', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorPage error={new Error('Client render failed')} retry={() => {}} />);

    expect(screen.queryByText(/Reference:/)).not.toBeInTheDocument();
  });

  it('retries when asked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const retry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={serverError()} retry={retry} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledOnce();
  });
});
