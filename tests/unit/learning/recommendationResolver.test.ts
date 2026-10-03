/**
 * TDD Unit Tests — Pure Recommendation Resolver Utility
 */
import {
  matchAuthority,
  resolveRecommendedBooks,
} from '../../../src/lib/recommendationResolver';
import { IAuthority, IAffiliateRecommendation } from '../../../src/types/learning';

describe('recommendationResolver', () => {
  const mockBooks: IAffiliateRecommendation[] = [
    {
      _id: 'b-1',
      title: 'The Diabetes Code',
      description: 'Reversing Type 2 Diabetes.',
      author: 'Dr. Jason Fung, MD',
      affiliateUrl: 'https://amazon.com/fung-diabetes',
      type: 'book',
    },
    {
      _id: 'b-2',
      title: 'The Obesity Code',
      description: 'The science of insulin.',
      author: 'Dr. Jason Fung, MD',
      affiliateUrl: 'https://amazon.com/fung-obesity',
      type: 'book',
    },
  ];

  const mockAuthority: IAuthority = {
    _id: 'auth_123',
    name: 'Dr. Jason Fung',
    slug: 'dr-jason-fung',
    title: 'Nephrologist & Author',
    specialties: ['Fasting', 'Type 2 Diabetes'],
    youtubeChannelId: 'UCjasonfung',
    autoPublish: true,
    isActive: true,
    displayOrder: 1,
    recommendedBooks: mockBooks,
  };

  describe('matchAuthority', () => {
    it('matches authority by exact authorityId', () => {
      const match = matchAuthority({ authorityId: 'auth_123' }, [mockAuthority]);
      expect(match?._id).toBe('auth_123');
    });

    it('matches authority by name case-insensitively', () => {
      const match = matchAuthority({ authorityName: 'dr. jason fung' }, [mockAuthority]);
      expect(match?._id).toBe('auth_123');
    });

    it('matches authority by slug', () => {
      const match = matchAuthority({ authorityName: 'dr-jason-fung' }, [mockAuthority]);
      expect(match?._id).toBe('auth_123');
    });

    it('returns null when no matching authority is found', () => {
      const match = matchAuthority({ authorityName: 'Unknown Person' }, [mockAuthority]);
      expect(match).toBeNull();
    });

    it('returns null when authorities array is empty or undefined', () => {
      expect(matchAuthority({ authorityId: 'auth_123' }, [])).toBeNull();
      expect(matchAuthority({ authorityId: 'auth_123' }, undefined as any)).toBeNull();
    });
  });

  describe('resolveRecommendedBooks', () => {
    it('returns explicit resource-level books when already present', () => {
      const customBook: IAffiliateRecommendation = {
        _id: 'custom-1',
        title: 'Specific Episode Guide',
        description: 'Episode specific protocol notes.',
        author: 'Guest Speaker',
        affiliateUrl: 'https://amazon.com/guide',
        type: 'book',
      };

      const books = resolveRecommendedBooks(
        { recommendedBooks: [customBook], authorityId: 'auth_123' },
        [mockAuthority]
      );

      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('Specific Episode Guide');
    });

    it('cascades dynamic books from matched authority when resource has empty books', () => {
      const books = resolveRecommendedBooks(
        { recommendedBooks: [], authorityId: 'auth_123' },
        [mockAuthority]
      );

      expect(books).toHaveLength(2);
      expect(books.map((b) => b.title)).toEqual(['The Diabetes Code', 'The Obesity Code']);
    });

    it('cascades dynamic books when matched by authorityName without authorityId', () => {
      const books = resolveRecommendedBooks(
        { recommendedBooks: [], authorityName: 'Dr. Jason Fung' },
        [mockAuthority]
      );

      expect(books).toHaveLength(2);
      expect(books[0].title).toBe('The Diabetes Code');
    });

    it('falls back to static registry for known author when authority has no books', () => {
      const emptyAuthority: IAuthority = {
        ...mockAuthority,
        recommendedBooks: [],
      };

      const books = resolveRecommendedBooks(
        { recommendedBooks: [], authorityName: 'Dr. Benjamin Bikman' },
        [emptyAuthority]
      );

      // Falls back to static CURATED_AFFILIATE_BOOKS which contains Bikman's "Why We Get Sick"
      expect(books.length).toBeGreaterThan(0);
      expect(books[0].title).toBe('Why We Get Sick');
    });

    it('returns empty array when neither authority nor static registry matches', () => {
      const books = resolveRecommendedBooks(
        { recommendedBooks: [], authorityName: 'Totally Random Nonexistent Author' },
        []
      );

      expect(books).toEqual([]);
    });
  });
});
