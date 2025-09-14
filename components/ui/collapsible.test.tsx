import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Collapsible } from './collapsible';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock dependencies
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, ...props }: any) => (
    <Text {...props} testID="themed-text">{children}</Text>
  ),
}));

jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, ...props }: any) => (
      <View {...props} testID="themed-view">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/icon-symbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: (props: any) => (
      <View
        testID="icon-symbol"
        accessibilityLabel={`icon-${props.name}-${props.size}-${props.weight}-${props.color}`}
        style={props.style}
      />
    ),
  };
});

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('Collapsible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should render with title', () => {
      const { getByText } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render icon with correct props', () => {
      const { getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const icon = getByTestId('icon-symbol');
      expect(icon.props.accessibilityLabel).toContain('chevron.right');
      expect(icon.props.accessibilityLabel).toContain('18');
      expect(icon.props.accessibilityLabel).toContain('medium');
    });

    it('should not render content when initially closed', () => {
      const { queryByText } = render(
        <Collapsible title="Test Title">
          <Text>Hidden Content</Text>
        </Collapsible>
      );

      expect(queryByText('Hidden Content')).toBeNull();
    });

    it('should render multiple children', () => {
      const { queryByText } = render(
        <Collapsible title="Test Title">
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </Collapsible>
      );

      // Should not be visible initially
      expect(queryByText('Child 1')).toBeNull();
      expect(queryByText('Child 2')).toBeNull();
    });
  });

  describe('interaction', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should toggle content visibility when pressed', () => {
      const { getByText, queryByText } = render(
        <Collapsible title="Test Title">
          <Text>Toggle Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;

      // Initially closed
      expect(queryByText('Toggle Content')).toBeNull();

      // Open
      fireEvent.press(touchable);
      expect(getByText('Toggle Content')).toBeTruthy();

      // Close
      fireEvent.press(touchable);
      expect(queryByText('Toggle Content')).toBeNull();
    });

    it('should rotate icon when toggled', () => {
      const { getByText, getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;
      const icon = getByTestId('icon-symbol');

      // Initially closed - 0 degrees
      expect(icon.props.style.transform[0].rotate).toBe('0deg');

      // Open - 90 degrees
      fireEvent.press(touchable);
      expect(icon.props.style.transform[0].rotate).toBe('90deg');

      // Close - 0 degrees
      fireEvent.press(touchable);
      expect(icon.props.style.transform[0].rotate).toBe('0deg');
    });

    it('should handle multiple rapid toggles', () => {
      const { getByText, queryByText } = render(
        <Collapsible title="Test Title">
          <Text>Rapid Toggle Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;

      // Multiple rapid toggles
      fireEvent.press(touchable); // open
      fireEvent.press(touchable); // close
      fireEvent.press(touchable); // open
      fireEvent.press(touchable); // close

      expect(queryByText('Rapid Toggle Content')).toBeNull();

      fireEvent.press(touchable); // open
      expect(getByText('Rapid Toggle Content')).toBeTruthy();
    });
  });

  describe('theming', () => {
    it('should use light theme icon color', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const icon = getByTestId('icon-symbol');
      expect(icon.props.accessibilityLabel).toContain('#687076'); // Colors.light.icon
    });

    it('should use dark theme icon color', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const icon = getByTestId('icon-symbol');
      expect(icon.props.accessibilityLabel).toContain('#9BA1A6'); // Colors.dark.icon
    });

    it('should fallback to light theme when color scheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const icon = getByTestId('icon-symbol');
      expect(icon.props.accessibilityLabel).toContain('#687076'); // Colors.light.icon
    });

    it('should fallback to light theme when color scheme is undefined', () => {
      mockUseColorScheme.mockReturnValue(undefined);

      const { getByTestId } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const icon = getByTestId('icon-symbol');
      expect(icon.props.accessibilityLabel).toContain('#687076'); // Colors.light.icon
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should have activeOpacity for visual feedback', () => {
      const { getByText } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;
      expect(touchable?.props.activeOpacity).toBe(0.8);
    });

    it('should be pressable for keyboard/screen reader access', () => {
      const { getByText } = render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;
      expect(touchable?.props.onPress).toBeDefined();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should handle empty children', () => {
      const { getByText } = render(
        <Collapsible title="Test Title">
          {null}
        </Collapsible>
      );

      const touchable = getByText('Test Title').parent?.parent;
      fireEvent.press(touchable);

      // Should not crash with null children
      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines or cause layout issues';

      const { getByText } = render(
        <Collapsible title={longTitle}>
          <Text>Content</Text>
        </Collapsible>
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with 🎉 emojis & special chars!';

      const { getByText } = render(
        <Collapsible title={specialTitle}>
          <Text>Content</Text>
        </Collapsible>
      );

      expect(getByText(specialTitle)).toBeTruthy();
    });
  });
});