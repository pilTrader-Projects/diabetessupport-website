/**
 * Learning Resource Service — Single Responsibility: CRUD for curated learning resources.
 *
 * @usecase Manages videos, podcasts, studies and articles cataloged in the Learning Hub.
 */
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { ILearningResource } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import { generateSlug } from './shared/slugUtils';

export class LearningResourceService {
  public static async listResources(filter?: {
    type?: string;
    topic?: string;
    authorityId?: string;
    podcastChannelId?: string;
    isGuestAppearance?: boolean;
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ resources: ILearningResource[]; total: number }> {
    await dbConnect();
    const query: any = {};

    if (filter?.status) query.status = filter.status;
    if (filter?.type && filter.type !== 'all') query.type = filter.type;
    if (filter?.authorityId) query.authorityId = filter.authorityId;
    if (filter?.podcastChannelId) query.podcastChannelId = filter.podcastChannelId;
    if (filter?.isGuestAppearance !== undefined) query.isGuestAppearance = filter.isGuestAppearance;
    if (filter?.topic && filter.topic !== 'all') {
      query.topics = { $regex: new RegExp(`^${filter.topic}$`, 'i') };
    }
    if (filter?.search) {
      const tokens = filter.search
        .trim()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      if (tokens.length > 0) {
        query.$and = tokens.map((token) => {
          const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, 'i');
          return {
            $or: [
              { title: regex },
              { summary: regex },
              { authorityName: regex },
              { podcastChannelName: regex },
              { topics: regex },
              { keyTakeaways: regex },
            ],
          };
        });
      }
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
      podcastChannelId: doc.podcastChannelId?.toString(),
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
    const slug = data.slug || generateSlug(data.title || 'resource') + '-' + Date.now().toString(36);
    const cleanedBooks = (data.recommendedBooks || []).map((b) => ({
      ...b,
      affiliateUrl: ensureAffiliateUrl(b.affiliateUrl),
    }));

    const created = await LearningResourceModel.create({
      ...data,
      slug,
      keyTakeaways: data.keyTakeaways || [],
      topics: data.topics || [],
      status: data.status || 'published',
      validationStatus: data.validationStatus || 'unverified',
      recommendedBooks: cleanedBooks,
    });
    return {
      ...(created.toObject ? created.toObject() : created),
      _id: (created as any)._id?.toString(),
    };
  }

  public static async updateResource(id: string, data: Partial<ILearningResource>): Promise<ILearningResource | null> {
    await dbConnect();
    const updatePayload = { ...data };
    if (data.recommendedBooks) {
      updatePayload.recommendedBooks = data.recommendedBooks.map((b) => ({
        ...b,
        affiliateUrl: ensureAffiliateUrl(b.affiliateUrl),
      }));
    }

    const updated = await LearningResourceModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).lean();
    if (!updated) return null;
    return { ...(updated as any), _id: (updated as any)._id?.toString() };
  }

  public static async deleteResource(id: string): Promise<boolean> {
    await dbConnect();
    const res = await LearningResourceModel.findByIdAndDelete(id);
    return !!res;
  }
}
