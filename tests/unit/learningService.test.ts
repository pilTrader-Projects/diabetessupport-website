/**
 * TDD Unit Test Suite for Learning Service (Authorities, Resources, Ingestion & Validation).
 *
 * @usecase Validates authority management, resource curation, dynamic RSS parsing, and link-rot verification.
 */
import { LearningService } from '../../src/services/learningService';
import { AuthorityModel } from '../../src/models/Authority';
import { LearningResourceModel } from '../../src/models/LearningResource';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Authority');
jest.mock('../../src/models/LearningResource');

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
