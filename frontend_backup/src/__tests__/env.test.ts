import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

describe('Environment Test', () => {
  it('runs a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('can render a simple component', () => {
    const { container } = render(<div>Test Component</div>);
    expect(container.textContent).toContain('Test Component');
  });

  it('has access to the DOM', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello, DOM!';
    document.body.appendChild(div);
    expect(document.body.textContent).toContain('Hello, DOM!');
  });
});
