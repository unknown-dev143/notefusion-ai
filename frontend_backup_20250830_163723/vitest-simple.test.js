import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple test component
const HelloWorld = () => <div>Hello, Vitest!</div>;

test('renders hello world', () => {
  render(<HelloWorld />);
  const element = screen.getByText('Hello, Vitest!');
  expect(element).toBeInTheDocument();
});

test('simple assertion', () => {
  expect(1 + 1).toBe(2);
});
