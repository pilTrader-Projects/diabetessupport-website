/**
 * TDD Unit Tests — shared/feedFetcher (parseYouTubeFeed, scrapeYouTubeChannelVideos, resolveYouTubeChannelId, fetchChannelEntries)
 */
import {
  parseYouTubeFeed,
  scrapeYouTubeChannelVideos,
  resolveYouTubeChannelId,
  fetchChannelEntries,
} from '../../../src/services/learning/shared/feedFetcher';

describe('parseYouTubeFeed', () => {
  it('should parse YouTube Atom RSS XML into video objects', () => {
    const xml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
      <entry>
        <yt:videoId>abc123</yt:videoId>
        <title>Insulin Resistance</title>
        <published>2026-03-15T12:00:00+00:00</published>
        <media:group xmlns:media="http://search.yahoo.com/mrss/">
          <media:description>Lecture on lipolysis</media:description>
        </media:group>
      </entry>
    </feed>`;
    const parsed = parseYouTubeFeed(xml);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].videoId).toBe('abc123');
    expect(parsed[0].title).toBe('Insulin Resistance');
    expect(parsed[0].description).toContain('lipolysis');
  });
});

describe('resolveYouTubeChannelId', () => {
  it('should return a UC id directly', async () => {
    const id = await resolveYouTubeChannelId('UCblbxPFG0XAsQA2LwzT6xDQ');
    expect(id).toBe('UCblbxPFG0XAsQA2LwzT6xDQ');
  });

  it('should resolve @handle to channel ID via fetch', async () => {
    const mockHtml = `<html><head><link rel="canonical" href="https://www.youtube.com/channel/UCblbxPFG0XAsQA2LwzT6xDQ"></head></html>`;
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(mockHtml) });
    const id = await resolveYouTubeChannelId('@benbikman', mockFetch as any);
    expect(id).toBe('UCblbxPFG0XAsQA2LwzT6xDQ');
  });
});

describe('scrapeYouTubeChannelVideos', () => {
  it('should extract lockupViewModel videos from ytInitialData', async () => {
    const html = `<html><head><script>
      var ytInitialData = {
        "contents": {
          "richGridRenderer": {
            "contents": [{
              "richItemRenderer": {
                "content": {
                  "lockupViewModel": {
                    "contentId": "Ng0nEmpPG74",
                    "metadata": {
                      "lockupMetadataViewModel": { "title": { "content": "Olive Oil Benefits" } }
                    },
                    "contentImage": {
                      "thumbnailViewModel": {
                        "overlays": [{
                          "thumbnailBottomOverlayViewModel": {
                            "badges": [{ "thumbnailBadgeViewModel": { "text": "24:38" } }]
                          }
                        }]
                      }
                    }
                  }
                }
              }
            }]
          }
        }
      };
    </script></head></html>`;
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const videos = await scrapeYouTubeChannelVideos('UCtest', mockFetch as any);
    expect(videos.length).toBe(1);
    expect(videos[0].videoId).toBe('Ng0nEmpPG74');
    expect(videos[0].title).toBe('Olive Oil Benefits');
    expect(videos[0].duration).toBe('24:38');
  });
});

describe('fetchChannelEntries', () => {
  it('should return parsed entries when fetchXmlFn succeeds', async () => {
    const xml = `<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
      <entry><yt:videoId>vid_1</yt:videoId><title>Test</title></entry>
    </feed>`;
    const { entries, error } = await fetchChannelEntries('UCtest', {
      fetchXmlFn: async () => xml,
    });
    expect(error).toBeUndefined();
    expect(entries).toHaveLength(1);
    expect(entries[0].videoId).toBe('vid_1');
  });

  it('should fall back to customScrapeFn when RSS feed returns 404', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    const mockScrapeFn = jest.fn().mockResolvedValue([
      { videoId: 'scraped_1', title: 'Scraped Video', description: '', publishedAt: new Date() },
    ]);

    const { entries, error } = await fetchChannelEntries('UCtest', { customScrapeFn: mockScrapeFn });
    expect(error).toBeUndefined();
    expect(entries).toHaveLength(1);
    expect(entries[0].videoId).toBe('scraped_1');
    expect(mockScrapeFn).toHaveBeenCalledWith('UCtest');
    global.fetch = originalFetch;
  });

  it('should return error when both RSS and scraper fail', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    const { entries, error } = await fetchChannelEntries('UCtest', {
      customScrapeFn: async () => [],
    });
    expect(entries).toHaveLength(0);
    expect(error).toContain('404');
    global.fetch = originalFetch;
  });
});
