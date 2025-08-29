import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple test component
const HelloWorld = () => <div>Hello, World!</div>;

test('renders hello world', () => {
  render(<HelloWorld />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});

test('simple assertion', () => {
  expect(1 + 1).toBe(2);
});
