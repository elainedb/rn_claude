// Basic Jest setup for React Native testing
global.__DEV__ = true;

// Mock console methods to reduce noise in tests
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Mock react-native modules
jest.mock('react-native', () => {
  const React = require('react');

  // Create mock components that preserve testID and other props
  const View = React.forwardRef(({ testID, style, children, ...props }, ref) => {
    // Create mock component with preserved props for testing
    const element = React.createElement('div', {
      ref,
      'data-testid': testID,
      testID,
      style: Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
      ...props
    }, children);

    // Preserve original style for test assertions
    element.props = { ...element.props, style };
    return element;
  });

  const Text = React.forwardRef(({ testID, style, children, ...props }, ref) => {
    const element = React.createElement('div', {
      ref,
      'data-testid': testID,
      testID,
      style: Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
      ...props
    }, children);

    element.props = { ...element.props, style };
    return element;
  });

  const TouchableOpacity = React.forwardRef(({ testID, style, children, onPress, ...props }, ref) => {
    const element = React.createElement('div', {
      ref,
      'data-testid': testID,
      testID,
      style: Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
      onClick: onPress,
      ...props
    }, children);

    element.props = { ...element.props, style, onPress };
    return element;
  });

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