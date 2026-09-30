/**
 * TDD Unit Tests — AuthorityService
 */
import { AuthorityService } from '../../../src/services/learning/AuthorityService';
import { AuthorityModel } from '../../../src/models/Authority';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/Authority');
jest.mock('../../../src/services/learning/shared/feedFetcher', () => ({
  resolveYouTubeChannelId: jest.fn().mockResolvedValue(null),
  generateSlug: (t: string) => t.toLowerCase().replace(/\s+/g, '-'),
}));

afterEach(() => jest.clearAllMocks());

describe('AuthorityService', () => {
  it('should list active authorities ordered by displayOrder', async () => {
    const mockAuthorities = [
      { _id: 'auth_1', name: 'Dr. Benjamin Bikman', displayOrder: 1, isActive: true, recommendedBooks: [] },
    ];
    (AuthorityModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockAuthorities) }),
    });
    const result = await AuthorityService.listAuthorities({ activeOnly: true });
    expect(result).toHaveLength(1);
    expect(AuthorityModel.find).toHaveBeenCalledWith({ isActive: true });
  });

  it('should create a new authority with a generated slug', async () => {
    (AuthorityModel.create as jest.Mock).mockResolvedValue({
      _id: 'auth_new',
      name: 'Dr. David Unwin',
      slug: 'dr-david-unwin',
      toObject: () => ({ _id: 'auth_new', name: 'Dr. David Unwin', slug: 'dr-david-unwin' }),
    });

    const created = await AuthorityService.createAuthority({ name: 'Dr. David Unwin', title: 'GP' });
    expect(created._id).toBe('auth_new');
    expect(AuthorityModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Dr. David Unwin' })
    );
  });

  it('should update authority and return updated doc', async () => {
    (AuthorityModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'auth_1', name: 'Updated Name' }),
    });
    const result = await AuthorityService.updateAuthority('auth_1', { name: 'Updated Name' });
    expect(result?.name).toBe('Updated Name');
  });

  it('should delete authority and return true', async () => {
    (AuthorityModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'auth_1' });
    const result = await AuthorityService.deleteAuthority('auth_1');
    expect(result).toBe(true);
  });
});
