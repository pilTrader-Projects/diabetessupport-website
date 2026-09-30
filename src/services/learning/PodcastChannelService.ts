/**
 * Podcast Channel Service — Single Responsibility: CRUD for monitored podcast channels.
 *
 * @usecase Manages the roster of podcast shows (e.g. DOAC, Huberman Lab)
 *          whose YouTube channels are monitored for guest appearances by registered authorities.
 */
import { dbConnect } from '@/lib/dbConnect';
import { PodcastChannelModel } from '@/models/PodcastChannel';
import { IPodcastChannel } from '@/types/learning';
import { generateSlug } from './shared/slugUtils';
import { resolveYouTubeChannelId } from './shared/feedFetcher';

export class PodcastChannelService {
  public static async listPodcastChannels(filter?: { activeOnly?: boolean }): Promise<IPodcastChannel[]> {
    await dbConnect();
    const query: any = {};
    if (filter?.activeOnly) query.isActive = true;
    const channels = await PodcastChannelModel.find(query).sort({ displayOrder: 1, name: 1 }).lean();
    return channels.map((doc: any) => ({ ...doc, _id: doc._id?.toString() })) as IPodcastChannel[];
  }

  public static async getPodcastChannelById(id: string): Promise<IPodcastChannel | null> {
    await dbConnect();
    const channel = await PodcastChannelModel.findById(id).lean();
    if (!channel) return null;
    return { ...(channel as any), _id: (channel as any)._id?.toString() };
  }

  public static async createPodcastChannel(
    data: Partial<IPodcastChannel>,
    onCreated?: (channelId: string) => Promise<void>
  ): Promise<IPodcastChannel> {
    await dbConnect();
    const slug = data.slug || generateSlug(data.name || 'podcast-channel');
    let resolvedChannelId = data.youtubeChannelId?.trim();
    if (resolvedChannelId) {
      const canonicalId = await resolveYouTubeChannelId(resolvedChannelId);
      if (canonicalId) resolvedChannelId = canonicalId;
    }

    const created = await PodcastChannelModel.create({
      ...data,
      slug,
      youtubeChannelId: resolvedChannelId,
      isActive: data.isActive ?? true,
      autoPublish: data.autoPublish ?? true,
    });

    const podcastChannelId = (created as any)._id?.toString();

    if (resolvedChannelId && podcastChannelId && onCreated) {
      try {
        await onCreated(podcastChannelId);
      } catch (err: any) {
        console.warn(`Initial sync for ${created.name} encountered error:`, err.message);
      }
    }

    return {
      ...(created.toObject ? created.toObject() : created),
      _id: podcastChannelId,
    };
  }

  public static async updatePodcastChannel(id: string, data: Partial<IPodcastChannel>): Promise<IPodcastChannel | null> {
    await dbConnect();
    const updatePayload = { ...data };
    if (updatePayload.youtubeChannelId) {
      const canonicalId = await resolveYouTubeChannelId(updatePayload.youtubeChannelId);
      if (canonicalId) updatePayload.youtubeChannelId = canonicalId;
    }

    const updated = await PodcastChannelModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).lean();
    if (!updated) return null;
    return { ...(updated as any), _id: (updated as any)._id?.toString() };
  }

  public static async deletePodcastChannel(id: string): Promise<boolean> {
    await dbConnect();
    const res = await PodcastChannelModel.findByIdAndDelete(id);
    return !!res;
  }
}
