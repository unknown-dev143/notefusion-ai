import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const SimpleComponent = () => <div>Test Component</div>;

test('renders simple component', () => {
  render(<SimpleComponent />);
  expect(screen.getByText('Test Component')).toBeInTheDocument();
});
