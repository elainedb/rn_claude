import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(),
}));

const mockUseThemeColor = useThemeColor as jest.MockedFunction<typeof useThemeColor>;

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemeColor.mockReturnValue('#000000'); // Default mock color
  });

  describe('rendering', () => {
    it('should render text with default type', () => {
      const { getByText } = render(
        <ThemedText>Test Text</ThemedText>
      );

      expect(getByText('Test Text')).toBeTruthy();
    });

    it('should pass correct props to useThemeColor', () => {
      render(
        <ThemedText lightColor="#light" darkColor="#dark">
          Test
        </ThemedText>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#light', dark: '#dark' },
        'text'
      );
    });

    it('should use theme color when no custom colors provided', () => {
      render(
        <ThemedText>Test</ThemedText>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: undefined, dark: undefined },
        'text'
      );
    });

    it('should apply the returned theme color', () => {
      mockUseThemeColor.mockReturnValue('#ff0000');

      const { getByText } = render(
        <ThemedText>Colored Text</ThemedText>
      );

      const textElement = getByText('Colored Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#ff0000' })
        ])
      );
    });
  });

  describe('text types', () => {
    it('should apply default styles', () => {
      const { getByText } = render(
        <ThemedText type="default">Default Text</ThemedText>
      );

      const textElement = getByText('Default Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 16,
            lineHeight: 24,
          })
        ])
      );
    });

    it('should apply title styles', () => {
      const { getByText } = render(
        <ThemedText type="title">Title Text</ThemedText>
      );

      const textElement = getByText('Title Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 32,
            fontWeight: 'bold',
            lineHeight: 32,
          })
        ])
      );
    });

    it('should apply defaultSemiBold styles', () => {
      const { getByText } = render(
        <ThemedText type="defaultSemiBold">Semi Bold Text</ThemedText>
      );

      const textElement = getByText('Semi Bold Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '600',
          })
        ])
      );
    });

    it('should apply subtitle styles', () => {
      const { getByText } = render(
        <ThemedText type="subtitle">Subtitle Text</ThemedText>
      );

      const textElement = getByText('Subtitle Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 20,
            fontWeight: 'bold',
          })
        ])
      );
    });

    it('should apply link styles', () => {
      const { getByText } = render(
        <ThemedText type="link">Link Text</ThemedText>
      );

      const textElement = getByText('Link Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            lineHeight: 30,
            fontSize: 16,
            color: '#0a7ea4',
          })
        ])
      );
    });

    it('should default to default type when type is not specified', () => {
      const { getByText } = render(
        <ThemedText>Default Type Text</ThemedText>
      );

      const textElement = getByText('Default Type Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 16,
            lineHeight: 24,
          })
        ])
      );
    });
  });

  describe('style composition', () => {
    it('should merge custom styles with type styles', () => {
      const customStyle = { marginTop: 10, fontSize: 20 };

      const { getByText } = render(
        <ThemedText type="default" style={customStyle}>
          Styled Text
        </ThemedText>
      );

      const textElement = getByText('Styled Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#000000' }),
          expect.objectContaining({ fontSize: 16, lineHeight: 24 }),
          expect.objectContaining(customStyle),
        ])
      );
    });

    it('should allow custom styles to override type styles', () => {
      const customStyle = { fontSize: 100, lineHeight: 120 };

      const { getByText } = render(
        <ThemedText type="title" style={customStyle}>
          Override Styled Text
        </ThemedText>
      );

      const textElement = getByText('Override Styled Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });

    it('should handle array of styles', () => {
      const styles = [{ marginTop: 5 }, { marginBottom: 10 }];

      const { getByText } = render(
        <ThemedText style={styles}>Array Styled Text</ThemedText>
      );

      const textElement = getByText('Array Styled Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#000000' }),
          ...styles,
        ])
      );
    });
  });

  describe('prop forwarding', () => {
    it('should forward Text props to underlying Text component', () => {
      const textProps = {
        numberOfLines: 2,
        ellipsizeMode: 'tail' as const,
        selectable: true,
        testID: 'themed-text',
      };

      const { getByTestId } = render(
        <ThemedText {...textProps}>
          Forwarded Props Text
        </ThemedText>
      );

      const textElement = getByTestId('themed-text');
      expect(textElement.props.numberOfLines).toBe(2);
      expect(textElement.props.ellipsizeMode).toBe('tail');
      expect(textElement.props.selectable).toBe(true);
    });

    it('should not forward theme-specific props to Text component', () => {
      const { getByText } = render(
        <ThemedText lightColor="#light" darkColor="#dark" type="title">
          Theme Props Text
        </ThemedText>
      );

      const textElement = getByText('Theme Props Text');
      expect(textElement.props.lightColor).toBeUndefined();
      expect(textElement.props.darkColor).toBeUndefined();
      expect(textElement.props.type).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty children', () => {
      const { getByTestId } = render(
        <ThemedText testID="empty-text">{''}</ThemedText>
      );

      expect(getByTestId('empty-text')).toBeTruthy();
    });

    it('should handle null children', () => {
      const { getByTestId } = render(
        <ThemedText testID="null-text">{null}</ThemedText>
      );

      expect(getByTestId('null-text')).toBeTruthy();
    });

    it('should handle multiple children', () => {
      const { getByText } = render(
        <ThemedText>
          Part 1 {'Part 2'} {123}
        </ThemedText>
      );

      expect(getByText('Part 1 Part 2 123')).toBeTruthy();
    });

    it('should handle undefined theme color', () => {
      mockUseThemeColor.mockReturnValue(undefined as any);

      const { getByText } = render(
        <ThemedText>Undefined Color Text</ThemedText>
      );

      const textElement = getByText('Undefined Color Text');
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: undefined })
        ])
      );
    });
  });
});