import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AffiliateCompanionCard from '@/components/learning/AffiliateCompanionCard';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';
import { IAffiliateRecommendation, ILearningResource } from '@/types/learning';

describe('Learn Page Analytics Integration (Data Attributes & Flank Positions)', () => {
  const mockBook: IAffiliateRecommendation = {
    title: 'The Diabetes Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Prevent and reverse type 2 diabetes naturally.',
    affiliateUrl: 'https://amazon.com/dp/B07953HHW4',
    type: 'book',
    platformName: 'Amazon',
    badgeText: 'Essential Guide',
  };

  const mockResource: ILearningResource = {
    _id: 'test_res_123',
    title: 'Therapeutic Fasting Masterclass',
    slug: 'therapeutic-fasting-masterclass',
    type: 'video',
    authorityName: 'Dr. Jason Fung, MD',
    summary: 'Masterclass on intermittent and therapeutic fasting.',
    keyTakeaways: ['Fasting drops insulin', 'Autophagy cleans cells'],
    sourceUrl: 'https://www.youtube.com/watch?v=sample123',
    platform: 'youtube',
    embedId: 'sample123',
    duration: '45:00',
    topics: ['Fasting'],
    status: 'published',
    recommendedBooks: [mockBook],
  };

  it('renders AffiliateCompanionCard with required GA4 tracking data attributes for left_sidebar', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateCompanionCard book={mockBook} variant="flank" position="left_sidebar" />
    );

    expect(html).toContain('data-click-type="affiliate_card"');
    expect(html).toContain('data-book-title="The Diabetes Code"');
    expect(html).toContain('data-card-position="left_sidebar"');
    expect(html).toContain('href="https://amazon.com/dp/B07953HHW4"');
  });

  it('renders AffiliateCompanionCard with required GA4 tracking data attributes for right_sidebar', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateCompanionCard book={mockBook} variant="flank" position="right_sidebar" />
    );

    expect(html).toContain('data-click-type="affiliate_card"');
    expect(html).toContain('data-book-title="The Diabetes Code"');
    expect(html).toContain('data-card-position="right_sidebar"');
  });

  it('renders VideoPlayerModal flanking cards with left_sidebar and right_sidebar positions', () => {
    const html = ReactDOMServer.renderToString(
      <VideoPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        resource={mockResource}
      />
    );

    expect(html).toContain('data-click-type="affiliate_card"');
    expect(html).toContain('data-card-position="left_sidebar"');
    expect(html).toContain('data-book-title="The Diabetes Code"');
  });
});
