import React from 'react';
import { attachAffiliateTracking } from '@/analytics/trackers/affiliateTracker';
import { handleAffiliateClick } from '@/analytics/handlers/handleAffiliateClick';

describe('Click Propagation Pass-Through & Non-Interference', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (global as any).window = {
      location: { href: 'https://www.beforethenumbers.org/learn' },
      gtag: mockGtag,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('guarantees filter button and video play clicks fire without interference', () => {
    let filterClicked = false;
    let playVideoClicked = false;

    // Set up mock DOM elements
    const mockFilterButton = {
      tagName: 'BUTTON',
      getAttribute: jest.fn().mockReturnValue(null),
      closest: jest.fn().mockReturnValue(null),
      onClick: () => {
        filterClicked = true;
      },
    };

    const mockPlayButton = {
      tagName: 'BUTTON',
      getAttribute: jest.fn().mockReturnValue(null),
      closest: jest.fn().mockReturnValue(null),
      onClick: () => {
        playVideoClicked = true;
      },
    };

    // Attach delegated tracking to container
    let delegatedListener: any = null;
    const mockContainer: any = {
      addEventListener: jest.fn((evt: string, fn: any) => {
        if (evt === 'click') delegatedListener = fn;
      }),
      removeEventListener: jest.fn(),
    };

    const cleanup = attachAffiliateTracking(mockContainer);

    // 1. User clicks filter button
    const filterEvent = { target: mockFilterButton, stopPropagation: jest.fn() };
    delegatedListener(filterEvent);
    mockFilterButton.onClick();

    expect(filterClicked).toBe(true);
    expect(filterEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockGtag).not.toHaveBeenCalled();

    // 2. User clicks play video button
    const playEvent = { target: mockPlayButton, stopPropagation: jest.fn() };
    delegatedListener(playEvent);
    mockPlayButton.onClick();

    expect(playVideoClicked).toBe(true);
    expect(playEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockGtag).not.toHaveBeenCalled();

    // 3. User clicks affiliate card
    const mockAffiliateAnchor = {
      tagName: 'A',
      getAttribute: jest.fn((attr: string) => {
        if (attr === 'data-click-type') return 'affiliate_card';
        if (attr === 'data-book-title') return 'Test Book';
        if (attr === 'data-card-position') return 'left_sidebar';
        if (attr === 'href') return 'https://amazon.com/book';
        return null;
      }),
      closest: jest.fn(),
    };
    mockAffiliateAnchor.closest.mockReturnValue(mockAffiliateAnchor);

    const affiliateEvent = { target: mockAffiliateAnchor, stopPropagation: jest.fn() };
    delegatedListener(affiliateEvent);

    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_card_click', {
      page_location: 'https://www.beforethenumbers.org/learn',
      affiliate_item: 'Test Book',
      card_layout_position: 'left_sidebar',
      destination_url: 'https://amazon.com/book',
    });

    cleanup();
  });
});
