/**
 * Learning Resource Service — Single Responsibility: CRUD for curated learning resources.
 *
 * @usecase Manages videos, podcasts, studies and articles cataloged in the Learning Hub.
 */
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { AuthorityModel } from '@/models/Authority';
import { ILearningResource, IAffiliateRecommendation } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import { getRecommendedBooksForAuthority } from '@/config/affiliateBooks';
import { generateSlug } from './shared/slugUtils';
import { serializeRecommendedBooks } from './AuthorityService';

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

    // Cascading Books Resolution:
    // Identify authorityIds for resources with empty recommendedBooks
    const authorityIdsToFetch = Array.from(
      new Set(
        docs
          .filter((d: any) => !d.recommendedBooks || d.recommendedBooks.length === 0)
          .map((d: any) => d.authorityId?.toString())
          .filter(Boolean)
      )
    );

    const authorityBooksById = new Map<string, IAffiliateRecommendation[]>();
    if (authorityIdsToFetch.length > 0) {
      const authDocs = await AuthorityModel.find({ _id: { $in: authorityIdsToFetch } }).lean();
      for (const a of authDocs) {
        const books = serializeRecommendedBooks(
          a.recommendedBooks && a.recommendedBooks.length > 0
            ? a.recommendedBooks
            : getRecommendedBooksForAuthority(a.slug || a.name)
        );
        if (books.length > 0) {
          authorityBooksById.set(a._id.toString(), books);
        }
      }
    }

    const resources = docs.map((doc: any) => {
      const explicitBooks = serializeRecommendedBooks(doc.recommendedBooks || []);
      const inheritedBooks =
        explicitBooks.length > 0
          ? explicitBooks
          : (doc.authorityId && authorityBooksById.get(doc.authorityId.toString())) ||
            getRecommendedBooksForAuthority(doc.authorityName || doc.slug);

      return {
        ...doc,
        _id: doc._id?.toString(),
        authorityId: doc.authorityId?.toString(),
        podcastChannelId: doc.podcastChannelId?.toString(),
        recommendedBooks: inheritedBooks || [],
      };
    }) as ILearningResource[];

    return { resources, total };
  }

  public static async getResourceById(id: string): Promise<ILearningResource | null> {
    await dbConnect();
    const doc = await LearningResourceModel.findById(id).lean();
    if (!doc) return null;

    let books = serializeRecommendedBooks((doc as any).recommendedBooks || []);
    if (books.length === 0 && (doc as any).authorityId) {
      const auth = await AuthorityModel.findById((doc as any).authorityId).lean();
      if (auth) {
        books = serializeRecommendedBooks(
          (auth as any).recommendedBooks && (auth as any).recommendedBooks.length > 0
            ? (auth as any).recommendedBooks
            : getRecommendedBooksForAuthority((auth as any).slug || (auth as any).name)
        );
      }
    }

    if (books.length === 0) {
      books = getRecommendedBooksForAuthority((doc as any).authorityName || (doc as any).slug);
    }

    return {
      ...(doc as any),
      _id: (doc as any)._id?.toString(),
      authorityId: (doc as any).authorityId?.toString(),
      recommendedBooks: books,
    };
  }

  public static async createResource(data: Partial<ILearningResource>): Promise<ILearningResource> {
    await dbConnect();
    const slug = data.slug || generateSlug(data.title || 'resource') + '-' + Date.now().toString(36);
    const cleanedBooks = (data.recommendedBooks || []).map(({ _id: _stripped, ...b }: any) => ({
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
      updatePayload.recommendedBooks = data.recommendedBooks.map(({ _id: _stripped, ...b }: any) => ({
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
    return {
      ...(updated as any),
      _id: (updated as any)._id?.toString(),
      recommendedBooks: serializeRecommendedBooks((updated as any).recommendedBooks || []),
    };
  }

  public static async deleteResource(id: string): Promise<boolean> {
    await dbConnect();
    const res = await LearningResourceModel.findByIdAndDelete(id);
    return !!res;
  }
}
