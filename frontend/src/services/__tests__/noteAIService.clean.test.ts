import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NoteAIService, AIRequestError } from '../noteAIService.clean';

describe('NoteAIService', () => {
  let service: NoteAIService;

  beforeEach(() => {
    service = new NoteAIService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await service.withRetry(mockFn);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue('success');

      const resultPromise = service.withRetry(mockFn, { maxRetries: 3 });
      
      // Fast-forward time for the first retry
      await vi.advanceTimersByTimeAsync(1500);
      
      const result = await resultPromise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should respect retry-after header', async () => {
      const error = new Error('Rate limited');
      (error as any).response = {
        status: 429,
        headers: { 'retry-after': '2' }
      };
      
      const mockFn = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const resultPromise = service.withRetry(mockFn);
      
      // Fast-forward time for the retry-after delay (2 seconds)
      await vi.advanceTimersByTimeAsync(2500);
      
      const result = await resultPromise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry client errors (4xx)', async () => {
      const error = new AIRequestError('Not found', 404);
      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(service.withRetry(mockFn)).rejects.toThrow('Not found');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect abort signal', async () => {
      const controller = new AbortController();
      const mockFn = vi.fn().mockRejectedValue(new Error('Temporary error'));

      const resultPromise = service.withRetry(mockFn, { 
        signal: controller.signal 
      });

      // Abort while waiting for the next retry
      controller.abort();
      
      const expectPromise = expect(resultPromise).rejects.toThrow('Request was aborted');
      
      // Advance timers to trigger the next retry attempt
      await vi.advanceTimersByTimeAsync(1500);
      
      await expectPromise;
    });
  });
});
