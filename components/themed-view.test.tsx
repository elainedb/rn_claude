import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(),
}));

const mockUseThemeColor = useThemeColor as jest.MockedFunction<typeof useThemeColor>;

describe('ThemedView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemeColor.mockReturnValue('#ffffff'); // Default mock background color
  });

  describe('rendering', () => {
    it('should render a View component', () => {
      const { getByTestId } = render(
        <ThemedView testID="themed-view">
          <Text>Child content</Text>
        </ThemedView>
      );

      expect(getByTestId('themed-view')).toBeTruthy();
    });

    it('should render children correctly', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>Test Child</Text>
        </ThemedView>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });

    it('should pass correct props to useThemeColor', () => {
      render(
        <ThemedView lightColor="#light-bg" darkColor="#dark-bg">
          <Text>Content</Text>
        </ThemedView>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#light-bg', dark: '#dark-bg' },
        'background'
      );
    });

    it('should use theme color when no custom colors provided', () => {
      render(
        <ThemedView>
          <Text>Content</Text>
        </ThemedView>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: undefined, dark: undefined },
        'background'
      );
    });

    it('should apply the returned theme background color', () => {
      mockUseThemeColor.mockReturnValue('#ff0000');

      const { getByTestId } = render(
        <ThemedView testID="colored-view">
          <Text>Colored View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('colored-view');
      expect(viewElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#ff0000' })
        ])
      );
    });
  });

  describe('style composition', () => {
    it('should merge custom styles with theme background color', () => {
      mockUseThemeColor.mockReturnValue('#theme-bg');
      const customStyle = { padding: 20, margin: 10 };

      const { getByTestId } = render(
        <ThemedView testID="styled-view" style={customStyle}>
          <Text>Styled View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('styled-view');
      expect(viewElement.props.style).toEqual([
        { backgroundColor: '#theme-bg' },
        customStyle
      ]);
    });

    it('should allow custom backgroundColor to override theme color', () => {
      mockUseThemeColor.mockReturnValue('#theme-bg');
      const customStyle = { backgroundColor: '#custom-bg', padding: 10 };

      const { getByTestId } = render(
        <ThemedView testID="override-view" style={customStyle}>
          <Text>Override View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('override-view');
      expect(viewElement.props.style).toEqual([
        { backgroundColor: '#theme-bg' },
        customStyle
      ]);

      // Custom backgroundColor should be last in the array, so it overrides
      expect(customStyle.backgroundColor).toBe('#custom-bg');
    });

    it('should handle array of styles', () => {
      mockUseThemeColor.mockReturnValue('#theme-bg');
      const styles = [{ padding: 5 }, { margin: 10 }];

      const { getByTestId } = render(
        <ThemedView testID="array-styled-view" style={styles}>
          <Text>Array Styled View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('array-styled-view');
      expect(viewElement.props.style).toEqual([
        { backgroundColor: '#theme-bg' },
        styles
      ]);
    });

    it('should handle null style', () => {
      mockUseThemeColor.mockReturnValue('#theme-bg');

      const { getByTestId } = render(
        <ThemedView testID="null-style-view" style={null}>
          <Text>Null Style View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('null-style-view');
      expect(viewElement.props.style).toEqual([
        { backgroundColor: '#theme-bg' },
        null
      ]);
    });

    it('should handle undefined style', () => {
      mockUseThemeColor.mockReturnValue('#theme-bg');

      const { getByTestId } = render(
        <ThemedView testID="undefined-style-view" style={undefined}>
          <Text>Undefined Style View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('undefined-style-view');
      expect(viewElement.props.style).toEqual([
        { backgroundColor: '#theme-bg' },
        undefined
      ]);
    });
  });

  describe('prop forwarding', () => {
    it('should forward View props to underlying View component', () => {
      const viewProps = {
        accessible: true,
        accessibilityLabel: 'Test view',
        testID: 'forwarded-props-view',
        onLayout: jest.fn(),
      };

      const { getByTestId } = render(
        <ThemedView {...viewProps}>
          <Text>Forwarded Props View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('forwarded-props-view');
      expect(viewElement.props.accessible).toBe(true);
      expect(viewElement.props.accessibilityLabel).toBe('Test view');
      expect(viewElement.props.onLayout).toBeDefined();
    });

    it('should not forward theme-specific props to View component', () => {
      const { getByTestId } = render(
        <ThemedView
          testID="theme-props-view"
          lightColor="#light"
          darkColor="#dark"
        >
          <Text>Theme Props View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('theme-props-view');
      expect(viewElement.props.lightColor).toBeUndefined();
      expect(viewElement.props.darkColor).toBeUndefined();
    });

    it('should spread otherProps correctly', () => {
      const customProps = {
        testID: 'spread-props-view',
        onTouchStart: jest.fn(),
        pointerEvents: 'box-none' as const,
      };

      const { getByTestId } = render(
        <ThemedView {...customProps}>
          <Text>Spread Props View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('spread-props-view');
      expect(viewElement.props.onTouchStart).toBeDefined();
      expect(viewElement.props.pointerEvents).toBe('box-none');
    });
  });

  describe('children handling', () => {
    it('should render single child', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>Single Child</Text>
        </ThemedView>
      );

      expect(getByText('Single Child')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </ThemedView>
      );

      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
    });

    it('should handle nested ThemedViews', () => {
      const { getByText } = render(
        <ThemedView>
          <ThemedView>
            <Text>Nested Content</Text>
          </ThemedView>
        </ThemedView>
      );

      expect(getByText('Nested Content')).toBeTruthy();
    });

    it('should handle null children', () => {
      const { getByTestId } = render(
        <ThemedView testID="null-children-view">
          {null}
        </ThemedView>
      );

      expect(getByTestId('null-children-view')).toBeTruthy();
    });

    it('should handle undefined children', () => {
      const { getByTestId } = render(
        <ThemedView testID="undefined-children-view">
          {undefined}
        </ThemedView>
      );

      expect(getByTestId('undefined-children-view')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined theme color', () => {
      mockUseThemeColor.mockReturnValue(undefined as any);

      const { getByTestId } = render(
        <ThemedView testID="undefined-color-view">
          <Text>Undefined Color View</Text>
        </ThemedView>
      );

      const viewElement = getByTestId('undefined-color-view');
      expect(viewElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: undefined })
        ])
      );
    });

    it('should handle only lightColor prop', () => {
      render(
        <ThemedView lightColor="#only-light">
          <Text>Light Only</Text>
        </ThemedView>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#only-light', dark: undefined },
        'background'
      );
    });

    it('should handle only darkColor prop', () => {
      render(
        <ThemedView darkColor="#only-dark">
          <Text>Dark Only</Text>
        </ThemedView>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: undefined, dark: '#only-dark' },
        'background'
      );
    });
  });
});