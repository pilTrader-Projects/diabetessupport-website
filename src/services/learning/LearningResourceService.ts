/**
 * Learning Resource Service — Single Responsibility: CRUD for curated learning resources.
 *
 * @usecase Manages videos, podcasts, studies and articles cataloged in the Learning Hub.
 */
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { AuthorityModel } from '@/models/Authority';
import { ILearningResource, IAffiliateRecommendation, IAuthority } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import { generateSlug } from './shared/slugUtils';
import { serializeRecommendedBooks } from './AuthorityService';
import { resolveRecommendedBooks } from '@/lib/recommendationResolver';

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
    // Gather distinct authorityIds and authorityNames for resources without explicit books
    const unassignedDocs = docs.filter(
      (d: any) => !d.recommendedBooks || d.recommendedBooks.length === 0
    );

    const authorityIds = Array.from(
      new Set(unassignedDocs.map((d: any) => d.authorityId?.toString()).filter(Boolean))
    );
    const authorityNames = Array.from(
      new Set(unassignedDocs.map((d: any) => d.authorityName?.trim()).filter(Boolean))
    );

    let fetchedAuthorities: IAuthority[] = [];
    if (authorityIds.length > 0 || authorityNames.length > 0) {
      const orClauses: any[] = [];
      if (authorityIds.length > 0) orClauses.push({ _id: { $in: authorityIds } });
      if (authorityNames.length > 0) {
        orClauses.push({ name: { $in: authorityNames } });
        orClauses.push({
          slug: { $in: authorityNames.map((n) => n.toLowerCase().replace(/\s+/g, '-')) },
        });
      }

      const authDocs = await AuthorityModel.find({ $or: orClauses }).lean();
      fetchedAuthorities = authDocs.map((a: any) => ({
        ...a,
        _id: a._id?.toString(),
        recommendedBooks: serializeRecommendedBooks(a.recommendedBooks || []),
      })) as IAuthority[];
    }

    const resources = docs.map((doc: any) => {
      const explicitBooks = serializeRecommendedBooks(doc.recommendedBooks || []);
      const inheritedBooks = resolveRecommendedBooks(
        {
          recommendedBooks: explicitBooks,
          authorityId: doc.authorityId?.toString(),
          authorityName: doc.authorityName,
          slug: doc.slug,
        },
        fetchedAuthorities
      );

      return {
        ...doc,
        _id: doc._id?.toString(),
        authorityId: doc.authorityId?.toString(),
        podcastChannelId: doc.podcastChannelId?.toString(),
        recommendedBooks: inheritedBooks,
      };
    }) as ILearningResource[];

    return { resources, total };
  }

  public static async getResourceById(id: string): Promise<ILearningResource | null> {
    await dbConnect();
    const doc = await LearningResourceModel.findById(id).lean();
    if (!doc) return null;

    const explicitBooks = serializeRecommendedBooks((doc as any).recommendedBooks || []);
    let fetchedAuthorities: IAuthority[] = [];
    if (explicitBooks.length === 0) {
      const authId = (doc as any).authorityId?.toString();
      const authName = (doc as any).authorityName;
      const orClauses: any[] = [];
      if (authId) orClauses.push({ _id: authId });
      if (authName) {
        orClauses.push({ name: authName });
        orClauses.push({ slug: authName.toLowerCase().replace(/\s+/g, '-') });
      }

      if (orClauses.length > 0) {
        const authDocs = await AuthorityModel.find({ $or: orClauses }).lean();
        fetchedAuthorities = authDocs.map((a: any) => ({
          ...a,
          _id: a._id?.toString(),
          recommendedBooks: serializeRecommendedBooks(a.recommendedBooks || []),
        })) as IAuthority[];
      }
    }

    const books = resolveRecommendedBooks(
      {
        recommendedBooks: explicitBooks,
        authorityId: (doc as any).authorityId?.toString(),
        authorityName: (doc as any).authorityName,
        slug: (doc as any).slug,
      },
      fetchedAuthorities
    );

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
