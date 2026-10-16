import {
  AffiliateCardClickPayload,
  AffiliateCardContext,
} from '@/analytics/types/analyticsTypes';
import {
  DEFAULT_AFFILIATE_ITEM,
  DEFAULT_LAYOUT_POSITION,
} from '@/analytics/constants/analyticsConstants';

/**
 * Formats extracted affiliate card context and current page location into a clean GA4 event payload.
 *
 * @param context Extracted affiliate card attributes.
 * @param pageLocation Current window location URL.
 * @returns AffiliateCardClickPayload adhering strictly to GA4 specification.
 */
export function formatAffiliateClickPayload(
  context: AffiliateCardContext,
  pageLocation: string
): AffiliateCardClickPayload {
  return {
    page_location: pageLocation || '',
    affiliate_item: context.bookTitle || DEFAULT_AFFILIATE_ITEM,
    card_layout_position: context.cardPosition || DEFAULT_LAYOUT_POSITION,
    destination_url: context.destinationUrl || '',
  };
}
