import { test, expect } from 'vitest';

test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('simple component test', () => {
  const element = document.createElement('div');
  element.textContent = 'Hello';
  document.body.appendChild(element);
  
  expect(element).toHaveTextContent('Hello');
});
