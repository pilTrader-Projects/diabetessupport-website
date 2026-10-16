import { parseDurationToSeconds } from '@/analytics/utils/durationParser';
import { bindYouTubeIframeTracking } from '@/analytics/trackers/bindYouTubeIframeTracking';
import { getCurrentPageLocation } from '@/analytics/utils/locationExtractor';
import { createVideoTracker } from '@/analytics/trackers/videoTracker';
import { handleAffiliateClick } from '@/analytics/handlers/handleAffiliateClick';
import { attachAffiliateTracking } from '@/analytics/trackers/affiliateTracker';
import { handleYouTubeMessage } from '@/analytics/handlers/handleYouTubeMessage';
import * as AnalyticsBarrel from '@/analytics/index';

describe('Analytics Pipeline Full Coverage Tests', () => {
  describe('durationParser', () => {
    it('handles numeric inputs correctly', () => {
      expect(parseDurationToSeconds(120)).toBe(120);
      expect(parseDurationToSeconds(0)).toBe(0);
      expect(parseDurationToSeconds(-5)).toBe(0);
      expect(parseDurationToSeconds(NaN)).toBe(0);
    });

    it('handles undefined and non-string inputs', () => {
      expect(parseDurationToSeconds(undefined)).toBe(0);
      expect(parseDurationToSeconds(null as any)).toBe(0);
      expect(parseDurationToSeconds({} as any)).toBe(0);
    });

    it('handles purely numeric strings', () => {
      expect(parseDurationToSeconds('300')).toBe(300);
      expect(parseDurationToSeconds('  45.5  ')).toBe(45.5);
    });

    it('parses MM:SS formatted strings', () => {
      expect(parseDurationToSeconds('12:30')).toBe(750);
      expect(parseDurationToSeconds('05:00')).toBe(300);
    });

    it('parses HH:MM:SS formatted strings', () => {
      expect(parseDurationToSeconds('01:02:03')).toBe(3723);
      expect(parseDurationToSeconds('2:00:00')).toBe(7200);
    });

    it('handles single part strings and invalid non-numeric parts', () => {
      expect(parseDurationToSeconds('45')).toBe(45);
      expect(parseDurationToSeconds('invalid:format')).toBe(0);
      expect(parseDurationToSeconds('1:2:3:4')).toBe(0);
    });
  });

  describe('locationExtractor edge cases', () => {
    it('returns empty string when window or location is missing', () => {
      expect(getCurrentPageLocation(undefined)).toBe('');
      expect(getCurrentPageLocation({} as any)).toBe('');
      expect(getCurrentPageLocation({ location: {} } as any)).toBe('');
    });
  });

  describe('bindYouTubeIframeTracking', () => {
    it('handles window without addEventListener safely', () => {
      const mockTracker: any = { trackPlay: jest.fn() };
      const cleanup = bindYouTubeIframeTracking(mockTracker, {} as any);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('registers and triggers message event on target window', () => {
      const mockTracker: any = {
        trackPlay: jest.fn(),
        trackPause: jest.fn(),
        updateCurrentTime: jest.fn(),
        updateDuration: jest.fn(),
      };

      let listener: any = null;
      const mockWin: any = {
        addEventListener: jest.fn((event: string, handler: any) => {
          if (event === 'message') listener = handler;
        }),
        removeEventListener: jest.fn(),
      };

      const cleanup = bindYouTubeIframeTracking(mockTracker, mockWin);
      expect(mockWin.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));

      // Simulate incoming YouTube message
      listener({
        origin: 'https://www.youtube.com',
        data: JSON.stringify({ event: 'onStateChange', info: 1 }),
      });

      expect(mockTracker.trackPlay).toHaveBeenCalled();

      cleanup();
      expect(mockWin.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  describe('videoTracker edge cases & state', () => {
    it('tracks direct heartbeat and validates duration/time updates', () => {
      const mockGtag = jest.fn();
      const mockWin: any = { gtag: mockGtag };

      const tracker = createVideoTracker({
        videoTitle: 'Test Video',
        duration: 200,
        win: mockWin,
      });

      expect(tracker.getState()).toEqual({
        videoTitle: 'Test Video',
        duration: 200,
        currentTime: 0,
        isPlaying: false,
      });

      tracker.updateCurrentTime(-10); // should clamp to 0
      expect(tracker.getState().currentTime).toBe(0);

      tracker.updateCurrentTime(50);
      expect(tracker.getState().currentTime).toBe(50);

      tracker.updateDuration(300);
      expect(tracker.getState().duration).toBe(300);

      tracker.updateDuration(-50); // negative ignored
      expect(tracker.getState().duration).toBe(300);

      tracker.trackHeartbeat(75, 300);
      expect(mockGtag).toHaveBeenCalledWith('event', 'video_engagement', {
        video_title: 'Test Video',
        video_current_time: 75,
        engagement_action: 'heartbeat',
        completion_percentage: 25,
      });

      tracker.trackPlay(10, 300);
      expect(tracker.getState().isPlaying).toBe(true);

      tracker.trackPause(15, 300);
      expect(tracker.getState().isPlaying).toBe(false);

      tracker.destroy();
    });
  });

  describe('affiliateTracker edge cases', () => {
    it('safely handles missing document or invalid target in attachAffiliateTracking', () => {
      const cleanup = attachAffiliateTracking({} as any);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('handles event without stopPropagation gracefully', () => {
      const mockAnchor = {
        getAttribute: jest.fn((attr: string) => {
          if (attr === 'data-click-type') return 'affiliate_card';
          if (attr === 'data-book-title') return 'Test Book';
          if (attr === 'data-card-position') return 'left_sidebar';
          if (attr === 'href') return 'https://amazon.com';
          return null;
        }),
        closest: jest.fn(),
      };
      mockAnchor.closest.mockReturnValue(mockAnchor);

      const mockEvent = {
        target: mockAnchor,
      };

      const mockWin: any = {
        location: { href: 'https://example.com' },
        gtag: jest.fn(),
      };

      const handled = handleAffiliateClick(mockEvent as any, mockWin);
      expect(handled).toBe(true);
      expect(mockWin.gtag).toHaveBeenCalled();
    });
  });

  describe('handleYouTubeMessage extended branch tests', () => {
    it('handles raw object payload (non-string JSON)', () => {
      const mockTracker: any = {
        trackPlay: jest.fn(),
        trackPause: jest.fn(),
        updateCurrentTime: jest.fn(),
        updateDuration: jest.fn(),
      };

      const event = {
        data: {
          event: 'infoDelivery',
          info: {
            currentTime: 60,
            duration: 180,
            playerState: 2,
          },
        },
      } as any;

      handleYouTubeMessage(event, mockTracker);
      expect(mockTracker.updateCurrentTime).toHaveBeenCalledWith(60);
      expect(mockTracker.updateDuration).toHaveBeenCalledWith(180);
      expect(mockTracker.trackPause).toHaveBeenCalled();
    });

    it('ignores null or non-object events safely', () => {
      const mockTracker: any = { trackPlay: jest.fn() };
      handleYouTubeMessage(null as any, mockTracker);
      handleYouTubeMessage({ data: 123 } as any, mockTracker);
      expect(mockTracker.trackPlay).not.toHaveBeenCalled();
    });
  });

  describe('Analytics Barrel Export Verification', () => {
    it('exports all constants, utils, handlers, and trackers cleanly', () => {
      expect(AnalyticsBarrel.GA4_EVENTS).toBeDefined();
      expect(AnalyticsBarrel.VIDEO_ENGAGEMENT_ACTIONS).toBeDefined();
      expect(AnalyticsBarrel.createVideoTracker).toBeDefined();
      expect(AnalyticsBarrel.attachAffiliateTracking).toBeDefined();
      expect(AnalyticsBarrel.handleAffiliateClick).toBeDefined();
      expect(AnalyticsBarrel.handleYouTubeMessage).toBeDefined();
      expect(AnalyticsBarrel.formatAffiliateClickPayload).toBeDefined();
      expect(AnalyticsBarrel.formatVideoEngagementPayload).toBeDefined();
      expect(AnalyticsBarrel.dispatchAffiliateCardClick).toBeDefined();
      expect(AnalyticsBarrel.dispatchVideoEngagement).toBeDefined();
    });
  });
});
