/**
 * Authority Service — Single Responsibility: CRUD for monitored authorities.
 *
 * @usecase Manages the roster of medical doctors, researchers, and scientists
 *          whose YouTube channels and publications are tracked for content ingestion.
 */
import { dbConnect } from '@/lib/dbConnect';
import { AuthorityModel } from '@/models/Authority';
import { IAuthority, IAffiliateRecommendation } from '@/types/learning';
import { getRecommendedBooksForAuthority } from '@/config/affiliateBooks';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import { generateSlug } from './shared/slugUtils';
import { resolveYouTubeChannelId } from './shared/feedFetcher';

/**
 * Sanitizes recommended book items so they are safe plain objects for Client Components.
 * Converts any BSON ObjectId into a plain string and prevents Next.js RSC toJSON errors.
 */
export function serializeRecommendedBooks(books: any[] = []): IAffiliateRecommendation[] {
  if (!Array.isArray(books)) return [];
  return books.map((b: any) => ({
    _id: b._id ? b._id.toString() : (b.affiliateUrl || b.title),
    title: b.title || '',
    author: b.author || '',
    authoritySlug: b.authoritySlug || '',
    type: b.type || 'book',
    subtitle: b.subtitle || '',
    description: b.description || '',
    affiliateUrl: b.affiliateUrl || '',
    coverUrl: b.coverUrl || '',
    badgeText: b.badgeText || '',
    platformName: b.platformName || 'Amazon',
    topics: Array.isArray(b.topics) ? b.topics.map((t: any) => String(t)) : [],
  }));
}

export class AuthorityService {
  public static async listAuthorities(filter?: { activeOnly?: boolean }): Promise<IAuthority[]> {
    await dbConnect();
    const query: any = {};
    if (filter?.activeOnly) query.isActive = true;
    const authorities = await AuthorityModel.find(query).sort({ displayOrder: 1, name: 1 }).lean();
    return authorities.map((doc: any) => ({
      ...doc,
      _id: doc._id?.toString(),
      recommendedBooks: serializeRecommendedBooks(
        doc.recommendedBooks?.length > 0
          ? doc.recommendedBooks
          : getRecommendedBooksForAuthority(doc.slug || doc.name)
      ),
    })) as IAuthority[];
  }

  public static async getAuthorityById(id: string): Promise<IAuthority | null> {
    await dbConnect();
    const authority = await AuthorityModel.findById(id).lean();
    if (!authority) return null;
    const doc = authority as any;
    return {
      ...doc,
      _id: doc._id?.toString(),
      recommendedBooks: serializeRecommendedBooks(
        doc.recommendedBooks?.length > 0
          ? doc.recommendedBooks
          : getRecommendedBooksForAuthority(doc.slug || doc.name)
      ),
    };
  }

  public static async createAuthority(
    data: Partial<IAuthority>,
    onCreated?: (authorityId: string) => Promise<void>
  ): Promise<IAuthority> {
    await dbConnect();
    const slug = data.slug || generateSlug(data.name || 'authority');
    let resolvedChannelId = data.youtubeChannelId?.trim();
    if (resolvedChannelId) {
      const canonicalId = await resolveYouTubeChannelId(resolvedChannelId);
      if (canonicalId) resolvedChannelId = canonicalId;
    }

    const cleanedBooks = (data.recommendedBooks || []).map(({ _id: _stripped, ...b }: any) => ({
      ...b,
      affiliateUrl: ensureAffiliateUrl(b.affiliateUrl),
    }));

    const created = await AuthorityModel.create({
      ...data,
      slug,
      youtubeChannelId: resolvedChannelId,
      isActive: data.isActive ?? true,
      autoPublish: data.autoPublish ?? true,
      specialties: data.specialties || [],
      recommendedBooks: cleanedBooks,
    });

    const authorityId = (created as any)._id?.toString();

    if (resolvedChannelId && authorityId && onCreated) {
      try {
        await onCreated(authorityId);
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
      const canonicalId = await resolveYouTubeChannelId(updatePayload.youtubeChannelId);
      if (canonicalId) updatePayload.youtubeChannelId = canonicalId;
    }
    if (data.recommendedBooks) {
      updatePayload.recommendedBooks = data.recommendedBooks.map(({ _id: _stripped, ...b }: any) => ({
        ...b,
        affiliateUrl: ensureAffiliateUrl(b.affiliateUrl),
      }));
    }

    const updated = await AuthorityModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).lean();
    if (!updated) return null;
    return { ...(updated as any), _id: (updated as any)._id?.toString() };
  }

  public static async deleteAuthority(id: string): Promise<boolean> {
    await dbConnect();
    const res = await AuthorityModel.findByIdAndDelete(id);
    return !!res;
  }
}
