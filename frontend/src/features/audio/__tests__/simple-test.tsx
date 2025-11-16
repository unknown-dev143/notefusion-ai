import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

test('simple test', () => {
  render(<div>Test</div>);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
