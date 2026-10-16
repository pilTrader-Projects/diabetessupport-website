import { dispatchAffiliateCardClick } from '@/analytics/dispatchers/dispatchAffiliateCardClick';
import { dispatchVideoEngagement } from '@/analytics/dispatchers/dispatchVideoEngagement';

describe('Analytics Dispatchers', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (global as any).window = {
      gtag: mockGtag,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispatchAffiliateCardClick dispatches affiliate_card_click with correct payload', () => {
    const payload = {
      page_location: 'https://www.beforethenumbers.org/learn',
      affiliate_item: 'Good Energy',
      card_layout_position: 'left_sidebar',
      destination_url: 'https://amazon.com/dp/B0CKW1',
    };

    const result = dispatchAffiliateCardClick(payload);

    expect(result).toBe(true);
    expect(mockGtag).toHaveBeenCalledWith('event', 'affiliate_card_click', payload);
  });

  it('dispatchVideoEngagement dispatches video_engagement with correct payload', () => {
    const payload = {
      video_title: 'Dr. Robert Lustig Lecture',
      video_current_time: 45.2,
      engagement_action: 'play' as const,
      completion_percentage: 12.5,
    };

    const result = dispatchVideoEngagement(payload);

    expect(result).toBe(true);
    expect(mockGtag).toHaveBeenCalledWith('event', 'video_engagement', payload);
  });
});
