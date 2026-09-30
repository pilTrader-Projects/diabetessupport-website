/**
 * Client-side persistence and global event dispatcher for Curated Metabolic Saved Protocols.
 *
 * @usecase Synchronizes saved lectures, studies, and podcast episodes across the global Header
 * and /blog Hub using browser localStorage and CustomEvents.
 */
import { ILearningResource } from '@/types/learning';

export const SAVED_PROTOCOL_IDS_KEY = 'metabolic_saved_resources';
export const SAVED_PROTOCOL_ITEMS_KEY = 'metabolic_saved_items_cache';
export const PROTOCOL_UPDATE_EVENT = 'metabolic_saved_protocol_updated';

export interface ISavedProtocolSummary {
  _id: string;
  title: string;
  slug?: string;
  type: string;
  authorityName?: string;
  thumbnailUrl?: string;
  duration?: string;
  sourceUrl?: string;
  embedId?: string;
  savedAt?: number;
}

export function getSavedProtocolIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_PROTOCOL_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedProtocolItems(): ISavedProtocolSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_PROTOCOL_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProtocolResource(resource: ILearningResource | ISavedProtocolSummary): {
  isSaved: boolean;
  count: number;
} {
  if (typeof window === 'undefined' || !resource._id) return { isSaved: false, count: 0 };

  const currentIds = getSavedProtocolIds();
  const currentItems = getSavedProtocolItems();
  const alreadySaved = currentIds.includes(resource._id);

  let updatedIds: string[];
  let updatedItems: ISavedProtocolSummary[];
  let isSaved: boolean;

  if (alreadySaved) {
    // Toggle remove
    updatedIds = currentIds.filter((id) => id !== resource._id);
    updatedItems = currentItems.filter((item) => item._id !== resource._id);
    isSaved = false;
  } else {
    // Add
    updatedIds = [resource._id, ...currentIds.filter((id) => id !== resource._id)];
    const summary: ISavedProtocolSummary = {
      _id: resource._id,
      title: resource.title,
      slug: resource.slug,
      type: resource.type,
      authorityName: (resource as any).authorityName,
      thumbnailUrl: resource.thumbnailUrl,
      duration: (resource as any).duration,
      sourceUrl: (resource as any).sourceUrl,
      embedId: (resource as any).embedId,
      savedAt: Date.now(),
    };
    updatedItems = [summary, ...currentItems.filter((i) => i._id !== resource._id)];
    isSaved = true;
  }

  try {
    localStorage.setItem(SAVED_PROTOCOL_IDS_KEY, JSON.stringify(updatedIds));
    localStorage.setItem(SAVED_PROTOCOL_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (e) {
    console.error('Failed to update localStorage', e);
  }

  // Dispatch custom event for Header and any open components
  window.dispatchEvent(
    new CustomEvent(PROTOCOL_UPDATE_EVENT, {
      detail: {
        action: isSaved ? 'saved' : 'removed',
        resourceId: resource._id,
        resourceTitle: resource.title,
        count: updatedIds.length,
        items: updatedItems,
      },
    })
  );

  return { isSaved, count: updatedIds.length };
}

export function removeSavedProtocolResource(resourceId: string): number {
  if (typeof window === 'undefined' || !resourceId) return 0;
  const currentIds = getSavedProtocolIds();
  const currentItems = getSavedProtocolItems();

  const updatedIds = currentIds.filter((id) => id !== resourceId);
  const updatedItems = currentItems.filter((item) => item._id !== resourceId);

  try {
    localStorage.setItem(SAVED_PROTOCOL_IDS_KEY, JSON.stringify(updatedIds));
    localStorage.setItem(SAVED_PROTOCOL_ITEMS_KEY, JSON.stringify(updatedItems));
  } catch (e) {
    console.error('Failed to update localStorage', e);
  }

  window.dispatchEvent(
    new CustomEvent(PROTOCOL_UPDATE_EVENT, {
      detail: {
        action: 'removed',
        resourceId,
        count: updatedIds.length,
        items: updatedItems,
      },
    })
  );

  return updatedIds.length;
}
