// Mock react-native's useColorScheme
const mockUseRNColorScheme = jest.fn();
jest.mock('react-native', () => ({
  useColorScheme: mockUseRNColorScheme,
}));

import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme } from './use-color-scheme.web';

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the react-native color scheme after hydration', () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useColorScheme());

    // In test environment, useEffect runs immediately, so we get the actual value
    expect(result.current).toBe('dark');
  });

  it('should call react-native useColorScheme', () => {
    mockUseRNColorScheme.mockReturnValue('light');

    renderHook(() => useColorScheme());

    expect(mockUseRNColorScheme).toHaveBeenCalled();
  });

  it('should handle different color scheme values', () => {
    const testValues = ['light', 'dark', null, undefined];

    testValues.forEach(value => {
      mockUseRNColorScheme.mockReturnValue(value);
      const { result } = renderHook(() => useColorScheme());

      // After hydration in test environment, should return the actual value
      expect(result.current).toBe(value);
    });
  });
});