import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme } from './use-color-scheme.web';

// Mock react-native's useColorScheme
const mockUseRNColorScheme = jest.fn();
jest.mock('react-native', () => ({
  useColorScheme: mockUseRNColorScheme,
}));

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "light" before hydration', () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });

  it('should return actual color scheme after hydration', async () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const { result, waitForNextUpdate } = renderHook(() => useColorScheme());

    // Initially should return light
    expect(result.current).toBe('light');

    // Wait for useEffect to run (hydration)
    await waitForNextUpdate();

    // After hydration should return actual color scheme
    expect(result.current).toBe('dark');
  });

  it('should handle light color scheme after hydration', async () => {
    mockUseRNColorScheme.mockReturnValue('light');

    const { result, waitForNextUpdate } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');

    await waitForNextUpdate();

    expect(result.current).toBe('light');
  });

  it('should handle null color scheme after hydration', async () => {
    mockUseRNColorScheme.mockReturnValue(null);

    const { result, waitForNextUpdate } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');

    await waitForNextUpdate();

    expect(result.current).toBe(null);
  });

  it('should handle undefined color scheme after hydration', async () => {
    mockUseRNColorScheme.mockReturnValue(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');

    await waitForNextUpdate();

    expect(result.current).toBe(undefined);
  });

  it('should update when React Native color scheme changes', async () => {
    mockUseRNColorScheme.mockReturnValue('light');

    const { result, waitForNextUpdate, rerender } = renderHook(() => useColorScheme());

    // Wait for initial hydration
    await waitForNextUpdate();
    expect(result.current).toBe('light');

    // Change the mock return value
    mockUseRNColorScheme.mockReturnValue('dark');

    // Rerender to trigger the hook
    rerender();

    expect(result.current).toBe('dark');
  });

  it('should maintain hydration state across re-renders', async () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const { result, waitForNextUpdate, rerender } = renderHook(() => useColorScheme());

    // Wait for hydration
    await waitForNextUpdate();
    expect(result.current).toBe('dark');

    // Re-render and ensure it's still hydrated
    rerender();
    expect(result.current).toBe('dark');
  });
});