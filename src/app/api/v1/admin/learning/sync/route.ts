import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';
import { PodcastChannelModel } from '@/models/PodcastChannel';

export const POST = withAdminAuth(async (req) => {
  let body: any = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  let podcastChannelId = body.podcastChannelId || body.podcastId || body.channelId;
  let authorityId = body.authorityId || body.authorId;

  // If a generic `id` is passed, resolve whether it belongs to a podcast channel or an authority
  if (!podcastChannelId && !authorityId && body.id) {
    const isPodcast = await PodcastChannelModel.exists({ _id: body.id });
    if (isPodcast) {
      podcastChannelId = body.id;
    } else {
      authorityId = body.id;
    }
  }

  // Parse keywords cleanly whether array or comma-separated string
  let parsedKeywords: string[] | undefined;
  if (Array.isArray(body.keywords)) {
    parsedKeywords = body.keywords.map((k: any) => String(k).trim()).filter(Boolean);
  } else if (typeof body.keywords === 'string' && body.keywords.trim()) {
    parsedKeywords = body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  }

  if (podcastChannelId) {
    const res = await LearningService.syncPodcastChannelYouTubeFeed(
      podcastChannelId,
      undefined,
      undefined,
      undefined,
      {
        keywords: parsedKeywords,
        searchGuestAuthorities:
          body.searchGuestAuthorities === true ||
          (parsedKeywords && parsedKeywords.length > 0),
      }
    );
    return NextResponse.json({ success: true, data: res });
  }

  if (authorityId) {
    const res = await LearningService.syncAuthorityYouTubeFeed(
      authorityId,
      undefined,
      undefined,
      undefined,
      {
        keywords: parsedKeywords,
      }
    );
    return NextResponse.json({ success: true, data: res });
  }

  const res = await LearningService.syncAllActiveAuthorities();
  return NextResponse.json({ success: true, data: res });
});
