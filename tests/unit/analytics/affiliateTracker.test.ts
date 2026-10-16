import { handleAffiliateClick } from '@/analytics/handlers/handleAffiliateClick';
import { attachAffiliateTracking } from '@/analytics/trackers/affiliateTracker';

describe('affiliateTracker & handleAffiliateClick', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (global as any).window = {
      location: {
        href: 'https://www.beforethenumbers.org/learn?topic=Fasting',
      },
      gtag: mockGtag,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tracks affiliate card click for left_sidebar position without stopping propagation', () => {
    const mockAnchor = {
      getAttribute: jest.fn((attr: string) => {
        if (attr === 'data-click-type') return 'affiliate_card';
        if (attr === 'data-book-title') return 'Metabolical';
        if (attr === 'data-card-position') return 'left_sidebar';
        if (attr === 'href') return 'https://amazon.com/dp/metabolical';
        return null;
      }),
      closest: jest.fn(),
    };
    mockAnchor.closest.mockReturnValue(mockAnchor);

    const mockEvent = {
      target: mockAnchor,
      currentTarget: mockAnchor,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as any;

    const handled = handleAffiliateClick(mockEvent);

    expect(handled).toBe(true);
    // Passive tracking contract: NEVER stop propagation or prevent default
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();

    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_card_click', {
      page_location: 'https://www.beforethenumbers.org/learn?topic=Fasting',
      affiliate_item: 'Metabolical',
      card_layout_position: 'left_sidebar',
      destination_url: 'https://amazon.com/dp/metabolical',
    });
  });

  it('tracks affiliate card click for right_sidebar position without stopping propagation', () => {
    const mockAnchor = {
      getAttribute: jest.fn((attr: string) => {
        if (attr === 'data-click-type') return 'affiliate_card';
        if (attr === 'data-book-title') return 'Drop Acid';
        if (attr === 'data-card-position') return 'right_sidebar';
        if (attr === 'href') return 'https://amazon.com/dp/drop-acid';
        return null;
      }),
      closest: jest.fn(),
    };
    mockAnchor.closest.mockReturnValue(mockAnchor);

    const mockEvent = {
      target: mockAnchor,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as any;

    const handled = handleAffiliateClick(mockEvent);

    expect(handled).toBe(true);
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_card_click', {
      page_location: 'https://www.beforethenumbers.org/learn?topic=Fasting',
      affiliate_item: 'Drop Acid',
      card_layout_position: 'right_sidebar',
      destination_url: 'https://amazon.com/dp/drop-acid',
    });
  });

  it('ignores clicks on non-affiliate elements (buttons, filters, player triggers) without interfering', () => {
    const mockFilterButton = {
      tagName: 'BUTTON',
      getAttribute: jest.fn().mockReturnValue(null),
      closest: jest.fn().mockReturnValue(null),
    };

    const mockEvent = {
      target: mockFilterButton,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as any;

    const handled = handleAffiliateClick(mockEvent);

    expect(handled).toBe(false);
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('attachAffiliateTracking registers passive bubbling listener on root container', () => {
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const mockContainer = {
      addEventListener,
      removeEventListener,
    } as unknown as HTMLElement;

    const cleanup = attachAffiliateTracking(mockContainer);

    // Verifies bubbling phase (false) instead of capture (true)
    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function), false);

    cleanup();

    expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), false);
  });

  it('delegated click listener ignores non-affiliate targets completely', () => {
    let capturedListener: any = null;
    const mockContainer: any = {
      addEventListener: jest.fn((event: string, fn: any) => {
        if (event === 'click') capturedListener = fn;
      }),
      removeEventListener: jest.fn(),
    };

    attachAffiliateTracking(mockContainer);
    expect(capturedListener).toBeDefined();

    const mockNormalButtonEvent = {
      target: {
        closest: jest.fn().mockReturnValue(null),
      },
      stopPropagation: jest.fn(),
    };

    capturedListener(mockNormalButtonEvent);

    expect(mockNormalButtonEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockGtag).not.toHaveBeenCalled();
  });
});
