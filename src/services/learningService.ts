import { dbConnect } from '@/lib/dbConnect';
import { AuthorityModel } from '@/models/Authority';
import { LearningResourceModel } from '@/models/LearningResource';
import { IAuthority, ILearningResource, ResourceStatus, ValidationStatus } from '@/types/learning';

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
    const created = await AuthorityModel.create({
      ...data,
      slug,
      isActive: data.isActive ?? true,
      autoPublish: data.autoPublish ?? true,
      specialties: data.specialties || [],
    });
    return {
      ...(created.toObject ? created.toObject() : created),
      _id: (created as any)._id?.toString(),
    };
  }

  public static async updateAuthority(id: string, data: Partial<IAuthority>): Promise<IAuthority | null> {
    await dbConnect();
    const updated = await AuthorityModel.findByIdAndUpdate(
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
   * Syncs YouTube feed for a specific authority without hard-coded limits.
   */
  public static async syncAuthorityYouTubeFeed(
    authorityId: string,
    fetchXmlFn?: (url: string) => Promise<string>
  ): Promise<{ addedCount: number; errors: string[] }> {
    await dbConnect();
    const authority = await AuthorityModel.findById(authorityId);
    if (!authority || !authority.youtubeChannelId) {
      return { addedCount: 0, errors: ['Authority has no registered YouTube Channel ID'] };
    }

    const channelId = authority.youtubeChannelId.trim();
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    let xmlText = '';
    try {
      if (fetchXmlFn) {
        xmlText = await fetchXmlFn(feedUrl);
      } else {
        const res = await fetch(feedUrl, { headers: { 'User-Agent': 'DiabetesSupport-Harvester/1.0' } });
        if (!res.ok) {
          return { addedCount: 0, errors: [`Failed to fetch channel feed (HTTP ${res.status})`] };
        }
        xmlText = await res.text();
      }
    } catch (err: any) {
      return { addedCount: 0, errors: [err.message || 'Network error fetching YouTube feed'] };
    }

    const entries = this.parseYouTubeFeed(xmlText);
    let addedCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        // De-duplicate: check if video embedId already exists
        const existing = await LearningResourceModel.findOne({ embedId: entry.videoId });
        if (existing) {
          continue; // Already ingested
        }

        const takeaways = this.extractTakeaways(entry.description, entry.title);
        const status: ResourceStatus = authority.autoPublish ? 'published' : 'pending_review';

        const resourceSlug = this.generateSlug(entry.title) + '-' + entry.videoId.slice(0, 6);

        await LearningResourceModel.create({
          title: entry.title,
          slug: resourceSlug,
          type: 'video',
          authorityId: authority._id,
          authorityName: authority.name,
          authorityTitle: authority.title,
          authorityAvatar: authority.avatarUrl,
          summary: entry.description.slice(0, 300) || `Lecture by ${authority.name}`,
          keyTakeaways: takeaways,
          sourceUrl: `https://www.youtube.com/watch?v=${entry.videoId}`,
          platform: 'youtube',
          embedId: entry.videoId,
          thumbnailUrl: `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
          topics: authority.specialties.length > 0 ? authority.specialties : ['Metabolic Health'],
          status,
          validationStatus: 'healthy',
          publishedAt: entry.publishedAt,
        });

        addedCount++;
      } catch (err: any) {
        errors.push(`Error inserting video ${entry.videoId}: ${err.message}`);
      }
    }

    // Update authority's lastSyncAt
    await AuthorityModel.findByIdAndUpdate(authorityId, { lastSyncAt: new Date() });

    return { addedCount, errors };
  }

  /**
   * Syncs all active authorities with registered feeds.
   */
  public static async syncAllActiveAuthorities(): Promise<{ totalAdded: number; details: any[] }> {
    await dbConnect();
    const activeAuthorities = await AuthorityModel.find({ isActive: true });
    let totalAdded = 0;
    const details = [];

    for (const auth of activeAuthorities) {
      if (auth.youtubeChannelId) {
        const res = await this.syncAuthorityYouTubeFeed(auth._id.toString());
        totalAdded += res.addedCount;
        details.push({ authority: auth.name, added: res.addedCount, errors: res.errors });
      }
    }

    return { totalAdded, details };
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
