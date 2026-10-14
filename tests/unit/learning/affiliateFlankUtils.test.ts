import {
  distributeFlankBooks,
  resolveRelatedAffiliateBooks,
  resolveFlankPanels,
} from '../../../src/lib/affiliateFlankUtils';
import { IAffiliateRecommendation, IAuthority } from '../../../src/types/learning';

describe('affiliateFlankUtils (Option B Flanking Companion Books)', () => {
  const fungBook1: IAffiliateRecommendation = {
    title: 'The Obesity Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Unlocking the secrets of weight loss and insulin resistance.',
    affiliateUrl: 'https://amazon.com/dp/obesity-code',
    type: 'book',
    topics: ['Insulin Resistance', 'Fasting', 'Weight Loss'],
  };

  const fungBook2: IAffiliateRecommendation = {
    title: 'The Diabetes Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Prevent and reverse type 2 diabetes naturally.',
    affiliateUrl: 'https://amazon.com/dp/diabetes-code',
    type: 'book',
    topics: ['Diabetes Reversal', 'Insulin Resistance'],
  };

  const fungBook3: IAffiliateRecommendation = {
    title: 'The Complete Guide to Fasting',
    author: 'Dr. Jason Fung, MD',
    description: 'Heal your body through intermittent and extended fasting.',
    affiliateUrl: 'https://amazon.com/dp/fasting-guide',
    type: 'book',
    topics: ['Fasting', 'Autophagy'],
  };

  const bikmanBook: IAffiliateRecommendation = {
    title: 'Why We Get Sick',
    author: 'Dr. Benjamin Bikman, PhD',
    description: 'The hidden epidemic at the root of most chronic diseases.',
    affiliateUrl: 'https://amazon.com/dp/why-we-get-sick',
    type: 'book',
    topics: ['Insulin Resistance', 'Metabolic Syndrome'],
  };

  const ketoBook: IAffiliateRecommendation = {
    title: 'The Art and Science of Low Carbohydrate Living',
    author: 'Dr. Jeff Volek & Dr. Stephen Phinney',
    description: 'An expert guide to making the life-saving benefits of carbohydrate restriction work for you.',
    affiliateUrl: 'https://amazon.com/dp/low-carb-living',
    type: 'book',
    topics: ['Ketosis', 'Low Carb'],
  };

  const mockAuthorities: IAuthority[] = [
    {
      name: 'Dr. Jason Fung',
      slug: 'jason-fung',
      title: 'Nephrologist & Author',
      specialties: ['Intermittent Fasting', 'Type 2 Diabetes'],
      autoPublish: true,
      isActive: true,
      displayOrder: 1,
      recommendedBooks: [fungBook1, fungBook2, fungBook3],
    },
    {
      name: 'Dr. Benjamin Bikman',
      slug: 'ben-bikman',
      title: 'Professor of Cell Biology',
      specialties: ['Insulin Resistance', 'Ketosis'],
      autoPublish: true,
      isActive: true,
      displayOrder: 2,
      recommendedBooks: [bikmanBook],
    },
    {
      name: 'Dr. Jeff Volek',
      slug: 'jeff-volek',
      title: 'Professor of Human Sciences',
      specialties: ['Ketosis', 'Nutritional Ketosis'],
      autoPublish: true,
      isActive: true,
      displayOrder: 3,
      recommendedBooks: [ketoBook],
    },
  ];

  describe('resolveRelatedAffiliateBooks', () => {
    it('should find related books matching topics and exclude author own books', () => {
      const related = resolveRelatedAffiliateBooks({
        topics: ['Insulin Resistance', 'Ketosis'],
        excludeTitles: [fungBook1.title, fungBook2.title],
        authorities: mockAuthorities,
        limit: 2,
      });

      expect(related).toHaveLength(2);
      expect(related[0].title).toBe('Why We Get Sick'); // Matched Insulin Resistance
      expect(related.map((b) => b.title)).not.toContain(fungBook1.title);
      expect(related.map((b) => b.title)).not.toContain(fungBook2.title);
    });

    it('should return available fallback books when topics do not have direct matches', () => {
      const related = resolveRelatedAffiliateBooks({
        topics: ['Rare Electrolytes'],
        excludeTitles: [bikmanBook.title],
        authorities: mockAuthorities,
        limit: 2,
      });

      expect(related.length).toBeGreaterThan(0);
      expect(related.map((b) => b.title)).not.toContain(bikmanBook.title);
    });

    it('should return empty array if no authorities or candidate books exist', () => {
      const related = resolveRelatedAffiliateBooks({
        topics: ['Insulin Resistance'],
        authorities: [],
        limit: 2,
      });
      expect(related).toEqual([]);
    });
  });

  describe('resolveFlankPanels', () => {
    it('Case 1: when author has 0 books, displays related reading on both left and right flanks', () => {
      const result = resolveFlankPanels({
        authorBooks: [],
        authorityName: 'Independent Guest Speaker',
        topics: ['Insulin Resistance'],
        authorities: mockAuthorities,
        cardsPerSide: 2,
      });

      expect(result.leftBooks.length).toBeGreaterThan(0);
      expect(result.rightBooks.length).toBeGreaterThan(0);
      expect(result.leftTitle).toContain('Related Reading');
      expect(result.rightTitle).toContain('Related Reading');
      expect(result.allDisplayBooks.length).toBeGreaterThan(0);
    });

    it('Case 2: when author has limited books (<= cardsPerSide), dedicates one side to author and the other side to related readings', () => {
      const result = resolveFlankPanels({
        authorBooks: [bikmanBook], // 1 book
        authorityName: 'Dr. Benjamin Bikman',
        topics: ['Insulin Resistance'],
        authorities: mockAuthorities,
        cardsPerSide: 2,
      });

      // Left flank is dedicated solely to author's material
      expect(result.leftBooks).toEqual([bikmanBook]);
      expect(result.leftTitle).toContain('Dr. Benjamin Bikman');

      // Right flank is dedicated solely to other related readings
      expect(result.rightBooks.length).toBeGreaterThan(0);
      expect(result.rightTitle).toContain('Related Reading');
      expect(result.rightBooks.map((b) => b.title)).not.toContain(bikmanBook.title);

      // All display books includes both author and related
      expect(result.allDisplayBooks).toContainEqual(bikmanBook);
    });

    it('Case 3: when author books exceed card space (> cardsPerSide), dedicates both left and right flanks solely to author resources', () => {
      const result = resolveFlankPanels({
        authorBooks: [fungBook1, fungBook2, fungBook3], // 3 books > cardsPerSide (2)
        authorityName: 'Dr. Jason Fung',
        topics: ['Fasting'],
        authorities: mockAuthorities,
        cardsPerSide: 2,
      });

      // Both flanks display author's books
      expect(result.leftBooks.length).toBeGreaterThan(0);
      expect(result.rightBooks.length).toBeGreaterThan(0);
      expect(result.leftTitle).toContain('Dr. Jason Fung');
      expect(result.rightTitle).toContain('Dr. Jason Fung');

      // Every book across both flanks belongs to the author
      const allFlankTitles = [...result.leftBooks, ...result.rightBooks].map((b) => b.title);
      expect(allFlankTitles).toContain(fungBook1.title);
      expect(allFlankTitles).toContain(fungBook2.title);
      expect(allFlankTitles).toContain(fungBook3.title);
      expect(allFlankTitles).not.toContain(bikmanBook.title);
    });
  });

  describe('distributeFlankBooks', () => {
    it('should return empty flanks when no books are provided', () => {
      const result = distributeFlankBooks([]);
      expect(result.leftBooks).toEqual([]);
      expect(result.rightBooks).toEqual([]);
    });

    it('should place a single book on the right flank', () => {
      const result = distributeFlankBooks([fungBook1]);
      expect(result.rightBooks).toEqual([fungBook1]);
      expect(result.leftBooks).toEqual([]);
    });

    it('should distribute two books symmetrically across right and left flanks', () => {
      const result = distributeFlankBooks([fungBook1, fungBook2]);
      expect(result.rightBooks).toEqual([fungBook1]);
      expect(result.leftBooks).toEqual([fungBook2]);
    });

    it('should alternate 3 or more books evenly across flanks', () => {
      const result = distributeFlankBooks([fungBook1, fungBook2, fungBook3]);
      expect(result.rightBooks).toEqual([fungBook1, fungBook3]);
      expect(result.leftBooks).toEqual([fungBook2]);
    });
  });
});
