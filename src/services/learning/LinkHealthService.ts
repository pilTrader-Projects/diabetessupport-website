/**
 * Link Health Service — Single Responsibility: YouTube video availability verification.
 *
 * @usecase Detects broken/deleted YouTube videos by polling oEmbed and updates
 *          the resource status to broken_link to prevent broken embeds in the public hub.
 */
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';

export class LinkHealthService {
  /**
   * Verifies if a YouTube video is still publicly available via oEmbed.
   */
  public static async validateYouTubeVideo(
    videoId: string,
    customFetch?: (url: string) => Promise<{ status: number }>
  ): Promise<'healthy' | 'broken'> {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    try {
      if (customFetch) {
        const res = await customFetch(oembedUrl);
        return res.status === 200 ? 'healthy' : 'broken';
      }
      const res = await fetch(oembedUrl, { method: 'GET' });
      return res.ok ? 'healthy' : 'broken';
    } catch {
      return 'broken';
    }
  }

  /**
   * Runs link health check on all published/pending YouTube video resources.
   */
  public static async runLinkRotHealthCheck(
    customFetch?: (url: string) => Promise<{ status: number }>
  ): Promise<{ checked: number; broken: number; updated: string[] }> {
    await dbConnect();
    const resources = await LearningResourceModel.find({
      type: { $in: ['video', 'podcast'] },
      platform: 'youtube',
      status: { $in: ['published', 'pending_review'] },
    }).lean();

    let checked = 0;
    let broken = 0;
    const updated: string[] = [];

    for (const res of resources as any[]) {
      if (res.embedId) {
        checked++;
        const isInvalidId = res.embedId.startsWith('PL') || res.embedId.length > 25;
        const health = isInvalidId ? 'broken' : await this.validateYouTubeVideo(res.embedId, customFetch);
        if (health === 'broken') {
          broken++;
          updated.push(res._id.toString());
          await LearningResourceModel.findByIdAndUpdate(res._id, {
            validationStatus: 'broken',
            status: 'broken_link',
            lastValidatedAt: new Date(),
          });
        } else {
          await LearningResourceModel.findByIdAndUpdate(res._id, {
            validationStatus: 'healthy',
            lastValidatedAt: new Date(),
          });
        }
      }
    }

    return { checked, broken, updated };
  }
}
