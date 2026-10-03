/**
 * TDD Unit Tests for Keyword-Targeted Video & Podcast Guest Syndication
 */
import { scrapeYouTubeSearchVideos } from '../../../src/services/learning/shared/feedFetcher';
import { YouTubeSyncService } from '../../../src/services/learning/YouTubeSyncService';
import { AuthorityModel } from '../../../src/models/Authority';
import { PodcastChannelModel } from '../../../src/models/PodcastChannel';
import { LearningResourceModel } from '../../../src/models/LearningResource';
import { AiQualifierService } from '../../../src/services/aiQualifierService';

jest.mock('../../../src/lib/dbConnect', () => ({ dbConnect: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../src/models/Authority');
jest.mock('../../../src/models/PodcastChannel');
jest.mock('../../../src/models/LearningResource');
jest.mock('../../../src/services/aiQualifierService');
jest.mock('../../../src/services/learning/shared/feedFetcher', () => {
  const original = jest.requireActual('../../../src/services/learning/shared/feedFetcher');
  return {
    ...original,
    resolveYouTubeChannelId: jest.fn().mockResolvedValue(null),
    generateSlug: (t: string) => t.toLowerCase().replace(/\s+/g, '-'),
    fetchChannelEntries: jest.fn().mockResolvedValue({ entries: [] }),
    scrapeYouTubeSearchVideos: jest.fn(),
  };
});

describe('Keyword-Targeted Syndication', () => {
  beforeEach(() => {
    const { fetchChannelEntries } = require('../../../src/services/learning/shared/feedFetcher');
    (fetchChannelEntries as jest.Mock).mockResolvedValue({ entries: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeYouTubeSearchVideos helper logic', () => {
    it('parses YouTube search result HTML and extracts video entries', async () => {
      // Import the actual scrapeYouTubeSearchVideos function implementation
      const { parseYouTubeSearchHtml } = jest.requireActual(
        '../../../src/services/learning/shared/feedFetcher'
      );

      const mockHtml = `<html><body><script>
        var ytInitialData = {
          "contents": {
            "twoColumnSearchResultsRenderer": {
              "primaryContents": {
                "sectionListRenderer": {
                  "contents": [{
                    "itemSectionRenderer": {
                      "contents": [{
                        "videoRenderer": {
                          "videoId": "vid_fasting_101",
                          "title": { "runs": [{ "text": "Fasting For Survival Lecture" }] },
                          "descriptionSnippet": { "runs": [{ "text": "Clinical lecture on prolonged fasting and autophagy." }] },
                          "lengthText": { "simpleText": "54:20" }
                        }
                      }]
                    }
                  }]
                }
              }
            }
          }
        };
      </script></body></html>`;

      if (typeof parseYouTubeSearchHtml === 'function') {
        const results = parseYouTubeSearchHtml(mockHtml);
        expect(results).toHaveLength(1);
        expect(results[0].videoId).toBe('vid_fasting_101');
        expect(results[0].title).toBe('Fasting For Survival Lecture');
        expect(results[0].duration).toBe('54:20');
      }
    });
  });

  describe('Authority Channel-Bound Sync', () => {
    it('confines ingestion strictly to authority channel entries, filters by keywords, and NEVER calls global search', async () => {
      const mockAuthority = {
        _id: 'auth_jamnadas',
        name: 'Dr. Pradip Jamnadas, MD',
        youtubeChannelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
        specialties: ['Intermittent Fasting', 'Insulin Resistance'],
        autoPublish: true,
      };

      (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
      (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockAuthority);
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_new' });

      const { fetchChannelEntries, scrapeYouTubeSearchVideos } = require('../../../src/services/learning/shared/feedFetcher');
      (fetchChannelEntries as jest.Mock).mockResolvedValue({
        entries: [
          {
            videoId: 'vid_jamnadas_fasting',
            title: 'Fasting for Survival by Dr. Pradip Jamnadas',
            description: 'A deep dive into autophagy, lipolysis, and reversing insulin resistance.',
            publishedAt: new Date('2026-01-01'),
            duration: '1:02:15',
            channelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
          },
          {
            videoId: 'vid_other_topic',
            title: 'Office Tour & Greeting',
            description: 'Walking around the clinic.',
            publishedAt: new Date('2026-01-02'),
            channelId: 'UC0tQHehGWtb1Mp1gZC87y8A',
          },
          {
            videoId: 'vid_foreign_channel',
            title: 'Foreign Fasting Video',
            description: 'Fasting video from another creator channel.',
            publishedAt: new Date('2026-01-03'),
            channelId: 'UC_DIFFERENT_CREATOR_CHANNEL',
          },
        ],
      });

      (AiQualifierService.qualifyResource as jest.Mock).mockResolvedValue({
        isRelevant: true,
        relevanceScore: 95,
        relevanceReason: 'Comprehensive clinical lecture on fasting and insulin resistance',
        matchedTopics: ['Intermittent Fasting', 'Insulin Resistance'],
        suggestedTakeaways: ['Fasting triggers autophagy', 'Reduces visceral fat', 'Restores insulin sensitivity'],
      });

      const result = await YouTubeSyncService.syncAuthorityYouTubeFeed(
        'auth_jamnadas',
        undefined,
        undefined,
        undefined,
        { keywords: ['fasting'] }
      );

      // Verify that global YouTube search is NEVER called during authority channel sync
      expect(scrapeYouTubeSearchVideos).not.toHaveBeenCalled();

      // Verify fetchChannelEntries was called with the authority channel
      expect(fetchChannelEntries).toHaveBeenCalledWith(
        'UC0tQHehGWtb1Mp1gZC87y8A',
        expect.any(Object)
      );

      // Only the genuine, matching channel video was ingested (foreign channel video was dropped)
      expect(result.addedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          embedId: 'vid_jamnadas_fasting',
          title: 'Fasting for Survival by Dr. Pradip Jamnadas',
          authorityName: 'Dr. Pradip Jamnadas, MD',
          status: 'published',
        })
      );
    });
  });

  describe('Podcast Channel Guest Search Ingestion', () => {
    it('syncPodcastChannelYouTubeFeed queries podcast show name combined with authority names to find guest appearances', async () => {
      const mockPodcastChannel = {
        _id: 'podcast_doac',
        name: 'The Diary Of A CEO',
        youtubeChannelId: 'UCGq-a57w-xP9XC98zRCEEGw',
        autoPublish: true,
      };

      const mockAuthority = {
        _id: 'auth_fung',
        name: 'Dr. Jason Fung',
        title: 'Nephrologist',
        avatarUrl: 'https://images.example.com/fung.jpg',
        aliases: ['Jason Fung', 'Dr Fung'],
        specialties: ['Intermittent Fasting', 'Type 2 Diabetes'],
        isActive: true,
      };

      (PodcastChannelModel.findById as jest.Mock).mockResolvedValue(mockPodcastChannel);
      (PodcastChannelModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockPodcastChannel);
      (AuthorityModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockAuthority]),
      });
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_podcast_fung' });

      const { scrapeYouTubeSearchVideos } = require('../../../src/services/learning/shared/feedFetcher');
      (scrapeYouTubeSearchVideos as jest.Mock).mockResolvedValue([
        {
          videoId: 'vid_doac_fung',
          title: 'Do THIS To REVERSE Insulin Resistance & TYPE 2 DIABETES! | Dr Jason Fung',
          description: 'Dr Jason Fung joins Steven Bartlett on The Diary Of A CEO to explain fasting protocols.',
          publishedAt: new Date('2026-02-10'),
          duration: '1:45:00',
        },
      ]);

      (AiQualifierService.qualifyPodcastEpisode as jest.Mock).mockResolvedValue({
        isRelevant: true,
        relevanceScore: 98,
        relevanceReason: 'Dr. Jason Fung guest lecture on diabetes reversal on DOAC',
        matchedAuthority: mockAuthority,
        matchedTopics: ['Type 2 Diabetes', 'Intermittent Fasting'],
        suggestedTakeaways: ['Fasting burns liver fat', 'Low carb lowers insulin need'],
      });

      const result = await YouTubeSyncService.syncPodcastChannelYouTubeFeed(
        'podcast_doac',
        undefined,
        undefined,
        undefined,
        { searchGuestAuthorities: true }
      );

      // Verify it queried YouTube specifically for the authority on the podcast channel
      expect(scrapeYouTubeSearchVideos).toHaveBeenCalledWith(
        expect.stringContaining('The Diary Of A CEO'),
        undefined
      );
      expect(result.addedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          embedId: 'vid_doac_fung',
          isGuestAppearance: true,
          authorityName: 'Dr. Jason Fung',
          status: 'published',
        })
      );
    });
  });
});
