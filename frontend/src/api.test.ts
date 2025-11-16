// @ts-ignore - MSW types are not needed for the test to run
import { rest } from 'msw';
// @ts-ignore - MSW types are not needed for the test to run
import { setupServer } from 'msw/node';
import { authApi, notesApi } from './api';

// Mock WebSocket for testing
const mockWebSocket = {
  onopen: () => {},
  onmessage: () => {},
  onerror: () => {},
  onclose: () => {},
  send: jest.fn(),
  close: jest.fn()
};

// Mock the global WebSocket
// @ts-ignore - Mocking WebSocket for testing
global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);

// Test configuration
const API_URL = 'http://localhost:8000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';
const TEST_TOKEN = 'test-jwt-token';
const TEST_USER = {
  id: 'user-123',
  email: TEST_EMAIL,
  full_name: 'Test User',
  is_active: true
};
const TEST_NOTE = {
  id: 'note-123',
  title: 'Test Note',
  content: 'This is a test note for API testing',
  user_id: TEST_USER.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Setup mock server
const handlers = [
  // Login
  rest.post(`${API_URL}/auth/login`, (req: any, res: any, ctx: any) => {
    const { email, password } = req.body as { email: string; password: string };
    
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      return res(
        ctx.json({
          access_token: TEST_TOKEN,
          token_type: 'bearer'
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Incorrect email or password' })
    );
  }),
  
  // Get current user
  rest.get(`${API_URL}/users/me`, (req: any, res: any, ctx: any) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader === `Bearer ${TEST_TOKEN}`) {
      return res(ctx.json(TEST_USER));
    }
    return res(ctx.status(401));
  }),
  
  // Create note
  rest.post(`${API_URL}/notes`, (req: any, res: any, ctx: any) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${TEST_TOKEN}`) {
      return res(ctx.status(401));
    }
    return res(ctx.json(TEST_NOTE));
  }),
  
  // Get note by ID
  rest.get(`${API_URL}/notes/:id`, (req: any, res: any, ctx: any) => {
    const { id } = req.params;
    if (id === TEST_NOTE.id) {
      return res(ctx.json(TEST_NOTE));
    }
    return res(ctx.status(404));
  }),
  
  // Delete note
  rest.delete(`${API_URL}/notes/:id`, (req: any, res: any, ctx: any) => {
    const { id } = req.params;
    if (id === TEST_NOTE.id) {
      return res(ctx.status(204));
    }
    return res(ctx.status(404));
  })
];

const server = setupServer(...handlers);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

describe('API Client Tests', () => {
  let authToken: string | null = null;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should connect to WebSocket', () => {
    // Import the WebSocket function directly from the api module
    const { connectWebSocket } = require('./api');
    
    // Mock WebSocket callbacks
    const onMessage = jest.fn();
    
    // Call the connectWebSocket function
    const ws = connectWebSocket(onMessage);
    
    // Simulate WebSocket open event
    // @ts-ignore - Mocking WebSocket for testing
    ws.onopen();
    
    // Verify WebSocket was created with the correct URL
    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/ws');
    
    // Simulate receiving a message
    const testMessage = { type: 'test', data: 'Hello WebSocket' };
    // @ts-ignore - Mocking WebSocket for testing
    ws.onmessage({ data: JSON.stringify(testMessage) });
    
    // Verify the message handler was called with the correct data
    expect(onMessage).toHaveBeenCalledWith(testMessage);
    
    // Test sending a message
    const sendData = { type: 'ping', message: 'test' };
    ws.send(JSON.stringify(sendData));
    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(sendData));
    
    // Test closing the connection
    ws.close();
    expect(mockWebSocket.close).toHaveBeenCalled();
  }, 10000);

  test('should login successfully', async () => {
    const response = await authApi.login({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    expect(response).toHaveProperty('access_token');
    expect(response.token_type).toBe('bearer');
    authToken = response.access_token;
  });

  test('should get current user', async () => {
    // Set the auth token for this test
    authToken = TEST_TOKEN;
    
    const user = await authApi.getCurrentUser();
    expect(user).toHaveProperty('id', TEST_USER.id);
    expect(user.email).toBe(TEST_EMAIL);
    expect(user.full_name).toBe(TEST_USER.full_name);
  });

  test('should create a new note', async () => {
    const note = await notesApi.createNote({
      title: TEST_NOTE.title,
      content: TEST_NOTE.content
    });
    
    expect(note).toHaveProperty('id', TEST_NOTE.id);
    expect(note.title).toBe(TEST_NOTE.title);
    expect(note.content).toBe(TEST_NOTE.content);
  });

  test('should get a note by ID', async () => {
    const note = await notesApi.getNoteById(TEST_NOTE.id);
    expect(note).toBeDefined();
    expect(note.id).toBe(TEST_NOTE.id);
    expect(note.title).toBe(TEST_NOTE.title);
  });

  test('should delete a note', async () => {
    await expect(notesApi.deleteNote(TEST_NOTE.id)).resolves.not.toThrow();
  });
  
  test('should handle API errors', async () => {
    // Test with invalid credentials
    await expect(
      authApi.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
    ).rejects.toThrow();
    
    // Test getting a non-existent note
    await expect(notesApi.getNoteById('non-existent-id')).rejects.toThrow();
  });
});
