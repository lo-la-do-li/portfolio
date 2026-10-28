import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { THEME_STORAGE_KEY } from '../constants';
import ThemeToggle from './ThemeToggle';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('starts on Night by default', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Night', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Day', pressed: false })).toBeInTheDocument();
  });

  it('switches to Day and remembers the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Day' }));

    // The pressed state follows <html data-theme> through a MutationObserver
    expect(await screen.findByRole('button', { name: 'Day', pressed: true })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('reflects a theme applied before it rendered', () => {
    // As the pre-paint script does for a returning visitor
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Day', pressed: true })).toBeInTheDocument();
  });
});
