import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  useVideoTracking,
  runVideoTrackingLifecycle,
} from '@/analytics/trackers/useVideoTracking';

function DummyVideoComponent({
  isOpen,
  title,
  duration,
}: {
  isOpen: boolean;
  title?: string;
  duration?: string;
}) {
  useVideoTracking(isOpen, title, duration);
  return <div data-testid="dummy-video">Video Player</div>;
}

describe('useVideoTracking Hook & runVideoTrackingLifecycle', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (global as any).window = {
      gtag: mockGtag,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders component cleanly with useVideoTracking without throwing in SSR', () => {
    const htmlClosed = ReactDOMServer.renderToString(
      <DummyVideoComponent isOpen={false} title="Test Title" duration="10:00" />
    );
    expect(htmlClosed).toContain('data-testid="dummy-video"');

    const htmlOpen = ReactDOMServer.renderToString(
      <DummyVideoComponent isOpen={true} title="Test Title" duration="10:00" />
    );
    expect(htmlOpen).toContain('data-testid="dummy-video"');
  });

  it('returns undefined when isOpen is false or title is empty', () => {
    expect(runVideoTrackingLifecycle(false, 'Test Video', '10:00')).toBeUndefined();
    expect(runVideoTrackingLifecycle(true, '', '10:00')).toBeUndefined();
    expect(runVideoTrackingLifecycle(true, undefined, '10:00')).toBeUndefined();
  });

  it('executes full tracking lifecycle when active and cleans up on unmount', () => {
    const cleanup = runVideoTrackingLifecycle(true, 'Evidence-Based Fasting', '30:00');

    expect(mockGtag).toHaveBeenCalledWith('event', 'video_engagement', {
      video_title: 'Evidence-Based Fasting',
      video_current_time: 0,
      engagement_action: 'play',
      completion_percentage: 0,
    });
    expect((global as any).window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));

    expect(typeof cleanup).toBe('function');
    cleanup!();

    expect((global as any).window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
