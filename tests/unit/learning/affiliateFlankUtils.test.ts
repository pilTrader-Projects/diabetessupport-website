import { distributeFlankBooks } from '../../../src/lib/affiliateFlankUtils';
import { IAffiliateRecommendation } from '../../../src/types/learning';

describe('affiliateFlankUtils (Option B Flanking Companion Books)', () => {
  const bookA: IAffiliateRecommendation = {
    title: 'The Obesity Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Unlocking the secrets of weight loss and insulin resistance.',
    affiliateUrl: 'https://amazon.com/dp/obesity-code?tag=affiliate-20',
    type: 'book',
    platformName: 'Amazon',
    badgeText: 'Bestseller',
  };

  const bookB: IAffiliateRecommendation = {
    title: 'The Diabetes Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Prevent and reverse type 2 diabetes naturally.',
    affiliateUrl: 'https://amazon.com/dp/diabetes-code?tag=affiliate-20',
    type: 'book',
    platformName: 'Amazon',
    badgeText: 'Clinical Protocol',
  };

  const bookC: IAffiliateRecommendation = {
    title: 'The Cancer Code',
    author: 'Dr. Jason Fung, MD',
    description: 'A revolutionary new understanding of medical science.',
    affiliateUrl: 'https://amazon.com/dp/cancer-code?tag=affiliate-20',
    type: 'book',
    platformName: 'Amazon',
  };

  it('should return empty flanks when no books are provided', () => {
    const result = distributeFlankBooks([]);
    expect(result.leftBooks).toEqual([]);
    expect(result.rightBooks).toEqual([]);
  });

  it('should place a single book on the right flank', () => {
    const result = distributeFlankBooks([bookA]);
    expect(result.rightBooks).toEqual([bookA]);
    expect(result.leftBooks).toEqual([]);
  });

  it('should distribute two books symmetrically across right and left flanks', () => {
    const result = distributeFlankBooks([bookA, bookB]);
    expect(result.rightBooks).toEqual([bookA]);
    expect(result.leftBooks).toEqual([bookB]);
  });

  it('should alternate 3 or more books evenly across flanks', () => {
    const result = distributeFlankBooks([bookA, bookB, bookC]);
    expect(result.rightBooks).toEqual([bookA, bookC]);
    expect(result.leftBooks).toEqual([bookB]);
  });
});
