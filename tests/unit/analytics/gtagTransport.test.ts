import { isGtagAvailable, sendGtagEvent } from '@/analytics/utils/gtagTransport';

describe('gtagTransport', () => {
  let originalWindow: any;

  beforeEach(() => {
    originalWindow = (global as any).window;
  });

  afterEach(() => {
    (global as any).window = originalWindow;
    jest.clearAllMocks();
  });

  it('returns false when window is undefined', () => {
    delete (global as any).window;
    expect(isGtagAvailable()).toBe(false);
    expect(sendGtagEvent('test_event', { key: 'value' })).toBe(false);
  });

  it('returns false when window.gtag is not defined', () => {
    (global as any).window = {};
    expect(isGtagAvailable()).toBe(false);
    expect(sendGtagEvent('test_event', { key: 'value' })).toBe(false);
  });

  it('returns true when window.gtag is a function', () => {
    (global as any).window = {
      gtag: jest.fn(),
    };
    expect(isGtagAvailable()).toBe(true);
  });

  it('successfully dispatches event through window.gtag', () => {
    const mockGtag = jest.fn();
    (global as any).window = {
      gtag: mockGtag,
    };

    const success = sendGtagEvent('affiliate_card_click', {
      page_location: 'https://example.com/learn',
      affiliate_item: 'The Obesity Code',
    });

    expect(success).toBe(true);
    expect(mockGtag).toHaveBeenCalledTimes(1);
    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_card_click', {
      page_location: 'https://example.com/learn',
      affiliate_item: 'The Obesity Code',
    });
  });

  it('safely catches errors and returns false if gtag throws', () => {
    const mockGtag = jest.fn().mockImplementation(() => {
      throw new Error('Gtag network failure');
    });
    (global as any).window = {
      gtag: mockGtag,
    };

    const success = sendGtagEvent('test_event', { key: 'val' });
    expect(success).toBe(false);
  });
});
