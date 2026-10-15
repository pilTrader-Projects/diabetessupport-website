import { formatAffiliateClickPayload } from '@/analytics/formatters/formatAffiliateClickPayload';
import { formatVideoEngagementPayload } from '@/analytics/formatters/formatVideoEngagementPayload';
import { calculateCompletionPercentage } from '@/analytics/utils/percentageCalculator';

describe('Analytics Formatters & Calculations', () => {
  describe('formatAffiliateClickPayload', () => {
    it('formats affiliate context into standard GA4 event parameters', () => {
      const context = {
        bookTitle: 'The Diabetes Code',
        cardPosition: 'right_sidebar',
        destinationUrl: 'https://amzn.to/example',
      };
      const pageLocation = 'https://www.beforethenumbers.org/learn';

      const payload = formatAffiliateClickPayload(context, pageLocation);

      expect(payload).toEqual({
        page_location: 'https://www.beforethenumbers.org/learn',
        affiliate_item: 'The Diabetes Code',
        card_layout_position: 'right_sidebar',
        destination_url: 'https://amzn.to/example',
      });
    });

    it('falls back to default strings if values are missing', () => {
      const context = {
        bookTitle: '',
        cardPosition: '',
        destinationUrl: '',
      };
      const payload = formatAffiliateClickPayload(context, '');

      expect(payload).toEqual({
        page_location: '',
        affiliate_item: 'unknown_item',
        card_layout_position: 'unknown_position',
        destination_url: '',
      });
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('calculates accurate percentages with one decimal precision', () => {
      expect(calculateCompletionPercentage(50, 200)).toBe(25);
      expect(calculateCompletionPercentage(33.333, 100)).toBe(33.3);
      expect(calculateCompletionPercentage(0, 100)).toBe(0);
    });

    it('caps completion percentage at 100%', () => {
      expect(calculateCompletionPercentage(150, 100)).toBe(100);
    });

    it('returns 0 when duration is 0 or negative', () => {
      expect(calculateCompletionPercentage(10, 0)).toBe(0);
      expect(calculateCompletionPercentage(10, -50)).toBe(0);
    });

    it('clamps negative current time to 0%', () => {
      expect(calculateCompletionPercentage(-10, 100)).toBe(0);
    });
  });

  describe('formatVideoEngagementPayload', () => {
    it('formats video engagement event with play action', () => {
      const payload = formatVideoEngagementPayload({
        videoTitle: 'Understanding Insulin Resistance',
        currentTime: 0,
        duration: 360,
        action: 'play',
      });

      expect(payload).toEqual({
        video_title: 'Understanding Insulin Resistance',
        video_current_time: 0,
        engagement_action: 'play',
        completion_percentage: 0,
      });
    });

    it('formats video engagement event with pause action', () => {
      const payload = formatVideoEngagementPayload({
        videoTitle: 'Understanding Insulin Resistance',
        currentTime: 90,
        duration: 360,
        action: 'pause',
      });

      expect(payload).toEqual({
        video_title: 'Understanding Insulin Resistance',
        video_current_time: 90,
        engagement_action: 'pause',
        completion_percentage: 25,
      });
    });

    it('formats video engagement event with heartbeat action', () => {
      const payload = formatVideoEngagementPayload({
        videoTitle: 'Understanding Insulin Resistance',
        currentTime: 180,
        duration: 360,
        action: 'heartbeat',
      });

      expect(payload).toEqual({
        video_title: 'Understanding Insulin Resistance',
        video_current_time: 180,
        engagement_action: 'heartbeat',
        completion_percentage: 50,
      });
    });
  });
});
