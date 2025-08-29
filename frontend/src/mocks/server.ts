import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
export const handlers = [
  // Add your API request handlers here
  // Example:
  // rest.get('/api/endpoint', (req, res, ctx) => {
  //   return res(ctx.json({ data: 'mocked data' }));
  // }),
];

export const server = setupServer(...handlers);
