/**
 * YouTube Sync Service — Single Responsibility: Ingesting and qualifying YouTube videos.
 *
 * @usecase Handles syncing authority channels and podcast channels against
 *          the AI relevance qualifier, persisting results as LearningResources.
 */
import { dbConnect } from '@/lib/dbConnect';
import { AuthorityModel } from '@/models/Authority';
import { PodcastChannelModel } from '@/models/PodcastChannel';
import { LearningResourceModel } from '@/models/LearningResource';
import { IAuthority, ResourceStatus } from '@/types/learning';
import { AiQualifierService } from '@/services/aiQualifierService';
import { generateSlug } from './shared/slugUtils';
import { extractTakeaways } from './shared/textUtils';
import {
  fetchChannelEntries,
  resolveYouTubeChannelId,
  scrapeYouTubeChannelVideos,
  scrapeYouTubeSearchVideos,
  parseYouTubeFeed,
  VideoEntry,
} from './shared/feedFetcher';

export type SyncResult = { addedCount: number; skippedCount: number; errors: string[] };
export type ScrapeFn = (channelId: string) => Promise<VideoEntry[]>;

export class YouTubeSyncService {
  /** Public re-exports of shared utilities (for barrel backward compat) */
  public static resolveYouTubeChannelId = resolveYouTubeChannelId;
  public static scrapeYouTubeChannelVideos = scrapeYouTubeChannelVideos;
  public static scrapeYouTubeSearchVideos = scrapeYouTubeSearchVideos;
  public static parseYouTubeFeed = parseYouTubeFeed;

  /**
   * Syncs YouTube feed for a specific authority with AI advocacy qualification.
   * Supports optional keywords to discover specific historical lectures (e.g. "fasting", "insulin").
   */
  public static async syncAuthorityYouTubeFeed(
    authorityId: string,
    fetchXmlFn?: (url: string) => Promise<string>,
    customAiFetch?: (url: string, init?: any) => Promise<any>,
    customScrapeFn?: ScrapeFn,
    options?: {
      keywords?: string[];
    }
  ): Promise<SyncResult> {
    await dbConnect();
    const authority = await AuthorityModel.findById(authorityId);
    if (!authority?.youtubeChannelId) {
      return { addedCount: 0, skippedCount: 0, errors: ['Authority has no registered YouTube Channel ID or handle'] };
    }

    const rawInput = authority.youtubeChannelId.trim();
    let channelId = rawInput;

    if (!/^UC[\w-]{4,30}$/.test(channelId)) {
      const resolved = await resolveYouTubeChannelId(channelId);
      if (resolved) {
        channelId = resolved;
        await AuthorityModel.findByIdAndUpdate(authorityId, { youtubeChannelId: resolved });
      } else {
        return {
          addedCount: 0,
          skippedCount: 0,
          errors: [`Could not resolve YouTube Channel ID from "${rawInput}". Please verify the @handle or channel URL.`],
        };
      }
    }

    const { entries, error } = await fetchChannelEntries(channelId, {
      fetchXmlFn,
      customFetch: customAiFetch,
      customScrapeFn,
      context: 'authority',
    });

    const allEntries: VideoEntry[] = [...entries];
    const seenVideoIds = new Set<string>(entries.map((e) => e.videoId));

    // If keywords are provided, search YouTube for specific lectures by this doctor
    if (options?.keywords && options.keywords.length > 0) {
      for (const kw of options.keywords) {
        const searchQuery = `"${authority.name}" ${kw.trim()}`;
        const searchFetch = customAiFetch || (fetchXmlFn as any);
        const searchResults = await scrapeYouTubeSearchVideos(searchQuery, searchFetch);
        for (const item of searchResults) {
          if (!seenVideoIds.has(item.videoId)) {
            seenVideoIds.add(item.videoId);
            allEntries.push(item);
          }
        }
      }
    }

    if (error && allEntries.length === 0) {
      return { addedCount: 0, skippedCount: 0, errors: [error] };
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const entry of allEntries) {
      try {
        const existing = await LearningResourceModel.findOne({ embedId: entry.videoId });
        if (existing) continue;

        const resourceSlug = generateSlug(entry.title) + '-' + entry.videoId.slice(0, 6);
        const qualification = await AiQualifierService.qualifyResource({
          title: entry.title,
          description: entry.description,
          authorityName: authority.name,
          authoritySpecialties: authority.specialties,
          customFetch: customAiFetch,
        });

        const commonFields = {
          title: entry.title,
          slug: resourceSlug,
          type: 'video' as const,
          authorityId: authority._id,
          authorityName: authority.name,
          authorityTitle: authority.title,
          authorityAvatar: authority.avatarUrl,
          summary: entry.description.slice(0, 300) || `Lecture by ${authority.name}`,
          sourceUrl: `https://www.youtube.com/watch?v=${entry.videoId}`,
          platform: 'youtube' as const,
          embedId: entry.videoId,
          thumbnailUrl: `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
          relevanceScore: qualification.relevanceScore,
          relevanceReason: qualification.relevanceReason,
          validationStatus: 'healthy' as const,
          publishedAt: entry.publishedAt,
        };

        if (qualification.isRelevant) {
          const status: ResourceStatus = authority.autoPublish ? 'published' : 'pending_review';
          const topics =
            qualification.matchedTopics.length > 0
              ? qualification.matchedTopics
              : authority.specialties.length > 0
              ? authority.specialties
              : ['Metabolic Health'];

          await LearningResourceModel.create({
            ...commonFields,
            keyTakeaways:
              qualification.suggestedTakeaways.length > 0
                ? qualification.suggestedTakeaways
                : extractTakeaways(entry.description, entry.title),
            topics,
            status,
          });
          addedCount++;
        } else {
          await LearningResourceModel.create({
            ...commonFields,
            keyTakeaways: qualification.suggestedTakeaways,
            topics: qualification.matchedTopics,
            status: 'rejected' as const,
          });
          skippedCount++;
        }
      } catch (err: any) {
        errors.push(`Error evaluating video ${entry.videoId}: ${err.message}`);
      }
    }

    await AuthorityModel.findByIdAndUpdate(authorityId, { lastSyncAt: new Date() });
    return { addedCount, skippedCount, errors };
  }

  /**
   * Syncs YouTube feed for a monitored podcast channel to discover guest appearances of registered authorities.
   */
  public static async syncPodcastChannelYouTubeFeed(
    podcastChannelId: string,
    fetchXmlFn?: (url: string) => Promise<string>,
    customAiFetch?: (url: string, init?: any) => Promise<any>,
    customScrapeFn?: ScrapeFn,
    options?: {
      keywords?: string[];
      searchGuestAuthorities?: boolean;
    }
  ): Promise<SyncResult> {
    await dbConnect();
    const channel = await PodcastChannelModel.findById(podcastChannelId);
    if (!channel?.youtubeChannelId) {
      return { addedCount: 0, skippedCount: 0, errors: ['Podcast channel has no registered YouTube Channel ID or handle'] };
    }

    const rawInput = channel.youtubeChannelId.trim();
    let channelId = rawInput;

    if (!/^UC[\w-]{4,30}$/.test(channelId)) {
      const resolved = await resolveYouTubeChannelId(channelId);
      if (resolved) {
        channelId = resolved;
        await PodcastChannelModel.findByIdAndUpdate(podcastChannelId, { youtubeChannelId: resolved });
      } else {
        return {
          addedCount: 0,
          skippedCount: 0,
          errors: [`Could not resolve YouTube Channel ID from "${rawInput}". Please verify the @handle or channel URL.`],
        };
      }
    }

    const { entries, error } = await fetchChannelEntries(channelId, {
      fetchXmlFn,
      customFetch: customAiFetch,
      customScrapeFn,
      context: 'podcast',
    });

    const candidateAuthorities = (await AuthorityModel.find({ isActive: true }).lean()) as IAuthority[];
    const allEntries: VideoEntry[] = [...entries];
    const seenVideoIds = new Set<string>(entries.map((e) => e.videoId));

    const searchFetch = customAiFetch || (fetchXmlFn as any);

    // Targeted Guest Search: Query this podcast show paired with each registered authority to find historical guest appearances
    if (options?.searchGuestAuthorities === true && candidateAuthorities.length > 0) {
      for (const auth of candidateAuthorities) {
        const query = `"${channel.name}" "${auth.name}"`;
        const searchResults = await scrapeYouTubeSearchVideos(query, searchFetch);
        for (const item of searchResults) {
          if (!seenVideoIds.has(item.videoId)) {
            seenVideoIds.add(item.videoId);
            allEntries.push(item);
          }
        }
      }
    }

    // Also search any custom keywords for this channel (e.g. "diabetes", "fasting", "metabolism")
    const customKeywords = [
      ...(options?.keywords || []),
      ...(channel.podcastKeywords ? channel.podcastKeywords.split(',').map((k) => k.trim()) : []),
    ];
    for (const kw of customKeywords) {
      if (!kw) continue;
      const query = `"${channel.name}" ${kw}`;
      const searchResults = await scrapeYouTubeSearchVideos(query, searchFetch);
      for (const item of searchResults) {
        if (!seenVideoIds.has(item.videoId)) {
          seenVideoIds.add(item.videoId);
          allEntries.push(item);
        }
      }
    }

    if (error && allEntries.length === 0) {
      return { addedCount: 0, skippedCount: 0, errors: [error] };
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const entry of allEntries) {
      try {
        const existing = await LearningResourceModel.findOne({ embedId: entry.videoId });
        if (existing) continue;

        const resourceSlug = generateSlug(entry.title) + '-' + entry.videoId.slice(0, 6);
        const qualification = await AiQualifierService.qualifyPodcastEpisode({
          title: entry.title,
          description: entry.description,
          podcastChannelName: channel.name,
          candidateAuthorities,
          customFetch: customAiFetch,
        });

        const commonFields = {
          title: entry.title,
          slug: resourceSlug,
          type: 'podcast' as const,
          podcastChannelId: channel._id,
          podcastChannelName: channel.name,
          summary: entry.description.slice(0, 300) || `Episode from ${channel.name}`,
          sourceUrl: `https://www.youtube.com/watch?v=${entry.videoId}`,
          platform: 'youtube' as const,
          embedId: entry.videoId,
          thumbnailUrl: `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
          relevanceScore: qualification.relevanceScore,
          relevanceReason: qualification.relevanceReason,
          validationStatus: 'healthy' as const,
          publishedAt: entry.publishedAt,
          keyTakeaways: qualification.suggestedTakeaways,
          topics: qualification.matchedTopics,
        };

        if (qualification.isRelevant && qualification.matchedAuthority) {
          const matchedAuth = qualification.matchedAuthority;
          const status: ResourceStatus = channel.autoPublish ? 'published' : 'pending_review';
          const topics =
            qualification.matchedTopics.length > 0
              ? qualification.matchedTopics
              : matchedAuth.specialties?.length > 0
              ? matchedAuth.specialties
              : ['Metabolic Health', 'Podcast'];

          await LearningResourceModel.create({
            ...commonFields,
            authorityId: matchedAuth._id,
            authorityName: matchedAuth.name,
            authorityTitle: matchedAuth.title,
            authorityAvatar: matchedAuth.avatarUrl,
            isGuestAppearance: true,
            keyTakeaways:
              qualification.suggestedTakeaways.length > 0
                ? qualification.suggestedTakeaways
                : extractTakeaways(entry.description, entry.title),
            topics,
            status,
          });
          addedCount++;
        } else {
          await LearningResourceModel.create({
            ...commonFields,
            authorityId: qualification.matchedAuthority?._id,
            authorityName: qualification.matchedAuthority?.name,
            isGuestAppearance: !!qualification.matchedAuthority,
            status: 'rejected' as const,
          });
          skippedCount++;
        }
      } catch (err: any) {
        errors.push(`Error evaluating podcast video ${entry.videoId}: ${err.message}`);
      }
    }

    await PodcastChannelModel.findByIdAndUpdate(podcastChannelId, { lastSyncAt: new Date() });
    return { addedCount, skippedCount, errors };
  }
}
