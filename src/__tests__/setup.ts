// Jest setup file
// Global test utilities and configurations

// Mock fetch for tests
global.fetch = jest.fn();

// Mock environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Suppress console in tests (set to false for debugging)
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});
