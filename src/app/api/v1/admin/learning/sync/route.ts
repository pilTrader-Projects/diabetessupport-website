import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const POST = withAdminAuth(async (req) => {
  let body: any = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  if (body.podcastChannelId) {
    const res = await LearningService.syncPodcastChannelYouTubeFeed(
      body.podcastChannelId,
      undefined,
      undefined,
      undefined,
      {
        keywords: Array.isArray(body.keywords) ? body.keywords : body.keywords ? [body.keywords] : undefined,
        searchGuestAuthorities:
          body.searchGuestAuthorities === true ||
          (Array.isArray(body.keywords) ? body.keywords.length > 0 : Boolean(body.keywords)),
      }
    );
    return NextResponse.json({ success: true, data: res });
  }
  if (body.authorityId) {
    const res = await LearningService.syncAuthorityYouTubeFeed(
      body.authorityId,
      undefined,
      undefined,
      undefined,
      {
        keywords: Array.isArray(body.keywords) ? body.keywords : body.keywords ? [body.keywords] : undefined,
      }
    );
    return NextResponse.json({ success: true, data: res });
  }
  const res = await LearningService.syncAllActiveAuthorities();
  return NextResponse.json({ success: true, data: res });
});
