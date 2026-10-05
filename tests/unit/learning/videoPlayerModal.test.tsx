import React from 'react';
import ReactDOMServer from 'react-dom/server';
import VideoPlayerModal from '../../../src/components/learning/VideoPlayerModal';
import { ILearningResource } from '../../../src/types/learning';

describe('VideoPlayerModal (Issue #44 Privacy-Enhanced Media Embedding & Curation)', () => {
  const mockResource: ILearningResource = {
    _id: 'res_test_1',
    title: 'Intermittent Fasting & Autophagy Guide',
    slug: 'fasting-autophagy-guide',
    type: 'video',
    authorityName: 'Dr. Jason Fung, MD',
    authorityTitle: 'Nephrologist & Author',
    summary: 'Exploration of fasting windows and insulin reduction.',
    keyTakeaways: ['Fasting drops insulin', 'Autophagy clears cellular debris'],
    sourceUrl: 'https://www.youtube.com/watch?v=sampleFung123',
    platform: 'youtube',
    embedId: 'sampleFung123',
    topics: ['Intermittent Fasting'],
    status: 'published',
  };

  it('should use privacy-friendly youtube-nocookie.com domain for iframe embeds', () => {
    const html = ReactDOMServer.renderToString(
      <VideoPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        resource={mockResource}
      />
    );

    expect(html).toContain('https://www.youtube-nocookie.com/embed/sampleFung123');
    expect(html).not.toContain('https://www.youtube.com/embed/');
  });

  it('should render 3-layer bylines and clinical safety notice inside modal', () => {
    const html = ReactDOMServer.renderToString(
      <VideoPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        resource={mockResource}
      />
    );

    expect(html).toContain('Dr. Jason Fung, MD');
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers Editorial Desk');
    expect(html).toContain('Clinical Safety &amp; Guidance Notice');
    expect(html).toContain('Questions to Explore with Your Physician');
  });
});
