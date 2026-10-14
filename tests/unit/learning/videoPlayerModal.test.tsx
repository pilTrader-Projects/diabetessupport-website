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
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers');
    expect(html).toContain('Clinical Safety &amp; Guidance Notice');
    expect(html).toContain('Questions to Explore with Your Physician');
  });

  it('should render flanking companion reading cards in side spaces when recommended books exist', () => {
    const resourceWithBooks: ILearningResource = {
      ...mockResource,
      recommendedBooks: [
        {
          title: 'The Obesity Code',
          author: 'Dr. Jason Fung, MD',
          description: 'The definitive guide to reversing insulin resistance.',
          affiliateUrl: 'https://amazon.com/dp/obesity-code',
          type: 'book',
          platformName: 'Amazon',
          badgeText: 'Essential Companion',
        },
      ],
    };

    const html = ReactDOMServer.renderToString(
      <VideoPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        resource={resourceWithBooks}
      />
    );

    expect(html).toContain('By Dr. Jason Fung, MD');
    expect(html).toContain('The Obesity Code');
    expect(html).toContain('The definitive guide to reversing insulin resistance.');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
  });

  it('should display related reading on flanks when author has no books but authorities pool exists', () => {
    const resourceWithoutBooks: ILearningResource = {
      ...mockResource,
      recommendedBooks: [],
      authorityName: 'Independent Researcher',
      topics: ['Insulin Resistance'],
    };

    const mockAuthorities = [
      {
        name: 'Dr. Benjamin Bikman',
        slug: 'ben-bikman',
        title: 'Professor',
        specialties: ['Insulin Resistance'],
        autoPublish: true,
        isActive: true,
        displayOrder: 1,
        recommendedBooks: [
          {
            title: 'Why We Get Sick',
            author: 'Dr. Benjamin Bikman, PhD',
            description: 'The root cause of metabolic disease.',
            affiliateUrl: 'https://amazon.com/dp/why-we-get-sick',
            type: 'book' as const,
            topics: ['Insulin Resistance'],
          },
        ],
      },
    ];

    const html = ReactDOMServer.renderToString(
      <VideoPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        resource={resourceWithoutBooks}
        authorities={mockAuthorities}
      />
    );

    expect(html).toContain('Related Reading');
    expect(html).toContain('Why We Get Sick');
  });
});
