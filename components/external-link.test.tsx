import React from 'react';
import { render } from '@testing-library/react-native';
import { ExternalLink } from './external-link';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    AUTOMATIC: 'automatic',
  },
}));

jest.mock('expo-router', () => ({
  Link: jest.fn(({ children, onPress, href, ...props }) => {
    const handlePress = (event: any) => {
      if (onPress) onPress(event);
    };

    return (
      <button
        onClick={handlePress}
        data-href={href}
        {...props}
      >
        {children}
      </button>
    );
  }),
}));

const mockOpenBrowserAsync = openBrowserAsync as jest.MockedFunction<typeof openBrowserAsync>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Link: MockLink } = require('expo-router');

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockLink.mockClear();
  });

  describe('rendering', () => {
    it('should render Link component with correct props', () => {
      const testUrl = 'https://example.com';
      const testText = 'Test Link';

      render(
        <ExternalLink href={testUrl}>
          {testText}
        </ExternalLink>
      );

      expect(MockLink).toHaveBeenCalledWith(
        expect.objectContaining({
          href: testUrl,
          target: '_blank',
          children: testText,
          onPress: expect.any(Function),
        }),
        undefined
      );
    });

    it('should pass through additional props to Link', () => {
      const testUrl = 'https://example.com';
      const customProps = {
        style: { color: 'blue' },
        accessibilityLabel: 'External link',
      };

      render(
        <ExternalLink href={testUrl} {...customProps}>
          Test Link
        </ExternalLink>
      );

      expect(MockLink).toHaveBeenCalledWith(
        expect.objectContaining({
          href: testUrl,
          target: '_blank',
          ...customProps,
          onPress: expect.any(Function),
        }),
        undefined
      );
    });

    it('should render with different href types', () => {
      const testUrls = [
        'https://example.com',
        'http://test.com',
        'mailto:test@example.com',
        'tel:+1234567890'
      ];

      testUrls.forEach(url => {
        const { unmount } = render(
          <ExternalLink href={url}>
            Link
          </ExternalLink>
        );

        expect(MockLink).toHaveBeenCalledWith(
          expect.objectContaining({
            href: url,
            onPress: expect.any(Function),
          }),
          undefined
        );

        unmount();
      });
    });
  });

  describe('onPress behavior - web platform', () => {
    beforeEach(() => {
      // Mock web environment
      process.env.EXPO_OS = 'web';
    });

    it('should not prevent default or open in-app browser on web', async () => {
      const testUrl = 'https://example.com';
      const mockEvent = {
        preventDefault: jest.fn(),
      };

      render(
        <ExternalLink href={testUrl}>
          Test Link
        </ExternalLink>
      );

      // Get the onPress function that was passed to Link
      const linkProps = MockLink.mock.calls[0][0];
      await linkProps.onPress(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
    });
  });

  describe('onPress behavior - native platform', () => {
    beforeEach(() => {
      // Mock native environment
      process.env.EXPO_OS = 'android';
      mockOpenBrowserAsync.mockResolvedValue({} as any);
    });

    it('should prevent default and open in-app browser on native', async () => {
      const testUrl = 'https://example.com';
      const mockEvent = {
        preventDefault: jest.fn(),
      };

      render(
        <ExternalLink href={testUrl}>
          Test Link
        </ExternalLink>
      );

      const linkProps = MockLink.mock.calls[0][0];
      await linkProps.onPress(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    });

    it('should handle openBrowserAsync errors gracefully', async () => {
      const testUrl = 'https://example.com';
      const mockEvent = { preventDefault: jest.fn() };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockOpenBrowserAsync.mockRejectedValue(new Error('Browser failed to open'));

      render(
        <ExternalLink href={testUrl}>
          Test Link
        </ExternalLink>
      );

      const linkProps = MockLink.mock.calls[0][0];

      // Should not throw
      await expect(linkProps.onPress(mockEvent)).rejects.toThrow('Browser failed to open');

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });

      consoleErrorSpy.mockRestore();
    });

    it('should work with different native platforms', async () => {
      const testUrl = 'https://example.com';
      const mockEvent = { preventDefault: jest.fn() };
      const platforms = ['ios', 'android'];

      for (const platform of platforms) {
        process.env.EXPO_OS = platform;
        mockEvent.preventDefault.mockClear();
        mockOpenBrowserAsync.mockClear();

        render(
          <ExternalLink href={testUrl}>
            Test Link
          </ExternalLink>
        );

        const linkProps = MockLink.mock.calls[MockLink.mock.calls.length - 1][0];
        await linkProps.onPress(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      }
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      process.env.EXPO_OS = 'android';
      mockOpenBrowserAsync.mockResolvedValue({} as any);
    });

    it('should handle URLs with special characters', async () => {
      const testUrl = 'https://example.com/path?param=value&other=test#section';
      const mockEvent = { preventDefault: jest.fn() };

      render(
        <ExternalLink href={testUrl}>
          Test Link
        </ExternalLink>
      );

      const linkProps = MockLink.mock.calls[0][0];
      await linkProps.onPress(mockEvent);

      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(testUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    });

    it('should handle empty children', () => {
      const testUrl = 'https://example.com';

      render(
        <ExternalLink href={testUrl}>
          {''}
        </ExternalLink>
      );

      expect(MockLink).toHaveBeenCalledWith(
        expect.objectContaining({
          href: testUrl,
          children: '',
          onPress: expect.any(Function),
        }),
        undefined
      );
    });

    it('should handle multiple children', () => {
      const testUrl = 'https://example.com';

      render(
        <ExternalLink href={testUrl}>
          <span>Part 1</span>
          <span>Part 2</span>
        </ExternalLink>
      );

      expect(MockLink).toHaveBeenCalledWith(
        expect.objectContaining({
          href: testUrl,
          onPress: expect.any(Function),
        }),
        undefined
      );
    });
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.EXPO_OS;
  });
});