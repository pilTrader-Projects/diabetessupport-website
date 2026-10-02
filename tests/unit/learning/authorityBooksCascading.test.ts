/**
 * TDD Unit Tests — Dynamic Cascading of Authority Recommended Books to Learning Resources
 */
import { LearningResourceService } from '../../../src/services/learning/LearningResourceService';
import { LearningResourceModel } from '../../../src/models/LearningResource';
import { AuthorityModel } from '../../../src/models/Authority';
import { IAffiliateRecommendation } from '../../../src/types/learning';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/LearningResource');
jest.mock('../../../src/models/Authority');

afterEach(() => jest.clearAllMocks());

describe('LearningResourceService — Authority Books Cascading', () => {
  const dynamicAuthorityBooks: IAffiliateRecommendation[] = [
    {
      _id: 'book-1',
      title: 'Initial Book From Last Week',
      author: 'Dr. Jason Fung, MD',
      authoritySlug: 'dr-jason-fung',
      affiliateUrl: 'https://amazon.com/book1',
      type: 'book',
      platformName: 'Amazon',
    },
    {
      _id: 'book-2',
      title: 'Newly Added Book 1 Today',
      author: 'Dr. Jason Fung, MD',
      authoritySlug: 'dr-jason-fung',
      affiliateUrl: 'https://amazon.com/book2',
      type: 'book',
      platformName: 'Amazon',
    },
    {
      _id: 'book-3',
      title: 'Newly Added Book 2 Today',
      author: 'Dr. Jason Fung, MD',
      authoritySlug: 'dr-jason-fung',
      affiliateUrl: 'https://amazon.com/book3',
      type: 'book',
      platformName: 'Amazon',
    },
    {
      _id: 'book-4',
      title: 'Newly Added Book 3 Today',
      author: 'Dr. Jason Fung, MD',
      authoritySlug: 'dr-jason-fung',
      affiliateUrl: 'https://amazon.com/book4',
      type: 'book',
      platformName: 'Amazon',
    },
  ];

  it('cascades all 4 books from Authority when resource has empty recommendedBooks in listResources', async () => {
    const mockResourceDoc = {
      _id: 'res_fung_1',
      title: 'Therapeutic Fasting Masterclass',
      slug: 'therapeutic-fasting-masterclass',
      type: 'video',
      authorityId: 'auth_fung_123',
      authorityName: 'Dr. Jason Fung',
      recommendedBooks: [], // Empty on the video itself
    };

    (LearningResourceModel.countDocuments as jest.Mock).mockResolvedValue(1);
    (LearningResourceModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockResourceDoc]),
          }),
        }),
        lean: jest.fn().mockResolvedValue([mockResourceDoc]),
      }),
    });

    (AuthorityModel.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'auth_fung_123',
          name: 'Dr. Jason Fung',
          slug: 'dr-jason-fung',
          recommendedBooks: dynamicAuthorityBooks,
        },
      ]),
    });

    const result = await LearningResourceService.listResources({});

    expect(result.resources).toHaveLength(1);
    const video = result.resources[0];
    expect(video.recommendedBooks).toHaveLength(4);
    expect(video.recommendedBooks.map((b) => b.title)).toEqual([
      'Initial Book From Last Week',
      'Newly Added Book 1 Today',
      'Newly Added Book 2 Today',
      'Newly Added Book 3 Today',
    ]);
  });

  it('cascades books from Authority in getResourceById when resource has empty recommendedBooks', async () => {
    const mockResourceDoc = {
      _id: 'res_fung_1',
      title: 'Therapeutic Fasting Masterclass',
      slug: 'therapeutic-fasting-masterclass',
      type: 'video',
      authorityId: 'auth_fung_123',
      authorityName: 'Dr. Jason Fung',
      recommendedBooks: [],
    };

    (LearningResourceModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockResourceDoc),
    });

    (AuthorityModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'auth_fung_123',
        name: 'Dr. Jason Fung',
        slug: 'dr-jason-fung',
        recommendedBooks: dynamicAuthorityBooks,
      }),
    });

    const video = await LearningResourceService.getResourceById('res_fung_1');

    expect(video).not.toBeNull();
    expect(video?.recommendedBooks).toHaveLength(4);
    expect(video?.recommendedBooks[1].title).toBe('Newly Added Book 1 Today');
  });

  it('preserves explicit resource-level recommendedBooks when already defined on the video', async () => {
    const customBook: IAffiliateRecommendation = {
      _id: 'book-custom',
      title: 'Custom Featured Guide For This Video Only',
      author: 'Dr. Jason Fung',
      affiliateUrl: 'https://amazon.com/custom',
      type: 'book',
      platformName: 'Amazon',
    };

    const mockResourceDoc = {
      _id: 'res_fung_2',
      title: 'Specific Episode',
      slug: 'specific-episode',
      type: 'video',
      authorityId: 'auth_fung_123',
      authorityName: 'Dr. Jason Fung',
      recommendedBooks: [customBook],
    };

    (LearningResourceModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockResourceDoc),
    });

    const video = await LearningResourceService.getResourceById('res_fung_2');

    expect(video).not.toBeNull();
    expect(video?.recommendedBooks).toHaveLength(1);
    expect(video?.recommendedBooks[0].title).toBe('Custom Featured Guide For This Video Only');
    // AuthorityModel should not even need to be fetched when resource has explicit books
    expect(AuthorityModel.findById).not.toHaveBeenCalled();
  });
});
