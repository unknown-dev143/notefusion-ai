import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { screen } from '@testing-library/dom';

// Extend expect with axe
expect.extend(toHaveNoViolations);

type RenderWithAxeOptions = {
  includeUserRole?: boolean;
};

export const renderWithAxe = async (
  ui: React.ReactElement,
  options: RenderWithAxeOptions = {}
): Promise<RenderResult> => {
  const { includeUserRole = true, ...renderOptions } = options;
  const renderResult = render(ui, renderOptions);
  
  // Ensure the component is fully rendered
  await screen.findByRole('main', { hidden: true });
  
  return {
    ...renderResult,
    container: document.body
  };
};

export const testA11y = async (ui: React.ReactElement) => {
  const { container } = await renderWithAxe(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
