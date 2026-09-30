/**
 * Learning Hub Services Barrel — Backward-compatible facade.
 *
 * All existing consumers (`import { LearningService } from '@/services/learningService'`)
 * are unaffected. The old monolith is now replaced by this barrel + the focused services below.
 *
 * @exports LearningService  — aggregated static namespace for all learning operations
 * @exports individual services for direct use in new code
 */
import { AuthorityService } from './AuthorityService';
import { PodcastChannelService } from './PodcastChannelService';
import { LearningResourceService } from './LearningResourceService';
import { YouTubeSyncService } from './YouTubeSyncService';
import { SyndicationOrchestrator } from './SyndicationOrchestrator';
import { LinkHealthService } from './LinkHealthService';

export { AuthorityService };
export { PodcastChannelService };
export { LearningResourceService };
export { YouTubeSyncService };
export { SyndicationOrchestrator };
export { LinkHealthService };
export { serializeRecommendedBooks } from './AuthorityService';
export { generateSlug } from './shared/slugUtils';
export { extractTakeaways } from './shared/textUtils';
export {
  resolveYouTubeChannelId,
  parseYouTubeFeed,
  scrapeYouTubeChannelVideos,
  fetchChannelEntries,
} from './shared/feedFetcher';
export type { VideoEntry } from './shared/feedFetcher';
export type { SyncResult, ScrapeFn } from './YouTubeSyncService';
export type { CronSyndicationResult } from './SyndicationOrchestrator';

/**
 * LearningService — Aggregated static facade that composes all focused services.
 * Preserves the exact method signatures of the old monolith for zero-change backward compatibility.
 */
export class LearningService {
  // ── Authority ─────────────────────────────────────────────────────────────
  static listAuthorities = AuthorityService.listAuthorities.bind(AuthorityService);
  static getAuthorityById = AuthorityService.getAuthorityById.bind(AuthorityService);
  static updateAuthority = AuthorityService.updateAuthority.bind(AuthorityService);
  static deleteAuthority = AuthorityService.deleteAuthority.bind(AuthorityService);

  /** createAuthority wires the initial sync callback into AuthorityService */
  static createAuthority: typeof AuthorityService.createAuthority = (data) =>
    AuthorityService.createAuthority(data, async (authorityId) => {
      await YouTubeSyncService.syncAuthorityYouTubeFeed(authorityId);
    });

  // ── Podcast Channel ────────────────────────────────────────────────────────
  static listPodcastChannels = PodcastChannelService.listPodcastChannels.bind(PodcastChannelService);
  static getPodcastChannelById = PodcastChannelService.getPodcastChannelById.bind(PodcastChannelService);
  static updatePodcastChannel = PodcastChannelService.updatePodcastChannel.bind(PodcastChannelService);
  static deletePodcastChannel = PodcastChannelService.deletePodcastChannel.bind(PodcastChannelService);

  /** createPodcastChannel wires the initial sync callback */
  static createPodcastChannel: typeof PodcastChannelService.createPodcastChannel = (data) =>
    PodcastChannelService.createPodcastChannel(data, async (channelId) => {
      await YouTubeSyncService.syncPodcastChannelYouTubeFeed(channelId);
    });

  // ── Learning Resource ──────────────────────────────────────────────────────
  static listResources = LearningResourceService.listResources.bind(LearningResourceService);
  static getResourceById = LearningResourceService.getResourceById.bind(LearningResourceService);
  static createResource = LearningResourceService.createResource.bind(LearningResourceService);
  static updateResource = LearningResourceService.updateResource.bind(LearningResourceService);
  static deleteResource = LearningResourceService.deleteResource.bind(LearningResourceService);

  // ── YouTube Sync ───────────────────────────────────────────────────────────
  static resolveYouTubeChannelId = YouTubeSyncService.resolveYouTubeChannelId;
  static parseYouTubeFeed = YouTubeSyncService.parseYouTubeFeed;
  static scrapeYouTubeChannelVideos = YouTubeSyncService.scrapeYouTubeChannelVideos;
  static syncAuthorityYouTubeFeed = YouTubeSyncService.syncAuthorityYouTubeFeed.bind(YouTubeSyncService);
  static syncPodcastChannelYouTubeFeed = YouTubeSyncService.syncPodcastChannelYouTubeFeed.bind(YouTubeSyncService);

  // ── Syndication ────────────────────────────────────────────────────────────
  static runCronSyndication = SyndicationOrchestrator.runCronSyndication.bind(SyndicationOrchestrator);
  static syncAllActiveAuthorities = SyndicationOrchestrator.syncAllActiveAuthorities.bind(SyndicationOrchestrator);

  // ── Link Health ────────────────────────────────────────────────────────────
  static validateYouTubeVideo = LinkHealthService.validateYouTubeVideo.bind(LinkHealthService);
  static runLinkRotHealthCheck = LinkHealthService.runLinkRotHealthCheck.bind(LinkHealthService);

  // ── Shared Utils ───────────────────────────────────────────────────────────
  static generateSlug(text: string) {
    const { generateSlug: fn } = require('./shared/slugUtils');
    return fn(text);
  }
  static extractTakeaways(description: string, title: string) {
    const { extractTakeaways: fn } = require('./shared/textUtils');
    return fn(description, title);
  }
}
