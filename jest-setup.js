// Basic Jest setup for React Native testing
global.__DEV__ = true;

// Mock console methods to reduce noise in tests
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Mock react-native modules
jest.mock('react-native', () => {
  const React = require('react');

  // Create simple mock components for testing
  const View = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }));
  const Text = React.forwardRef((props, ref) => React.createElement('span', { ...props, ref }));
  const TouchableOpacity = React.forwardRef(({ onPress, ...props }, ref) =>
    React.createElement('div', { ...props, onClick: onPress, ref }));

  return {
    Platform: {
      OS: 'web',
      select: jest.fn(config => config.web || config.default || config.ios),
    },
    useColorScheme: jest.fn(() => 'light'),
    View,
    Text,
    TouchableOpacity,
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.filter(Boolean));
        }
        return style || {};
      }),
    },
    Animated: {
      View,
      createAnimatedComponent: jest.fn(),
      timing: jest.fn(),
      spring: jest.fn(),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    },
  };
});

jest.mock('expo-symbols', () => ({
  SymbolView: 'SymbolView',
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('react-native-gesture-handler', () => {
  const View = 'View';
  return {
    TouchableOpacity: 'TouchableOpacity',
    GestureHandlerRootView: View,
  };
});