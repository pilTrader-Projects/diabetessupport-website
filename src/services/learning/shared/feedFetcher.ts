/**
 * Shared YouTube feed fetching utility — DRY extraction of the RSS fetch + channel scraper fallback
 * that was previously duplicated identically in syncAuthorityYouTubeFeed and syncPodcastChannelYouTubeFeed.
 */

export type VideoEntry = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: Date;
  duration?: string;
  channelId?: string;
  channelTitle?: string;
};

type FetchFn = (url: string, init?: any) => Promise<any>;
type ScrapeFn = (channelId: string) => Promise<VideoEntry[]>;

/**
 * Parses official YouTube Atom RSS XML into structured video items.
 */
export function parseYouTubeFeed(xmlContent: string): VideoEntry[] {
  const items: VideoEntry[] = [];
  const feedChannelId = xmlContent.match(/<yt:channelId>(.*?)<\/yt:channelId>/)?.[1]?.trim();
  const feedAuthorName = xmlContent.match(/<author>[\s\S]*?<name>(.*?)<\/name>/)?.[1]?.trim();

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xmlContent)) !== null) {
    const entryXml = match[1];
    const videoIdMatch = entryXml.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entryXml.match(/<title>(.*?)<\/title>/);
    const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/);
    const descMatch = entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/);
    const entryChannelIdMatch = entryXml.match(/<yt:channelId>(.*?)<\/yt:channelId>/);
    const entryAuthorMatch = entryXml.match(/<author>[\s\S]*?<name>(.*?)<\/name>/);

    if (videoIdMatch && titleMatch) {
      items.push({
        videoId: videoIdMatch[1].trim(),
        title: titleMatch[1].trim().replace(/&amp;/g, '&'),
        description: descMatch ? descMatch[1].trim() : '',
        publishedAt: publishedMatch ? new Date(publishedMatch[1].trim()) : new Date(),
        channelId: entryChannelIdMatch?.[1]?.trim() || feedChannelId,
        channelTitle: entryAuthorMatch?.[1]?.trim() || feedAuthorName,
      });
    }
  }

  return items;
}

/**
 * Scrapes recent videos directly from a YouTube channel's /videos page.
 * Resilient fallback when YouTube's Atom RSS feed (videos.xml) returns 404 or is unavailable.
 */
export async function scrapeYouTubeChannelVideos(
  channelId: string,
  customFetch?: FetchFn
): Promise<VideoEntry[]> {
  const targetUrl = `https://www.youtube.com/channel/${channelId}/videos`;
  const fetchFn = customFetch || fetch;

  try {
    const res = await fetchFn(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return [];

    const html = typeof res.text === 'function' ? await res.text() : String(res);
    const match =
      html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({[\s\S]*?});/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const results: VideoEntry[] = [];
    const seenIds = new Set<string>();

    function extractVideos(obj: any) {
      if (!obj || typeof obj !== 'object') return;

      if (obj.videoRenderer) {
        const vr = obj.videoRenderer;
        const vid = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
        const isPlaylist = typeof vid === 'string' && (vid.startsWith('PL') || vid.startsWith('UU') || vid.startsWith('RD') || vid.startsWith('FL') || vid.length > 25);
        if (vid && !isPlaylist && title && !seenIds.has(vid)) {
          seenIds.add(vid);
          results.push({
            videoId: vid,
            title: title.trim(),
            description: (vr.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || '').trim(),
            publishedAt: new Date(),
            duration: vr.lengthText?.simpleText,
            channelId,
          });
        }
      } else if (obj.lockupViewModel) {
        const lvm = obj.lockupViewModel;
        const vid =
          lvm.contentId ||
          lvm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
        const title = lvm.metadata?.lockupMetadataViewModel?.title?.content;
        if (vid && /^[a-zA-Z0-9_-]{11}$/.test(vid) && title && !seenIds.has(vid)) {
          seenIds.add(vid);
          results.push({
            videoId: vid,
            title: title.trim(),
            description: '',
            publishedAt: new Date(),
            duration:
              lvm.contentImage?.thumbnailViewModel?.overlays?.[0]
                ?.thumbnailBottomOverlayViewModel?.badges?.[0]
                ?.thumbnailBadgeViewModel?.text,
            channelId,
          });
        }
      }

      for (const key of Object.keys(obj)) {
        extractVideos(obj[key]);
      }
    }

    extractVideos(data);
    return results;
  } catch (err: any) {
    console.error('Error scraping YouTube channel videos:', err.message);
    return [];
  }
}

/**
 * Parses YouTube search result HTML payload into structured video entries.
 */
export function parseYouTubeSearchHtml(html: string): VideoEntry[] {
  const match =
    html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/) ||
    html.match(/ytInitialData\s*=\s*({[\s\S]*?});/);
  if (!match) return [];

  try {
    const data = JSON.parse(match[1]);
    const results: VideoEntry[] = [];
    const seenIds = new Set<string>();

    function extractVideos(obj: any) {
      if (!obj || typeof obj !== 'object') return;

      if (obj.videoRenderer) {
        const vr = obj.videoRenderer;
        const vid = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || '';
        const isPlaylist = typeof vid === 'string' && (vid.startsWith('PL') || vid.startsWith('UU') || vid.startsWith('RD') || vid.startsWith('FL') || vid.length > 25);
        if (vid && !isPlaylist && title && !seenIds.has(vid)) {
          seenIds.add(vid);
          const desc = (vr.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || '').trim();
          const channelTitle =
            vr.ownerText?.runs?.[0]?.text ||
            vr.shortBylineText?.runs?.[0]?.text ||
            '';
          const videoChannelId =
            vr.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
            vr.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;
          results.push({
            videoId: vid,
            title: title.trim().replace(/&amp;/g, '&'),
            description: desc,
            publishedAt: new Date(),
            duration: vr.lengthText?.simpleText,
            channelId: videoChannelId,
            channelTitle: channelTitle ? channelTitle.trim() : undefined,
          });
        }
      } else if (obj.lockupViewModel) {
        const lvm = obj.lockupViewModel;
        const vid =
          lvm.contentId ||
          lvm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
        const title = lvm.metadata?.lockupMetadataViewModel?.title?.content;
        if (vid && /^[a-zA-Z0-9_-]{11}$/.test(vid) && title && !seenIds.has(vid)) {
          seenIds.add(vid);
          results.push({
            videoId: vid,
            title: title.trim().replace(/&amp;/g, '&'),
            description: '',
            publishedAt: new Date(),
            duration:
              lvm.contentImage?.thumbnailViewModel?.overlays?.[0]
                ?.thumbnailBottomOverlayViewModel?.badges?.[0]
                ?.thumbnailBadgeViewModel?.text,
          });
        }
      }

      for (const key of Object.keys(obj)) {
        extractVideos(obj[key]);
      }
    }

    extractVideos(data);
    return results;
  } catch (err: any) {
    console.error('Error parsing YouTube search JSON:', err.message);
    return [];
  }
}

/**
 * Searches YouTube directly for targeted keywords (e.g. "Dr. Pradip Jamnadas fasting"
 * or "The Diary Of A CEO Dr. Jason Fung") to discover specific lectures and guest appearances.
 */
export async function scrapeYouTubeSearchVideos(
  query: string,
  customFetch?: FetchFn
): Promise<VideoEntry[]> {
  if (!query || !query.trim()) return [];
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
  const fetchFn = customFetch || fetch;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchFn(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) return [];
      const html = typeof res.text === 'function' ? await res.text() : String(res);
      return parseYouTubeSearchHtml(html);
    } catch (err: any) {
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      console.error(`Error searching YouTube for query "${query}":`, err.message);
      return [];
    }
  }
  return [];
}

/**
 * Resolves a raw UC channel ID, @handle, or channel URL to a canonical UC channel ID.
 */
export async function resolveYouTubeChannelId(
  input: string,
  customFetch?: FetchFn
): Promise<string | null> {
  if (!input) return null;
  const trimmed = input.trim();

  if (/^UC[\w-]{4,30}$/.test(trimmed)) return trimmed;

  const channelUrlMatch = trimmed.match(/\/channel\/(UC[\w-]{6,30})/);
  if (channelUrlMatch) return channelUrlMatch[1];

  let targetUrl = trimmed;
  if (!targetUrl.startsWith('http')) {
    targetUrl = targetUrl.startsWith('@')
      ? `https://www.youtube.com/${targetUrl}`
      : `https://www.youtube.com/@${targetUrl}`;
  }

  try {
    const fetchFn = customFetch || fetch;
    const res = await fetchFn(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return null;
    const html = typeof res.text === 'function' ? await res.text() : String(res);

    const match =
      html.match(/channel_id=(UC[\w-]{22})/) ||
      html.match(/"channelId":"(UC[\w-]{22})"/) ||
      html.match(/\/channel\/(UC[\w-]{22})/);

    return match ? match[1] : null;
  } catch (err: any) {
    console.error('Error resolving YouTube channel ID:', err.message);
    return null;
  }
}

/**
 * Fetches YouTube video entries for a given channel ID.
 * Tries the Atom RSS feed first; falls back to channel page scraping if feed returns non-200.
 */
export async function fetchChannelEntries(
  channelId: string,
  opts: {
    fetchXmlFn?: (url: string) => Promise<string>;
    customFetch?: FetchFn;
    customScrapeFn?: ScrapeFn;
    context?: string; // e.g. 'authority' | 'podcast' for error messages
  } = {}
): Promise<{ entries: VideoEntry[]; error?: string }> {
  const { fetchXmlFn, customFetch, customScrapeFn, context = 'channel' } = opts;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  // Path A: test-injected XML fetcher (unit tests)
  if (fetchXmlFn) {
    try {
      const xmlText = await fetchXmlFn(feedUrl);
      return { entries: parseYouTubeFeed(xmlText) };
    } catch (err: any) {
      return { entries: [], error: err.message || `Network error fetching ${context} feed` };
    }
  }

  // Path B: live fetch with fallback to channel scraper
  let feedStatus = 0;
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'DiabetesSupport-Harvester/1.0' } });
    if (res.ok) {
      const xmlText = await res.text();
      return { entries: parseYouTubeFeed(xmlText) };
    }
    feedStatus = res.status;
  } catch {
    // Network error — fall through to scraper
  }

  // Path C: channel scraper fallback
  const scraped = customScrapeFn
    ? await customScrapeFn(channelId)
    : await scrapeYouTubeChannelVideos(channelId, customFetch);

  if (scraped.length > 0) return { entries: scraped };

  return {
    entries: [],
    error: `Failed to fetch ${context} feed (HTTP ${feedStatus || 404}) and channel scraper returned no videos.`,
  };
}
