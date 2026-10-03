/**
 * TDD Unit Tests — Strict One-Directional Flow for Authority Channel Ingestion
 *
 * Architectural Mandate:
 * 1st: Authority Added (with official channel handle/ID)
 * 2nd: System scrapes authority channel ONLY to extract candidate videos
 *      Evaluates candidate videos via AiQualifierService for metabolic relevance
 * 3rd: Saves relevant videos to database strictly under that authority.
 *
 * Anti-patterns forbidden:
 * - NO global YouTube searches during authority sync
 * - NO cross-creator attribution
 * - Foreign channel videos must be rejected
 */
import { YouTubeSyncService } from '../../../src/services/learning/YouTubeSyncService';
import { AuthorityModel } from '../../../src/models/Authority';
import { LearningResourceModel } from '../../../src/models/LearningResource';
import { AiQualifierService } from '../../../src/services/aiQualifierService';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/Authority');
jest.mock('../../../src/models/LearningResource');
jest.mock('../../../src/services/aiQualifierService');
jest.mock('../../../src/services/learning/shared/feedFetcher', () => {
  const original = jest.requireActual('../../../src/services/learning/shared/feedFetcher');
  return {
    ...original,
    resolveYouTubeChannelId: jest.fn().mockResolvedValue(null),
    generateSlug: (t: string) => t.toLowerCase().replace(/\s+/g, '-'),
    fetchChannelEntries: jest.fn(),
    scrapeYouTubeSearchVideos: jest.fn(),
  };
});

describe('One-Directional Authority Ingestion Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enforces one-directional flow: fetches strictly from authority channel, qualifies, and persists under authority', async () => {
    const mockAuthority = {
      _id: 'auth_jamnadas',
      name: 'Dr. Pradip Jamnadas, MD',
      title: 'Cardiologist & Medical Director',
      avatarUrl: 'https://images.example.com/jamnadas.jpg',
      youtubeChannelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
      specialties: ['Intermittent Fasting', 'Cardiovascular Health'],
      autoPublish: true,
    };

    (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
    (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAuthority);
    (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
    (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_saved_1' });

    const { fetchChannelEntries, scrapeYouTubeSearchVideos } = require('../../../src/services/learning/shared/feedFetcher');
    (fetchChannelEntries as jest.Mock).mockResolvedValue({
      entries: [
        {
          videoId: 'vid_jamnadas_lecture_1',
          title: 'The Bittersweet Truth About Fasting',
          description: 'A lecture on autophagy, visceral fat reduction, and fasting physiology.',
          publishedAt: new Date('2026-01-15'),
          channelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
        },
      ],
      error: undefined,
    });

    (AiQualifierService.qualifyResource as jest.Mock).mockResolvedValue({
      isRelevant: true,
      relevanceScore: 92,
      relevanceReason: 'Excellent cardiovascular and metabolic fasting lecture',
      matchedTopics: ['Intermittent Fasting', 'Cardiovascular Health'],
      suggestedTakeaways: ['Fasting induces autophagy', 'Lowers systemic inflammation'],
    });

    const result = await YouTubeSyncService.syncAuthorityYouTubeFeed('auth_jamnadas');

    // 1. Scraper is strictly bound to authority channel
    expect(fetchChannelEntries).toHaveBeenCalledWith('UC0tQHehGWtb1Mp1gZC87y8A', expect.any(Object));
    // 2. Global search was NOT touched
    expect(scrapeYouTubeSearchVideos).not.toHaveBeenCalled();
    // 3. Exactly 1 video added under the authority
    expect(result.addedCount).toBe(1);
    expect(LearningResourceModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        embedId: 'vid_jamnadas_lecture_1',
        authorityId: 'auth_jamnadas',
        authorityName: 'Dr. Pradip Jamnadas, MD',
        status: 'published',
      })
    );
  });

  it('rejects foreign channel videos even if returned by scraper', async () => {
    const mockAuthority = {
      _id: 'auth_jamnadas',
      name: 'Dr. Pradip Jamnadas, MD',
      youtubeChannelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
      specialties: ['Intermittent Fasting'],
      autoPublish: true,
    };

    (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
    (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAuthority);
    (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);

    const { fetchChannelEntries } = require('../../../src/services/learning/shared/feedFetcher');
    // Simulate scraper returning a video with a different channel ID (e.g. Dr. Eric Berg)
    (fetchChannelEntries as jest.Mock).mockResolvedValue({
      entries: [
        {
          videoId: 'QMsItnMlhuo',
          title: 'Intermittent Fasting Doubles Your Risk of Dying from a Heart Attack',
          description: 'Dr Berg discusses AHA study.',
          publishedAt: new Date('2026-03-20'),
          channelId: 'UC_DR_BERG_CHANNEL_ID', // NOT Dr. Jamnadas' channel
        },
      ],
      error: undefined,
    });

    const result = await YouTubeSyncService.syncAuthorityYouTubeFeed('auth_jamnadas');

    expect(result.addedCount).toBe(0);
    expect(LearningResourceModel.create).not.toHaveBeenCalled();
  });

  it('gracefully handles missing youtubeChannelId without making network requests', async () => {
    (AuthorityModel.findById as jest.Mock).mockResolvedValue({
      _id: 'auth_no_channel',
      name: 'Dr. Someone',
      youtubeChannelId: '',
    });

    const { fetchChannelEntries } = require('../../../src/services/learning/shared/feedFetcher');
    const result = await YouTubeSyncService.syncAuthorityYouTubeFeed('auth_no_channel');

    expect(result.addedCount).toBe(0);
    expect(result.errors).toContain('Authority has no registered YouTube Channel ID or handle');
    expect(fetchChannelEntries).not.toHaveBeenCalled();
  });
});
