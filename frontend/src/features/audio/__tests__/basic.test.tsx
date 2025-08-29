import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

test('basic test', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
