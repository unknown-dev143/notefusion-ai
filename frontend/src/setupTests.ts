import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Alias jest to vi for compatibility in test files
const jestMock = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
  useFakeTimers: () => vi.useFakeTimers(),
  useRealTimers: () => vi.useRealTimers(),
  advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
  clearAllTimers: () => vi.clearAllTimers(),
};
(globalThis as any).jest = jestMock;

// Native Vitest axios mock
vi.mock('axios', async (importOriginal) => {
  const actualAxios = await importOriginal<any>();
  const mockInstance = {
    ...actualAxios.default,
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({
      data: { text: 'Mocked transcription text' }
    }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    ...actualAxios,
    default: {
      ...mockInstance,
      create: vi.fn(() => mockInstance),
    },
  };
});

// Native Vitest antd mock
vi.mock('antd', async (importOriginal) => {
  const actualAntd = await importOriginal<any>();
  const mockMessage = {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  return {
    ...actualAntd,
    message: mockMessage,
  };
});

// Mock ResizeObserver for Ant Design components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
