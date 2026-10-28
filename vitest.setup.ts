import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// DOM matchers (toHaveAttribute, toBeInTheDocument…) on Vitest's expect
import '@testing-library/jest-dom/vitest';

// Vitest doesn't expose globals, so Testing Library can't register its own cleanup
afterEach(() => {
  cleanup();
});
