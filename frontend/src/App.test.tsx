import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NoteFusion AI app', () => {
  render(<App />);
  const headingElement = screen.getByText(/NoteFusion AI/i);
  expect(headingElement).toBeInTheDocument();
});
