/**
 * Syndication Orchestrator — Single Responsibility: Coordinates periodic cron syndication.
 *
 * @usecase Iterates all active authorities and podcast channels, delegates to YouTubeSyncService,
 *          and aggregates results. This is the only class that knows about both sync services.
 */
import { dbConnect } from '@/lib/dbConnect';
import { AuthorityModel } from '@/models/Authority';
import { PodcastChannelModel } from '@/models/PodcastChannel';
import { YouTubeSyncService, ScrapeFn } from './YouTubeSyncService';

export type CronSyndicationResult = {
  processedAuthorities: number;
  processedPodcastChannels: number;
  totalAdded: number;
  totalSkipped: number;
  details: Array<{
    authority?: string;
    channel?: string;
    name: string;
    type: 'authority' | 'podcast_channel';
    added: number;
    skipped: number;
    errors: string[];
  }>;
};

export class SyndicationOrchestrator {
  public static async runCronSyndication(
    fetchXmlFn?: (url: string) => Promise<string>,
    customAiFetch?: (url: string, init?: any) => Promise<any>,
    customScrapeFn?: ScrapeFn
  ): Promise<CronSyndicationResult> {
    await dbConnect();
    const activeAuthorities = (await AuthorityModel.find({ isActive: true })) || [];
    const activePodcastChannels = (await PodcastChannelModel.find({ isActive: true })) || [];
    let totalAdded = 0;
    let totalSkipped = 0;
    const details: CronSyndicationResult['details'] = [];

    for (const auth of activeAuthorities) {
      if (auth.youtubeChannelId) {
        const res = await YouTubeSyncService.syncAuthorityYouTubeFeed(
          auth._id.toString(),
          fetchXmlFn,
          customAiFetch,
          customScrapeFn
        );
        totalAdded += res.addedCount;
        totalSkipped += res.skippedCount;
        details.push({
          authority: auth.name,
          name: auth.name,
          type: 'authority',
          added: res.addedCount,
          skipped: res.skippedCount,
          errors: res.errors,
        });
      }
    }

    for (const channel of activePodcastChannels) {
      if (channel.youtubeChannelId) {
        const res = await YouTubeSyncService.syncPodcastChannelYouTubeFeed(
          channel._id.toString(),
          fetchXmlFn,
          customAiFetch,
          customScrapeFn
        );
        totalAdded += res.addedCount;
        totalSkipped += res.skippedCount;
        details.push({
          channel: channel.name,
          name: channel.name,
          type: 'podcast_channel',
          added: res.addedCount,
          skipped: res.skippedCount,
          errors: res.errors,
        });
      }
    }

    return {
      processedAuthorities: activeAuthorities.length,
      processedPodcastChannels: activePodcastChannels.length,
      totalAdded,
      totalSkipped,
      details,
    };
  }

  /** Alias used by the admin sync route */
  public static async syncAllActiveAuthorities(): Promise<{
    totalAdded: number;
    totalSkipped: number;
    details: any[];
  }> {
    const result = await this.runCronSyndication();
    return {
      totalAdded: result.totalAdded,
      totalSkipped: result.totalSkipped,
      details: result.details,
    };
  }
}
