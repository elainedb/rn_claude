// Basic Jest setup for React Native testing
global.__DEV__ = true;

// Mock console methods to reduce noise in tests
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(config => config.ios || config.default),
}));