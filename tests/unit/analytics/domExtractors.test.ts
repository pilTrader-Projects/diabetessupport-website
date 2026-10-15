import {
  extractAffiliateCardContext,
  findClosestAffiliateCard,
} from '@/analytics/utils/domExtractors';

describe('domExtractors', () => {
  it('returns null if element is null or undefined', () => {
    expect(extractAffiliateCardContext(null)).toBeNull();
    expect(findClosestAffiliateCard(null)).toBeNull();
  });

  it('extracts affiliate context when all data attributes and href are present', () => {
    const mockAnchor = {
      getAttribute: jest.fn((attr: string) => {
        if (attr === 'data-click-type') return 'affiliate_card';
        if (attr === 'data-book-title') return 'Why We Get Sick';
        if (attr === 'data-card-position') return 'left_sidebar';
        if (attr === 'href') return 'https://amazon.com/dp/12345';
        return null;
      }),
    } as unknown as Element;

    const context = extractAffiliateCardContext(mockAnchor);

    expect(context).toEqual({
      bookTitle: 'Why We Get Sick',
      cardPosition: 'left_sidebar',
      destinationUrl: 'https://amazon.com/dp/12345',
    });
  });

  it('returns null if data-click-type is not affiliate_card', () => {
    const mockAnchor = {
      getAttribute: jest.fn((attr: string) => {
        if (attr === 'data-click-type') return 'other_link';
        return null;
      }),
    } as unknown as Element;

    expect(extractAffiliateCardContext(mockAnchor)).toBeNull();
  });

  it('handles closest affiliate card matching on nested elements', () => {
    const mockAnchor = {
      getAttribute: jest.fn().mockReturnValue('affiliate_card'),
    };

    const mockChildElement = {
      closest: jest.fn((selector: string) => {
        if (selector === 'a[data-click-type="affiliate_card"]') {
          return mockAnchor;
        }
        return null;
      }),
    };

    const matched = findClosestAffiliateCard(mockChildElement as unknown as EventTarget);
    expect(matched).toBe(mockAnchor);
  });

  it('returns null if closest anchor is not found', () => {
    const mockChildElement = {
      closest: jest.fn().mockReturnValue(null),
    };

    const matched = findClosestAffiliateCard(mockChildElement as unknown as EventTarget);
    expect(matched).toBeNull();
  });
});
