/**
 * TDD Unit Test Suite for Learning Service (Authorities, Resources, Ingestion & Validation).
 *
 * @usecase Validates authority management, resource curation, dynamic RSS parsing, and link-rot verification.
 */
import { LearningService } from '../../src/services/learningService';
import { AuthorityModel } from '../../src/models/Authority';
import { LearningResourceModel } from '../../src/models/LearningResource';
import { PodcastChannelModel } from '../../src/models/PodcastChannel';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Authority');
jest.mock('../../src/models/LearningResource');
jest.mock('../../src/models/PodcastChannel');

describe('LearningService (TDD Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authority Management', () => {
    it('should list all active authorities ordered by displayOrder', async () => {
      const mockAuthorities = [
        { _id: 'auth_1', name: 'Dr. Benjamin Bikman', displayOrder: 1, isActive: true },
        { _id: 'auth_2', name: 'Dr. Jason Fung', displayOrder: 2, isActive: true },
      ];

      (AuthorityModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockAuthorities),
        }),
      });

      const result = await LearningService.listAuthorities({ activeOnly: true });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Dr. Benjamin Bikman');
      expect(AuthorityModel.find).toHaveBeenCalledWith({ isActive: true });
    });

    it('should create a new authority with a generated slug if not provided', async () => {
      const inputData = {
        name: 'Dr. David Unwin',
        title: 'NHS General Practitioner',
        specialties: ['Low Carb', 'Type 2 Remission'],
        youtubeChannelId: 'UC12345',
        autoPublish: true,
      };

      (AuthorityModel.create as jest.Mock).mockResolvedValue({
        _id: 'auth_new',
        ...inputData,
        slug: 'dr-david-unwin',
      });

      const created = await LearningService.createAuthority(inputData);
      expect(created._id).toBe('auth_new');
      expect(created.slug).toBe('dr-david-unwin');
      expect(AuthorityModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'dr-david-unwin', name: 'Dr. David Unwin' })
      );
    });

    it('should resolve raw UC channel ID directly', async () => {
      const channelId = await LearningService.resolveYouTubeChannelId('UCblbxPFG0XAsQA2LwzT6xDQ');
      expect(channelId).toBe('UCblbxPFG0XAsQA2LwzT6xDQ');
    });

    it('should resolve handle or handle URL to channel ID via fetch', async () => {
      const mockHtml = `<html><head><meta property="channel_id" content="UCblbxPFG0XAsQA2LwzT6xDQ"><link rel="canonical" href="https://www.youtube.com/channel/UCblbxPFG0XAsQA2LwzT6xDQ"></head></html>`;
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
      });

      const channelId = await LearningService.resolveYouTubeChannelId('https://www.youtube.com/@benbikman', mockFetch as any);
      expect(channelId).toBe('UCblbxPFG0XAsQA2LwzT6xDQ');
    });
  });

  describe('YouTube RSS XML Parser', () => {
    it('should parse YouTube Atom RSS feed XML correctly into video objects', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>yt:video:abc123xyz</id>
    <yt:videoId>abc123xyz</yt:videoId>
    <title>The Cellular Switch: How Insulin Controls Fat Burning</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=abc123xyz"/>
    <published>2026-03-15T12:00:00+00:00</published>
    <media:group xmlns:media="http://search.yahoo.com/mrss/">
      <media:description>In this lecture, we discuss how insulin suppresses lipolysis and how fasting activates autophagy.</media:description>
    </media:group>
  </entry>
</feed>`;

      const parsed = LearningService.parseYouTubeFeed(sampleXml);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].videoId).toBe('abc123xyz');
      expect(parsed[0].title).toBe('The Cellular Switch: How Insulin Controls Fat Burning');
      expect(parsed[0].description).toContain('suppresses lipolysis');
    });

    it('should extract 3 key takeaways from video descriptions', () => {
      const description = `In this deep dive:
1. High insulin locks fat in adipose tissue.
2. Intermittent fasting lowers basal insulin levels.
3. Ketones serve as an alternative metabolic fuel for the brain.`;

      const takeaways = LearningService.extractTakeaways(description, 'Insulin 101');
      expect(takeaways.length).toBeGreaterThanOrEqual(1);
      expect(takeaways[0]).toContain('High insulin locks fat');
    });
  });

  describe('Dynamic Sync Authority Feeds', () => {
    it('should fetch XML feed, skip existing duplicates, and save new videos', async () => {
      const mockAuthority = {
        _id: 'auth_1',
        name: 'Dr. Benjamin Bikman',
        title: 'Professor, BYU',
        avatarUrl: '/images/bikman.jpg',
        youtubeChannelId: 'UCbikman',
        autoPublish: true,
        specialties: ['Insulin Resistance', 'Low Carb'],
      };

      (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
      // Simulate that abc123xyz does not exist in DB yet
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({
        _id: 'res_new_1',
        title: 'Insulin Resistance Lecture',
      });
      (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>vid_123</yt:videoId>
          <title>Insulin Resistance Lecture</title>
          <published>2026-02-01T00:00:00Z</published>
          <media:group xmlns:media="http://search.yahoo.com/mrss/">
            <media:description>Key breakdown on metabolic fuel switching.</media:description>
          </media:group>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const syncResult = await LearningService.syncAuthorityYouTubeFeed('auth_1', mockFetch);
      expect(syncResult.addedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          embedId: 'vid_123',
          platform: 'youtube',
          authorityName: 'Dr. Benjamin Bikman',
          status: 'published',
        })
      );
    });

    it('should honor autoPublish=false and assign status pending_review', async () => {
      const mockAuthority = {
        _id: 'auth_review',
        name: 'Dr. Test',
        title: 'Researcher',
        youtubeChannelId: 'UCtest',
        autoPublish: false,
        specialties: ['Fasting'],
      };

      (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_rev' });
      (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>vid_pending</yt:videoId>
          <title>Fasting Guidelines</title>
          <published>2026-02-01T00:00:00Z</published>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const syncResult = await LearningService.syncAuthorityYouTubeFeed('auth_review', mockFetch);
      expect(syncResult.addedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending_review',
        })
      );
    });

    it('should classify off-topic video as rejected and increment skippedCount', async () => {
      const mockAuthority = {
        _id: 'auth_fitness',
        name: 'Dr. John Doe',
        title: 'Researcher',
        youtubeChannelId: 'UCfitness',
        autoPublish: true,
        specialties: [],
      };

      (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthority);
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_rejected' });
      (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>vid_offtopic</yt:videoId>
          <title>My 2026 Gaming Setup and Unboxing Tour</title>
          <published>2026-02-01T00:00:00Z</published>
          <media:group xmlns:media="http://search.yahoo.com/mrss/">
            <media:description>Touring my gaming room and unboxing new studio lights.</media:description>
          </media:group>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const syncResult = await LearningService.syncAuthorityYouTubeFeed('auth_fitness', mockFetch);
      expect(syncResult.addedCount).toBe(0);
      expect(syncResult.skippedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          embedId: 'vid_offtopic',
        })
      );
    });

    it('should run cron syndication across all active authorities', async () => {
      const mockAuthorities = [
        {
          _id: 'auth_1',
          name: 'Dr. Benjamin Bikman',
          youtubeChannelId: 'UCbikman',
        },
      ];

      (AuthorityModel.find as jest.Mock).mockResolvedValue(mockAuthorities);
      (PodcastChannelModel.find as jest.Mock).mockResolvedValue([]);
      (AuthorityModel.findById as jest.Mock).mockResolvedValue(mockAuthorities[0]);
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_cron' });
      (AuthorityModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>vid_cron_1</yt:videoId>
          <title>Metabolic Syndrome and Insulin Resistance</title>
          <published>2026-02-01T00:00:00Z</published>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const cronResult = await LearningService.runCronSyndication(mockFetch);
      expect(cronResult.processedAuthorities).toBe(1);
      expect(cronResult.totalAdded).toBe(1);
      expect(cronResult.totalSkipped).toBe(0);
      expect(cronResult.details[0].authority).toBe('Dr. Benjamin Bikman');
    });
  });

  describe('Podcast Channel Management & Guest Syndication', () => {
    it('should list active podcast channels', async () => {
      const mockChannels = [
        { _id: 'pod_1', name: 'The Diary Of A CEO', host: 'Steven Bartlett', isActive: true, displayOrder: 1 },
      ];

      (PodcastChannelModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockChannels),
        }),
      });

      const list = await LearningService.listPodcastChannels({ activeOnly: true });
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('The Diary Of A CEO');
    });

    it('should create a new podcast channel with auto-generated slug', async () => {
      const input = {
        name: 'The Diary Of A CEO',
        host: 'Steven Bartlett',
        youtubeChannelId: 'UCdoac',
        autoPublish: true,
      };

      (PodcastChannelModel.create as jest.Mock).mockResolvedValue({
        _id: 'pod_doac',
        ...input,
        slug: 'the-diary-of-a-ceo',
      });

      const created = await LearningService.createPodcastChannel(input);
      expect(created._id).toBe('pod_doac');
      expect(created.slug).toBe('the-diary-of-a-ceo');
      expect(PodcastChannelModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'the-diary-of-a-ceo', name: 'The Diary Of A CEO' })
      );
    });

    it('should syndicate podcast episode if guest is a registered authority and topic is metabolic health', async () => {
      const mockChannel = {
        _id: 'pod_doac',
        name: 'The Diary Of A CEO',
        youtubeChannelId: 'UCdoac',
        autoPublish: true,
      };

      const mockAuthorities = [
        {
          _id: 'auth_ben',
          name: 'Dr. Benjamin Bikman',
          title: 'Professor of Cell Biology',
          avatarUrl: '/images/bikman.jpg',
          specialties: ['Insulin Resistance', 'Metabolic Health'],
          aliases: ['Ben Bikman', 'Dr. Ben Bikman'],
          isActive: true,
        },
      ];

      (PodcastChannelModel.findById as jest.Mock).mockResolvedValue(mockChannel);
      (AuthorityModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAuthorities),
      });
      // Not already in DB
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_guest_1' });
      (PodcastChannelModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>doac_bikman_1</yt:videoId>
          <title>Dr. Ben Bikman: The #1 Cause of Belly Fat & Insulin Resistance</title>
          <published>2026-03-20T00:00:00Z</published>
          <media:group xmlns:media="http://search.yahoo.com/mrss/">
            <media:description>Dr. Ben Bikman joins Steven Bartlett to reveal how insulin controls metabolic health and fat loss.</media:description>
          </media:group>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const res = await LearningService.syncPodcastChannelYouTubeFeed('pod_doac', mockFetch);
      expect(res.addedCount).toBe(1);
      expect(res.skippedCount).toBe(0);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'podcast',
          authorityId: 'auth_ben',
          authorityName: 'Dr. Benjamin Bikman',
          podcastChannelId: 'pod_doac',
          podcastChannelName: 'The Diary Of A CEO',
          isGuestAppearance: true,
          status: 'published',
          embedId: 'doac_bikman_1',
        })
      );
    });

    it('should mark podcast episode as rejected if guest is unrelated or off-topic, preventing re-evaluation', async () => {
      const mockChannel = {
        _id: 'pod_doac',
        name: 'The Diary Of A CEO',
        youtubeChannelId: 'UCdoac',
        autoPublish: true,
      };

      const mockAuthorities = [
        {
          _id: 'auth_ben',
          name: 'Dr. Benjamin Bikman',
          isActive: true,
          aliases: ['Ben Bikman'],
        },
      ];

      (PodcastChannelModel.findById as jest.Mock).mockResolvedValue(mockChannel);
      (AuthorityModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAuthorities),
      });
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue(null);
      (LearningResourceModel.create as jest.Mock).mockResolvedValue({ _id: 'res_rejected_1' });
      (PodcastChannelModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>doac_ceos_crypto</yt:videoId>
          <title>Crypto Billionaire: How I Made $100M in Real Estate and Web3</title>
          <published>2026-03-22T00:00:00Z</published>
          <media:group xmlns:media="http://search.yahoo.com/mrss/">
            <media:description>Steven Bartlett talks tech investments with crypto founder.</media:description>
          </media:group>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const res = await LearningService.syncPodcastChannelYouTubeFeed('pod_doac', mockFetch);
      expect(res.addedCount).toBe(0);
      expect(res.skippedCount).toBe(1);
      expect(LearningResourceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'podcast',
          podcastChannelId: 'pod_doac',
          podcastChannelName: 'The Diary Of A CEO',
          status: 'rejected',
          embedId: 'doac_ceos_crypto',
        })
      );
    });

    it('should skip already evaluated podcast episodes without calling AI or creating duplicates', async () => {
      const mockChannel = {
        _id: 'pod_doac',
        name: 'The Diary Of A CEO',
        youtubeChannelId: 'UCdoac',
      };

      (PodcastChannelModel.findById as jest.Mock).mockResolvedValue(mockChannel);
      (AuthorityModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      // Already cached in DB as rejected or published
      (LearningResourceModel.findOne as jest.Mock).mockResolvedValue({ _id: 'cached_id', embedId: 'existing_vid' });
      (PodcastChannelModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const mockXml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
        <entry>
          <yt:videoId>existing_vid</yt:videoId>
          <title>Some Previous Episode</title>
        </entry>
      </feed>`;

      const mockFetch = jest.fn().mockResolvedValue(mockXml);

      const res = await LearningService.syncPodcastChannelYouTubeFeed('pod_doac', mockFetch);
      expect(res.addedCount).toBe(0);
      expect(res.skippedCount).toBe(0);
      expect(LearningResourceModel.create).not.toHaveBeenCalled();
    });
  });

  describe('Link-Rot Health Check Engine', () => {
    it('should mark video as broken_link if YouTube oEmbed returns 404 or 401', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ status: 404 });
      const status = await LearningService.validateYouTubeVideo('deleted_id', mockFetch);
      expect(status).toBe('broken');
    });

    it('should mark video as healthy if YouTube oEmbed returns 200', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ status: 200 });
      const status = await LearningService.validateYouTubeVideo('valid_id', mockFetch);
      expect(status).toBe('healthy');
    });

    it('should batch validate resources in database and update broken_link status', async () => {
      const mockResources = [
        { _id: 'res_1', type: 'video', platform: 'youtube', embedId: 'deleted_vid', status: 'published' },
        { _id: 'res_2', type: 'video', platform: 'youtube', embedId: 'healthy_vid', status: 'published' },
      ];

      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockResources),
      });

      const mockFetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('deleted_vid')) return Promise.resolve({ status: 404 });
        return Promise.resolve({ status: 200 });
      });

      (LearningResourceModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const result = await LearningService.runLinkRotHealthCheck(mockFetch);
      expect(result.checked).toBe(2);
      expect(result.broken).toBe(1);
      expect(LearningResourceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'res_1',
        expect.objectContaining({
          validationStatus: 'broken',
          status: 'broken_link',
        })
      );
    });
  });
});
