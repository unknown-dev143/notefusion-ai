import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Simple Test', () => {
  it('renders a basic component', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toHaveTextContent('Hello World');
  });

  it('performs a simple calculation', () => {
    expect(1 + 1).toBe(2);
  });
});
