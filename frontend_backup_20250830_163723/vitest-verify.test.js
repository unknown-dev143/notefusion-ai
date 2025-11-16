import { test, expect } from 'vitest';

test('1 + 1 equals 2', () => {
  console.log('Running test: 1 + 1 equals 2');
  expect(1 + 1).toBe(2);
  console.log('Test passed!');
});

test('simple object test', () => {
  const obj = { a: 1 };
  obj.b = 2;
  expect(obj).toEqual({ a: 1, b: 2 });
});
