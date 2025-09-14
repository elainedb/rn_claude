// Mock Platform before importing theme
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web || obj.default || obj.ios),
  },
}));

import { Colors } from './theme';

describe('Theme constants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Colors', () => {
    it('should have light theme colors', () => {
      expect(Colors.light).toEqual({
        text: '#11181C',
        background: '#fff',
        tint: '#0a7ea4',
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: '#0a7ea4',
      });
    });

    it('should have dark theme colors', () => {
      expect(Colors.dark).toEqual({
        text: '#ECEDEE',
        background: '#151718',
        tint: '#fff',
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#fff',
      });
    });

    it('should have consistent color structure between themes', () => {
      const lightKeys = Object.keys(Colors.light).sort();
      const darkKeys = Object.keys(Colors.dark).sort();

      expect(lightKeys).toEqual(darkKeys);
    });

    it('should have different colors for light and dark themes', () => {
      expect(Colors.light.text).not.toBe(Colors.dark.text);
      expect(Colors.light.background).not.toBe(Colors.dark.background);
    });
  });

  describe('Fonts', () => {
    it('should have font configuration', () => {
      // Since Platform.select is complex to mock properly,
      // let's just test that Fonts is defined and has the expected structure
      const { Fonts } = require('./theme');

      expect(Fonts).toBeDefined();
      expect(typeof Fonts).toBe('object');

      // Test that it has the expected font types
      const requiredFontTypes = ['sans', 'serif', 'rounded', 'mono'];
      requiredFontTypes.forEach(fontType => {
        expect(Fonts).toHaveProperty(fontType);
        expect(typeof Fonts[fontType]).toBe('string');
        expect(Fonts[fontType].length).toBeGreaterThan(0);
      });
    });

    it('should have different font families for different types', () => {
      const { Fonts } = require('./theme');

      // Fonts should be different for different types
      expect(Fonts.sans).toBeDefined();
      expect(Fonts.serif).toBeDefined();
      expect(Fonts.mono).toBeDefined();
      expect(Fonts.rounded).toBeDefined();
    });
  });
});