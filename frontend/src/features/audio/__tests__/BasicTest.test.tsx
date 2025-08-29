import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Basic Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render a simple component', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toHaveTextContent('Hello World');
  });
});
