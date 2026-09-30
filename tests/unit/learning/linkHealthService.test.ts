/**
 * TDD Unit Tests — LinkHealthService
 */
import { LinkHealthService } from '../../../src/services/learning/LinkHealthService';
import { LearningResourceModel } from '../../../src/models/LearningResource';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/LearningResource');

afterEach(() => jest.clearAllMocks());

describe('LinkHealthService', () => {
  it('should return broken when oEmbed returns 404', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 404 });
    const status = await LinkHealthService.validateYouTubeVideo('deleted_id', mockFetch);
    expect(status).toBe('broken');
  });

  it('should return healthy when oEmbed returns 200', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 200 });
    const status = await LinkHealthService.validateYouTubeVideo('valid_id', mockFetch);
    expect(status).toBe('healthy');
  });

  it('should batch validate and update broken resources', async () => {
    const mockResources = [
      { _id: 'res_1', type: 'video', platform: 'youtube', embedId: 'deleted_vid', status: 'published' },
      { _id: 'res_2', type: 'video', platform: 'youtube', embedId: 'healthy_vid', status: 'published' },
    ];
    (LearningResourceModel.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockResources),
    });
    (LearningResourceModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

    const mockFetch = jest.fn().mockImplementation((url: string) =>
      url.includes('deleted_vid') ? Promise.resolve({ status: 404 }) : Promise.resolve({ status: 200 })
    );

    const result = await LinkHealthService.runLinkRotHealthCheck(mockFetch);
    expect(result.checked).toBe(2);
    expect(result.broken).toBe(1);
    expect(LearningResourceModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'res_1',
      expect.objectContaining({ validationStatus: 'broken', status: 'broken_link' })
    );
  });
});
