// src/test-utils/setup.ts
import '@testing-library/jest-dom/vitest';
import '../../setupTests'; // registers jest→vi alias, ResizeObserver & matchMedia mocks
import '../mocks/mediaMocks'; // global media API mocks

// Simple i18n mock – returns the key itself
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));
