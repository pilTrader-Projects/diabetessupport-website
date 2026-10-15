import { createVideoTracker } from '@/analytics/trackers/videoTracker';

describe('videoTracker', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockGtag = jest.fn();
    (global as any).window = {
      gtag: mockGtag,
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('tracks initial play event with 0 currentTime and percentage', () => {
    const tracker = createVideoTracker({
      videoTitle: 'The Metabolic Model of Disease',
      duration: 600,
      heartbeatIntervalMs: 5000,
    });

    tracker.trackPlay(0);

    expect(mockGtag).toHaveBeenCalledWith('event', 'video_engagement', {
      video_title: 'The Metabolic Model of Disease',
      video_current_time: 0,
      engagement_action: 'play',
      completion_percentage: 0,
    });
  });

  it('tracks pause event with current progress', () => {
    const tracker = createVideoTracker({
      videoTitle: 'The Metabolic Model of Disease',
      duration: 600,
    });

    tracker.trackPlay(150);
    tracker.trackPause(150);

    expect(mockGtag).toHaveBeenCalledWith('event', 'video_engagement', {
      video_title: 'The Metabolic Model of Disease',
      video_current_time: 150,
      engagement_action: 'pause',
      completion_percentage: 25,
    });
  });

  it('emits periodic heartbeat events while video is playing', () => {
    const tracker = createVideoTracker({
      videoTitle: 'The Metabolic Model of Disease',
      duration: 100,
      heartbeatIntervalMs: 10000,
    });

    tracker.trackPlay(10);
    expect(mockGtag).toHaveBeenCalledTimes(1); // 1 play event

    // Advance by 10s (first heartbeat)
    tracker.updateCurrentTime(20);
    jest.advanceTimersByTime(10000);

    expect(mockGtag).toHaveBeenCalledTimes(2);
    expect(mockGtag).toHaveBeenLastCalledWith('event', 'video_engagement', {
      video_title: 'The Metabolic Model of Disease',
      video_current_time: 20,
      engagement_action: 'heartbeat',
      completion_percentage: 20,
    });

    // Advance by another 10s (second heartbeat)
    tracker.updateCurrentTime(30);
    jest.advanceTimersByTime(10000);

    expect(mockGtag).toHaveBeenCalledTimes(3);
    expect(mockGtag).toHaveBeenLastCalledWith('event', 'video_engagement', {
      video_title: 'The Metabolic Model of Disease',
      video_current_time: 30,
      engagement_action: 'heartbeat',
      completion_percentage: 30,
    });
  });

  it('stops heartbeat interval when video is paused or destroyed', () => {
    const tracker = createVideoTracker({
      videoTitle: 'The Metabolic Model of Disease',
      duration: 100,
      heartbeatIntervalMs: 10000,
    });

    tracker.trackPlay(10);
    expect(mockGtag).toHaveBeenCalledTimes(1);

    tracker.trackPause(15);
    expect(mockGtag).toHaveBeenCalledTimes(2); // play + pause

    // Advancing timer after pause should NOT trigger heartbeat
    jest.advanceTimersByTime(20000);
    expect(mockGtag).toHaveBeenCalledTimes(2);

    tracker.destroy();
  });
});
