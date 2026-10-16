import { handleYouTubeMessage } from '@/analytics/handlers/handleYouTubeMessage';
import { VideoTrackerInstance } from '@/analytics/types/analyticsTypes';

describe('handleYouTubeMessage', () => {
  let mockTracker: VideoTrackerInstance;

  beforeEach(() => {
    mockTracker = {
      trackPlay: jest.fn(),
      trackPause: jest.fn(),
      trackHeartbeat: jest.fn(),
      updateCurrentTime: jest.fn(),
      updateDuration: jest.fn(),
      destroy: jest.fn(),
      getState: jest.fn(),
    };
  });

  it('triggers trackPlay when playerState is 1 (PLAYING)', () => {
    const event = {
      origin: 'https://www.youtube-nocookie.com',
      data: JSON.stringify({
        event: 'onStateChange',
        info: 1,
      }),
    } as MessageEvent;

    handleYouTubeMessage(event, mockTracker);

    expect(mockTracker.trackPlay).toHaveBeenCalled();
  });

  it('triggers trackPause when playerState is 2 (PAUSED)', () => {
    const event = {
      origin: 'https://www.youtube-nocookie.com',
      data: JSON.stringify({
        event: 'onStateChange',
        info: 2,
      }),
    } as MessageEvent;

    handleYouTubeMessage(event, mockTracker);

    expect(mockTracker.trackPause).toHaveBeenCalled();
  });

  it('updates currentTime and duration from infoDelivery messages', () => {
    const event = {
      origin: 'https://www.youtube-nocookie.com',
      data: JSON.stringify({
        event: 'infoDelivery',
        info: {
          currentTime: 42.5,
          duration: 300,
        },
      }),
    } as MessageEvent;

    handleYouTubeMessage(event, mockTracker);

    expect(mockTracker.updateCurrentTime).toHaveBeenCalledWith(42.5);
    expect(mockTracker.updateDuration).toHaveBeenCalledWith(300);
  });

  it('gracefully ignores non-YouTube messages and invalid JSON', () => {
    const invalidJsonEvent = {
      origin: 'https://other-site.com',
      data: 'invalid { json',
    } as MessageEvent;

    expect(() => handleYouTubeMessage(invalidJsonEvent, mockTracker)).not.toThrow();
    expect(mockTracker.trackPlay).not.toHaveBeenCalled();
    expect(mockTracker.trackPause).not.toHaveBeenCalled();
  });
});
