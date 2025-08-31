// Simple Vitest test file
import { test, expect } from 'vitest';

test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('object equality', () => {
  const obj = { a: 1 };
  obj.b = 2;
  expect(obj).toEqual({ a: 1, b: 2 });
});

test('async test', async () => {
  const result = await Promise.resolve('test');
  expect(result).toBe('test');
});
