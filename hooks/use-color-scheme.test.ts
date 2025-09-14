import { useColorScheme } from './use-color-scheme';

// Mock react-native's useColorScheme
const mockUseRNColorScheme = jest.fn();
jest.mock('react-native', () => ({
  useColorScheme: mockUseRNColorScheme,
}));

describe('useColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should re-export react-native useColorScheme', () => {
    mockUseRNColorScheme.mockReturnValue('light');

    const result = useColorScheme();

    expect(mockUseRNColorScheme).toHaveBeenCalled();
    expect(result).toBe('light');
  });

  it('should return dark when react-native returns dark', () => {
    mockUseRNColorScheme.mockReturnValue('dark');

    const result = useColorScheme();

    expect(result).toBe('dark');
  });

  it('should return null when react-native returns null', () => {
    mockUseRNColorScheme.mockReturnValue(null);

    const result = useColorScheme();

    expect(result).toBe(null);
  });

  it('should return undefined when react-native returns undefined', () => {
    mockUseRNColorScheme.mockReturnValue(undefined);

    const result = useColorScheme();

    expect(result).toBe(undefined);
  });
});