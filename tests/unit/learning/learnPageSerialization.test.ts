/**
 * TDD Unit Test — Serialization of Learning Data for Server -> Client Components.
 *
 * Prevents Next.js RSC error:
 * "Only plain objects can be passed to Client Components from Server Components.
 * Objects with toJSON methods are not supported."
 */
import { AuthorityService, serializeRecommendedBooks } from '../../../src/services/learning/AuthorityService';
import { AuthorityModel } from '../../../src/models/Authority';
import { LearningResourceService } from '../../../src/services/learning/LearningResourceService';
import { LearningResourceModel } from '../../../src/models/LearningResource';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/Authority');
jest.mock('../../../src/models/LearningResource');
jest.mock('../../../src/services/learning/shared/feedFetcher', () => ({
  resolveYouTubeChannelId: jest.fn().mockResolvedValue(null),
  generateSlug: (t: string) => t.toLowerCase().replace(/\s+/g, '-'),
}));

describe('Learning Data Serialization for Client Components', () => {
  // A mock BSON ObjectId with toJSON method, simulating Mongoose subdocument _id
  const createMockObjectId = (hex = '6ab7e8a6162a7f750f68696a') => ({
    _bsontype: 'ObjectID',
    i0: 6995138,
    i1: 5100732,
    i2: 14037744,
    i3: 8901234,
    toString: () => hex,
    toJSON: () => hex,
  });

  it('serializeRecommendedBooks should convert BSON ObjectId _id into plain string and remove toJSON methods', () => {
    const rawBooks = [
      {
        _id: createMockObjectId('book_oid_123'),
        title: 'The Diabetes Code',
        author: 'Dr. Jason Fung, MD',
        authoritySlug: 'dr-jason-fung',
        type: 'book',
        subtitle: 'Prevent and Reverse Type 2 Diabetes Naturally',
        description: 'Clinical guide',
        affiliateUrl: 'https://link.amazon/test',
        coverUrl: 'https://images.example.com/cover.jpg',
        badgeText: 'Protocol',
        platformName: 'Amazon',
        topics: ['Intermittent Fasting', 'Type 2 Diabetes'],
      },
    ];

    const serialized = serializeRecommendedBooks(rawBooks);
    expect(serialized).toHaveLength(1);
    const book = serialized[0];

    // Crucial: _id must be a string primitive, NOT an object with toJSON
    expect(typeof book._id).toBe('string');
    expect(book._id).toBe('book_oid_123');
    expect((book._id as any).toJSON).toBeUndefined();

    // Verify the book object itself is a plain object without custom toJSON
    expect((book as any).toJSON).toBeUndefined();
    expect(book.title).toBe('The Diabetes Code');
    expect(book.topics).toEqual(['Intermittent Fasting', 'Type 2 Diabetes']);
  });

  it('AuthorityService.listAuthorities should sanitize embedded recommendedBooks', async () => {
    const mockAuthority = {
      _id: createMockObjectId('auth_id_999'),
      name: 'Dr. Jason Fung',
      slug: 'dr-jason-fung',
      title: 'Nephrologist',
      recommendedBooks: [
        {
          _id: createMockObjectId('book_oid_fung'),
          title: 'The Diabetes Code',
          author: 'Dr. Jason Fung',
          affiliateUrl: 'https://amazon.com/book',
        },
      ],
    };

    (AuthorityModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockAuthority]),
      }),
    });

    const authorities = await AuthorityService.listAuthorities();
    expect(authorities).toHaveLength(1);
    const auth = authorities[0];
    expect(typeof auth._id).toBe('string');
    expect(auth.recommendedBooks).toBeDefined();
    expect(typeof auth.recommendedBooks![0]._id).toBe('string');
    expect(auth.recommendedBooks![0]._id).toBe('book_oid_fung');
  });

  it('LearningResourceService.queryResources should sanitize embedded recommendedBooks', async () => {
    const mockResource = {
      _id: createMockObjectId('res_id_888'),
      title: 'Fasting and Autophagy',
      slug: 'fasting-and-autophagy',
      type: 'video',
      status: 'published',
      recommendedBooks: [
        {
          _id: createMockObjectId('book_oid_autophagy'),
          title: 'Autophagy Guide',
          author: 'Dr. Expert',
          affiliateUrl: 'https://amazon.com/autophagy',
        },
      ],
    };

    (LearningResourceModel.countDocuments as jest.Mock).mockResolvedValue(1);
    (LearningResourceModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockResource]),
      }),
    });

    const result = await LearningResourceService.listResources({});
    expect(result.resources).toHaveLength(1);
    const res = result.resources[0];
    expect(typeof res._id).toBe('string');
    expect(res.recommendedBooks).toBeDefined();
    expect(typeof res.recommendedBooks![0]._id).toBe('string');
    expect(res.recommendedBooks![0]._id).toBe('book_oid_autophagy');
  });
});
