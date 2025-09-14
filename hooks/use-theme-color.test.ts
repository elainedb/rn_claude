import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from './use-theme-color';
import { useColorScheme } from './use-color-scheme';
import { Colors } from '@/constants/theme';

// Mock the useColorScheme hook
jest.mock('./use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when color scheme is light', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should return color from props when light color is provided', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
      );

      expect(result.current).toBe('#custom-light');
    });

    it('should return theme color when no light color in props', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should return theme color when light color is undefined', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: undefined, dark: '#custom-dark' }, 'background')
      );

      expect(result.current).toBe(Colors.light.background);
    });

    it('should work with all available color names', () => {
      const colorNames: Array<keyof typeof Colors.light> = [
        'text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'
      ];

      colorNames.forEach(colorName => {
        const { result } = renderHook(() =>
          useThemeColor({}, colorName)
        );

        expect(result.current).toBe(Colors.light[colorName]);
      });
    });
  });

  describe('when color scheme is dark', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('should return color from props when dark color is provided', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
      );

      expect(result.current).toBe('#custom-dark');
    });

    it('should return theme color when no dark color in props', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.dark.text);
    });

    it('should return theme color when dark color is undefined', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light', dark: undefined }, 'background')
      );

      expect(result.current).toBe(Colors.dark.background);
    });

    it('should work with all available color names', () => {
      const colorNames: Array<keyof typeof Colors.dark> = [
        'text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'
      ];

      colorNames.forEach(colorName => {
        const { result } = renderHook(() =>
          useThemeColor({}, colorName)
        );

        expect(result.current).toBe(Colors.dark[colorName]);
      });
    });
  });

  describe('when color scheme is null', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(null);
    });

    it('should fallback to light theme', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should still respect props colors in null theme', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light' }, 'text')
      );

      expect(result.current).toBe('#custom-light');
    });
  });

  describe('when color scheme is undefined', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(undefined);
    });

    it('should fallback to light theme', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'background')
      );

      expect(result.current).toBe(Colors.light.background);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should handle empty props object', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tint')
      );

      expect(result.current).toBe(Colors.light.tint);
    });

    it('should prioritize props over theme colors', () => {
      const customColor = '#ff0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customColor }, 'text')
      );

      expect(result.current).toBe(customColor);
      expect(result.current).not.toBe(Colors.light.text);
    });
  });
});