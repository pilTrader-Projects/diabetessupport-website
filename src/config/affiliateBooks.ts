/**
 * Centralized Registry of Curated Metabolic Books & Clinical Protocols (Affiliate Monetization).
 *
 * @usecase Powers contextual affiliate recommendations inside the VideoPlayerModal,
 * author profiles, and the public Learning Hub reading shelf.
 */
import { IAffiliateRecommendation } from '@/types/learning';

export const AFFILIATE_DISCLOSURE =
  'Disclosure: Recommended books and protocols contain affiliate links. When you purchase through these links, you support our evidence-based advocacy at no extra cost to you.';

export const CURATED_AFFILIATE_BOOKS: IAffiliateRecommendation[] = [
  {
    _id: 'book-bikman-why-we-get-sick',
    title: 'Why We Get Sick',
    subtitle: 'The Hidden Epidemic at the Root of Most Living Diseases—and How to Fight It',
    author: 'Dr. Benjamin Bikman, PhD',
    authoritySlug: 'dr-benjamin-bikman',
    type: 'book',
    description:
      'The foundational scientific masterwork explaining why insulin resistance is the silent root driver behind Type 2 diabetes, fatty liver, obesity, cancer, and heart disease.',
    affiliateUrl: 'https://www.amazon.com/dp/194883698X?tag=diabetessup01-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/194883698X.01.LZZZZZZZ.jpg',
    platformName: 'Amazon / Kindle / Audible',
    badgeText: 'Foundational Science',
    topics: ['Insulin Resistance', 'Metabolic Health', 'Low Carb'],
  },
  {
    _id: 'book-fung-diabetes-code',
    title: 'The Diabetes Code',
    subtitle: 'Prevent and Reverse Type 2 Diabetes Naturally',
    author: 'Dr. Jason Fung, MD',
    authoritySlug: 'dr-jason-fung',
    type: 'book',
    description:
      'The landmark clinical reversal guide revealing how therapeutic fasting and dietary carbohydrate restriction can relieve beta-cell stress and reverse Type 2 diabetes naturally.',
    affiliateUrl: 'https://www.amazon.com/dp/1771642653?tag=diabetessup01-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1771642653.01.LZZZZZZZ.jpg',
    platformName: 'Amazon / Audible',
    badgeText: 'Clinical Reversal Protocol',
    topics: ['Intermittent Fasting', 'Type 2 Diabetes', 'Insulin Resistance'],
  },
  {
    _id: 'book-fung-obesity-code',
    title: 'The Obesity Code',
    subtitle: 'Unlocking the Secrets of Weight Loss',
    author: 'Dr. Jason Fung, MD',
    authoritySlug: 'dr-jason-fung',
    type: 'book',
    description:
      'A revolutionary exploration of the hormonal theory of obesity—showing why calories in vs. calories out fails and how managing insulin unlocks sustainable metabolic healing.',
    affiliateUrl: 'https://www.amazon.com/dp/1771641258?tag=diabetessup01-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/1771641258.01.LZZZZZZZ.jpg',
    platformName: 'Amazon / Audible',
    badgeText: 'Hormonal Obesity Theory',
    topics: ['Insulin Resistance', 'Weight Loss', 'Fasting'],
  },
  {
    _id: 'book-lustig-metabolical',
    title: 'Metabolical',
    subtitle: 'The Lure and the Lies of Processed Food, Nutrition, and Modern Medicine',
    author: 'Dr. Robert Lustig, MD',
    authoritySlug: 'dr-robert-lustig',
    type: 'book',
    description:
      'An explosive pediatric neuroendocrinologist breakdown of how ultra-processed food and fructose overwhelm the liver, drive NAFLD, and fuel the global chronic disease epidemic.',
    affiliateUrl: 'https://www.amazon.com/dp/0063027712?tag=diabetessup01-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0063027712.01.LZZZZZZZ.jpg',
    platformName: 'Amazon / Audible',
    badgeText: 'Liver & Food Processing',
    topics: ['Fatty Liver', 'Fructose', 'Ultra-Processed Food'],
  },
  {
    _id: 'book-attia-outlive',
    title: 'Outlive',
    subtitle: 'The Science and Art of Longevity',
    author: 'Dr. Peter Attia, MD',
    authoritySlug: 'dr-peter-attia',
    type: 'book',
    description:
      'A tactical operating manual for metabolic resilience, cardiorespiratory fitness, and nutritional biochemistry to extend both healthspan and lifespan.',
    affiliateUrl: 'https://www.amazon.com/dp/0593236599?tag=diabetessup01-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/0593236599.01.LZZZZZZZ.jpg',
    platformName: 'Amazon / Audible',
    badgeText: 'Longevity Blueprint',
    topics: ['Longevity', 'Cardiovascular Health', 'Metabolic Health'],
  },
];

/**
 * Normalizes input string for fuzzy token matching.
 */
function normalizeString(val: string): string {
  return val
    .toLowerCase()
    .replace(/[.,\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds recommended books and protocols for a specific doctor, scientist, or authority.
 * Searches by authoritySlug, authorityName, or keywords.
 */
export function getRecommendedBooksForAuthority(
  authorityNameOrSlug?: string
): IAffiliateRecommendation[] {
  if (!authorityNameOrSlug) return [];

  const normalized = normalizeString(authorityNameOrSlug);

  return CURATED_AFFILIATE_BOOKS.filter((book) => {
    if (book.authoritySlug && normalized.includes(normalizeString(book.authoritySlug))) {
      return true;
    }
    const normAuthor = normalizeString(book.author);
    const tokens = normalized.split(' ').filter((t) => t.length > 2 && t !== 'doctor' && t !== 'prof');
    return tokens.some((token) => normAuthor.includes(token));
  });
}

/**
 * Returns all active affiliate books and protocols.
 */
export function getAllRecommendedBooks(): IAffiliateRecommendation[] {
  return CURATED_AFFILIATE_BOOKS;
}
