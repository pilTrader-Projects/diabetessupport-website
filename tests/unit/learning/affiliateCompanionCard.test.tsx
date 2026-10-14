import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AffiliateCompanionCard from '../../../src/components/learning/AffiliateCompanionCard';
import { IAffiliateRecommendation } from '../../../src/types/learning';

describe('AffiliateCompanionCard Component', () => {
  const mockBook: IAffiliateRecommendation = {
    title: 'The Obesity Code',
    author: 'Dr. Jason Fung, MD',
    description: 'Unlocking the secrets of weight loss and insulin resistance.',
    affiliateUrl: 'https://amazon.com/dp/sample-code?tag=affiliate-20',
    coverUrl: 'https://images.example.com/obesity-code.jpg',
    platformName: 'Amazon',
    badgeText: 'Essential Companion',
    type: 'book',
  };

  it('should render book details, brief context, badge, and external affiliate link with target _blank', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateCompanionCard book={mockBook} variant="flank" />
    );

    expect(html).toContain('The Obesity Code');
    expect(html).toContain('Dr. Jason Fung, MD');
    expect(html).toContain('Unlocking the secrets of weight loss and insulin resistance.');
    expect(html).toContain('Essential Companion');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).toContain('href="https://amazon.com/dp/sample-code?tag=affiliate-20"');
  });

  it('should render fallback placeholder when coverUrl is omitted', () => {
    const bookWithoutCover = { ...mockBook, coverUrl: undefined };
    const html = ReactDOMServer.renderToString(
      <AffiliateCompanionCard book={bookWithoutCover} variant="inline" />
    );

    expect(html).toContain('📚');
    expect(html).toContain('The Obesity Code');
  });
});
