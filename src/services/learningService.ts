import { dbConnect } from '@/lib/dbConnect';
import { AuthorityModel } from '@/models/Authority';
import { LearningResourceModel } from '@/models/LearningResource';
import { IAuthority, ILearningResource, ResourceStatus, ValidationStatus } from '@/types/learning';
import { AiQualifierService } from './aiQualifierService';

/**
 * Service orchestrating Learning Authorities, Curated Materials, Ingestion & Link Health.
 *
 * @usecase Manages dynamic authority feeds, automatic YouTube RSS ingestion, and automated link-rot validation.
 */
export class LearningService {
  /**
   * Generates a URL-friendly slug from a text string.
   */
  public static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Resolves a raw 24-char UC channel ID, @handle, or channel URL to a canonical UC channel ID.
   */
  public static async resolveYouTubeChannelId(
    input: string,
    customFetch?: (url: string, init?: any) => Promise<any>
  ): Promise<string | null> {
    if (!input) return null;
    const trimmed = input.trim();

    // Case 1: Already a Channel ID starting with UC
    if (/^UC[\w-]{6,30}$/.test(trimmed)) {
      return trimmed;
    }

    // Case 2: URL containing /channel/(UC...)
    const channelUrlMatch = trimmed.match(/\/channel\/(UC[\w-]{6,30})/);
    if (channelUrlMatch) {
      return channelUrlMatch[1];
    }

    // Case 3: Handle or custom URL (e.g. @benbikman or https://www.youtube.com/@benbikman)
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

      if (match) {
        return match[1];
      }
    } catch (err: any) {
      console.error('Error resolving YouTube channel ID:', err.message);
    }

    return null;
  }

  /* =========================================================================
   * AUTHORITY CRUD OPERATIONS
   * ========================================================================= */

  public static async listAuthorities(filter?: { activeOnly?: boolean }): Promise<IAuthority[]> {
    await dbConnect();
    const query: any = {};
    if (filter?.activeOnly) {
      query.isActive = true;
    }
    const authorities = await AuthorityModel.find(query).sort({ displayOrder: 1, name: 1 }).lean();
    return authorities.map((doc: any) => ({
      ...doc,
      _id: doc._id?.toString(),
    })) as IAuthority[];
  }

  public static async getAuthorityById(id: string): Promise<IAuthority | null> {
    await dbConnect();
    const authority = await AuthorityModel.findById(id).lean();
    if (!authority) return null;
    return {
      ...(authority as any),
      _id: (authority as any)._id?.toString(),
    };
  }

  public static async createAuthority(data: Partial<IAuthority>): Promise<IAuthority> {
    await dbConnect();
    const slug = data.slug || this.generateSlug(data.name || 'authority');
    let resolvedChannelId = data.youtubeChannelId?.trim();
    if (resolvedChannelId) {
      const canonicalId = await this.resolveYouTubeChannelId(resolvedChannelId);
      if (canonicalId) {
        resolvedChannelId = canonicalId;
      }
    }

    const created = await AuthorityModel.create({
      ...data,
      slug,
      youtubeChannelId: resolvedChannelId,
      isActive: data.isActive ?? true,
      autoPublish: data.autoPublish ?? true,
      specialties: data.specialties || [],
    });

    const authorityId = (created as any)._id?.toString();

    // Trigger initial ingestion and AI qualification once at the time authority is added
    if (resolvedChannelId && authorityId) {
      try {
        await this.syncAuthorityYouTubeFeed(authorityId);
      } catch (err: any) {
        console.warn(`Initial sync for ${created.name} encountered error:`, err.message);
      }
    }

    return {
      ...(created.toObject ? created.toObject() : created),
      _id: authorityId,
    };
  }

  public static async updateAuthority(id: string, data: Partial<IAuthority>): Promise<IAuthority | null> {
    await dbConnect();
    const updatePayload = { ...data };
    if (updatePayload.youtubeChannelId) {
      const canonicalId = await this.resolveYouTubeChannelId(updatePayload.youtubeChannelId);
      if (canonicalId) {
        updatePayload.youtubeChannelId = canonicalId;
      }
    }

    const updated = await AuthorityModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return null;
    return {
      ...(updated as any),
      _id: (updated as any)._id?.toString(),
    };
  }

  public static async deleteAuthority(id: string): Promise<boolean> {
    await dbConnect();
    const res = await AuthorityModel.findByIdAndDelete(id);
    return !!res;
  }

  /* =========================================================================
   * LEARNING RESOURCE CRUD OPERATIONS
   * ========================================================================= */

  public static async listResources(filter?: {
    type?: string;
    topic?: string;
    authorityId?: string;
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ resources: ILearningResource[]; total: number }> {
    await dbConnect();
    const query: any = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.type && filter.type !== 'all') {
      query.type = filter.type;
    }
    if (filter?.authorityId) {
      query.authorityId = filter.authorityId;
    }
    if (filter?.topic && filter.topic !== 'all') {
      query.topics = { $regex: new RegExp(`^${filter.topic}$`, 'i') };
    }
    if (filter?.search) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { authorityName: searchRegex },
        { topics: searchRegex },
      ];
    }

    const total = await LearningResourceModel.countDocuments(query);
    let q = LearningResourceModel.find(query).sort({ publishedAt: -1, createdAt: -1 });

    if (filter?.skip) q = q.skip(filter.skip);
    if (filter?.limit) q = q.limit(filter.limit);

    const docs = await q.lean();
    const resources = docs.map((doc: any) => ({
      ...doc,
      _id: doc._id?.toString(),
      authorityId: doc.authorityId?.toString(),
    })) as ILearningResource[];

    return { resources, total };
  }

  public static async getResourceById(id: string): Promise<ILearningResource | null> {
    await dbConnect();
    const doc = await LearningResourceModel.findById(id).lean();
    if (!doc) return null;
    return {
      ...(doc as any),
      _id: (doc as any)._id?.toString(),
      authorityId: (doc as any).authorityId?.toString(),
    };
  }

  public static async createResource(data: Partial<ILearningResource>): Promise<ILearningResource> {
    await dbConnect();
    const slug = data.slug || this.generateSlug(data.title || 'resource') + '-' + Date.now().toString(36);
    const created = await LearningResourceModel.create({
      ...data,
      slug,
      keyTakeaways: data.keyTakeaways || [],
      topics: data.topics || [],
      status: data.status || 'published',
      validationStatus: data.validationStatus || 'unverified',
    });
    return {
      ...(created.toObject ? created.toObject() : created),
      _id: (created as any)._id?.toString(),
    };
  }

  public static async updateResource(id: string, data: Partial<ILearningResource>): Promise<ILearningResource | null> {
    await dbConnect();
    const updated = await LearningResourceModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return null;
    return {
      ...(updated as any),
      _id: (updated as any)._id?.toString(),
    };
  }

  public static async deleteResource(id: string): Promise<boolean> {
    await dbConnect();
    const res = await LearningResourceModel.findByIdAndDelete(id);
    return !!res;
  }

  /* =========================================================================
   * AUTOMATED YOUTUBE RSS PARSING & INGESTION
   * ========================================================================= */

  /**
   * Parses official YouTube Atom RSS XML into structured video items.
   */
  public static parseYouTubeFeed(xmlContent: string): {
    videoId: string;
    title: string;
    description: string;
    publishedAt: Date;
  }[] {
    const items: { videoId: string; title: string; description: string; publishedAt: Date }[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match: RegExpExecArray | null;

    while ((match = entryRegex.exec(xmlContent)) !== null) {
      const entryXml = match[1];

      const videoIdMatch = entryXml.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entryXml.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/);
      const descMatch = entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/);

      if (videoIdMatch && titleMatch) {
        items.push({
          videoId: videoIdMatch[1].trim(),
          title: titleMatch[1].trim().replace(/&amp;/g, '&'),
          description: descMatch ? descMatch[1].trim() : '',
          publishedAt: publishedMatch ? new Date(publishedMatch[1].trim()) : new Date(),
        });
      }
    }

    return items;
  }

  /**
   * Automatically extracts 2-4 key takeaways from descriptions or generates formatted takeaways.
   */
  public static extractTakeaways(description: string, title: string): string[] {
    const takeaways: string[] = [];
    const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Look for numbered or bulleted items
      if (/^(\d+[\.\)]|•|-|\*)\s+(.+)/.test(line)) {
        const cleaned = line.replace(/^(\d+[\.\)]|•|-|\*)\s+/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          takeaways.push(cleaned);
        }
      }
      if (takeaways.length >= 3) break;
    }

    // Fallback if no formatted bullets found
    if (takeaways.length === 0) {
      takeaways.push(`Key scientific overview presented on ${title}.`);
      takeaways.push(`Clinical context and lifestyle implications for metabolic health.`);
      takeaways.push(`Practical takeaways on fasting schedules and carbohydrate management.`);
    }

    return takeaways;
  }

  /**
   * Syncs YouTube feed for a specific authority with AI advocacy qualification.
   */
  public static async syncAuthorityYouTubeFeed(
    authorityId: string,
    fetchXmlFn?: (url: string) => Promise<string>,
    customAiFetch?: (url: string, init?: any) => Promise<any>
  ): Promise<{ addedCount: number; skippedCount: number; errors: string[] }> {
    await dbConnect();
    const authority = await AuthorityModel.findById(authorityId);
    if (!authority || !authority.youtubeChannelId) {
      return { addedCount: 0, skippedCount: 0, errors: ['Authority has no registered YouTube Channel ID or handle'] };
    }

    const rawInput = authority.youtubeChannelId.trim();
    let channelId = rawInput;

    // If input is not a standard UC ID, auto-resolve handle/URL
    if (!/^UC[\w-]{6,30}$/.test(channelId)) {
      const resolved = await this.resolveYouTubeChannelId(channelId);
      if (resolved) {
        channelId = resolved;
        // Persist resolved UC ID back to database for fast future syncs
        await AuthorityModel.findByIdAndUpdate(authorityId, { youtubeChannelId: resolved });
      } else {
        return {
          addedCount: 0,
          skippedCount: 0,
          errors: [
            `Could not resolve YouTube Channel ID from "${rawInput}". Please verify the @handle or channel URL.`,
          ],
        };
      }
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    let xmlText = '';
    try {
      if (fetchXmlFn) {
        xmlText = await fetchXmlFn(feedUrl);
      } else {
        const res = await fetch(feedUrl, { headers: { 'User-Agent': 'DiabetesSupport-Harvester/1.0' } });
        if (!res.ok) {
          return { addedCount: 0, skippedCount: 0, errors: [`Failed to fetch channel feed (HTTP ${res.status})`] };
        }
        xmlText = await res.text();
      }
    } catch (err: any) {
      return { addedCount: 0, skippedCount: 0, errors: [err.message || 'Network error fetching YouTube feed'] };
    }

    const entries = this.parseYouTubeFeed(xmlText);
    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        // De-duplicate: check if video embedId already exists
        const existing = await LearningResourceModel.findOne({ embedId: entry.videoId });
        if (existing) {
          continue; // Already processed in past sync
        }

        const resourceSlug = this.generateSlug(entry.title) + '-' + entry.videoId.slice(0, 6);

        // Run through AI relevance qualification engine
        const qualification = await AiQualifierService.qualifyResource({
          title: entry.title,
          description: entry.description,
          authorityName: authority.name,
          authoritySpecialties: authority.specialties,
          customFetch: customAiFetch,
        });

        if (qualification.isRelevant) {
          const status: ResourceStatus = authority.autoPublish ? 'published' : 'pending_review';
          const topics =
            qualification.matchedTopics.length > 0
              ? qualification.matchedTopics
              : authority.specialties.length > 0
              ? authority.specialties
              : ['Metabolic Health'];

          await LearningResourceModel.create({
            title: entry.title,
            slug: resourceSlug,
            type: 'video',
            authorityId: authority._id,
            authorityName: authority.name,
            authorityTitle: authority.title,
            authorityAvatar: authority.avatarUrl,
            summary: entry.description.slice(0, 300) || `Lecture by ${authority.name}`,
            keyTakeaways:
              qualification.suggestedTakeaways.length > 0
                ? qualification.suggestedTakeaways
                : this.extractTakeaways(entry.description, entry.title),
            sourceUrl: `https://www.youtube.com/watch?v=${entry.videoId}`,
            platform: 'youtube',
            embedId: entry.videoId,
            thumbnailUrl: `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
            topics,
            status,
            relevanceScore: qualification.relevanceScore,
            relevanceReason: qualification.relevanceReason,
            validationStatus: 'healthy',
            publishedAt: entry.publishedAt,
          });

          addedCount++;
        } else {
          // Record as rejected to avoid re-evaluating on subsequent cron jobs and give admin full visibility
          await LearningResourceModel.create({
            title: entry.title,
            slug: resourceSlug,
            type: 'video',
            authorityId: authority._id,
            authorityName: authority.name,
            authorityTitle: authority.title,
            authorityAvatar: authority.avatarUrl,
            summary: entry.description.slice(0, 300) || `Lecture by ${authority.name}`,
            keyTakeaways: qualification.suggestedTakeaways,
            sourceUrl: `https://www.youtube.com/watch?v=${entry.videoId}`,
            platform: 'youtube',
            embedId: entry.videoId,
            thumbnailUrl: `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
            topics: qualification.matchedTopics,
            status: 'rejected',
            relevanceScore: qualification.relevanceScore,
            relevanceReason: qualification.relevanceReason,
            validationStatus: 'healthy',
            publishedAt: entry.publishedAt,
          });

          skippedCount++;
        }
      } catch (err: any) {
        errors.push(`Error evaluating video ${entry.videoId}: ${err.message}`);
      }
    }

    // Update authority's lastSyncAt
    await AuthorityModel.findByIdAndUpdate(authorityId, { lastSyncAt: new Date() });

    return { addedCount, skippedCount, errors };
  }

  /**
   * Cron syndication engine that monitors active authorities for new additions since last run,
   * runs them through the AI qualifier engine, and either publishes or skips each item.
   */
  public static async runCronSyndication(
    fetchXmlFn?: (url: string) => Promise<string>,
    customAiFetch?: (url: string, init?: any) => Promise<any>
  ): Promise<{
    processedAuthorities: number;
    totalAdded: number;
    totalSkipped: number;
    details: Array<{ authority: string; added: number; skipped: number; errors: string[] }>;
  }> {
    await dbConnect();
    const activeAuthorities = await AuthorityModel.find({ isActive: true });
    let totalAdded = 0;
    let totalSkipped = 0;
    const details = [];

    for (const auth of activeAuthorities) {
      if (auth.youtubeChannelId) {
        const res = await this.syncAuthorityYouTubeFeed(auth._id.toString(), fetchXmlFn, customAiFetch);
        totalAdded += res.addedCount;
        totalSkipped += res.skippedCount;
        details.push({
          authority: auth.name,
          added: res.addedCount,
          skipped: res.skippedCount,
          errors: res.errors,
        });
      }
    }

    return {
      processedAuthorities: activeAuthorities.length,
      totalAdded,
      totalSkipped,
      details,
    };
  }

  /**
   * Syncs all active authorities with registered feeds (alias for runCronSyndication).
   */
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

  /* =========================================================================
   * AUTOMATED LINK-ROT HEALTH CHECK ENGINE
   * ========================================================================= */

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
   * Runs link health check on cataloged resources.
   */
  public static async runLinkRotHealthCheck(
    customFetch?: (url: string) => Promise<{ status: number }>
  ): Promise<{ checked: number; broken: number; updated: string[] }> {
    await dbConnect();
    const resources = await LearningResourceModel.find({
      type: 'video',
      platform: 'youtube',
      status: { $in: ['published', 'pending_review'] },
    }).lean();

    let checked = 0;
    let broken = 0;
    const updated: string[] = [];

    for (const res of resources as any[]) {
      if (res.embedId) {
        checked++;
        const health = await this.validateYouTubeVideo(res.embedId, customFetch);
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
