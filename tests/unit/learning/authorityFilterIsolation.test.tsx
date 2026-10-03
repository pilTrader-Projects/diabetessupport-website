/**
 * Unit Test Suite for Authority Filter Isolation and Zero-Fallback Strictness.
 *
 * @usecase Validates that selecting an authority (e.g., Dr. Ken D. Berry, MD) strictly isolates
 * only resources belonging to that authority, preventing leakage of other authorities sharing credentials (like 'MD'),
 * and verifies that no hardcoded fallback books bypass the database.
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import LearningHubClient from '../../../src/components/learning/LearningHubClient';
import { IAuthority, ILearningResource } from '../../../src/types/learning';
import { IPost } from '../../../src/types/blog';

jest.mock('../../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../src/components/ads/AdUnit', () => {
  return function MockAdUnit() {
    return <div data-testid="ad-unit">Ad Unit</div>;
  };
});

describe('Authority Filter Isolation & Zero Hardcoded Fallbacks', () => {
  const drBerry: IAuthority = {
    _id: 'auth_berry',
    name: 'Dr. Ken D. Berry, MD',
    slug: 'dr-ken-berry',
    title: 'Family Physician & Author',
    specialties: ['Keto', 'Carnivore', 'Insulin Resistance'],
    youtubeChannelId: 'UCberry',
    autoPublish: true,
    isActive: true,
    displayOrder: 1,
    recommendedBooks: [
      {
        _id: 'book_berry_1',
        title: 'Lies My Doctor Told Me',
        author: 'Dr. Ken D. Berry, MD',
        type: 'book',
        affiliateUrl: 'https://amazon.com/dp/berry',
        coverUrl: 'https://m.media-amazon.com/images/berry.jpg',
        badgeText: 'Essential Guide',
        platformName: 'Amazon',
        description: 'Medical myths debunked.',
      },
    ],
  };

  const drJamnadas: IAuthority = {
    _id: 'auth_jamnadas',
    name: 'Dr. Pradip Jamnadas, MD',
    slug: 'dr-pradip-jamnadas',
    title: 'Cardiologist & Medical Director',
    specialties: ['Intermittent Fasting', 'Cardiology'],
    youtubeChannelId: 'UCjamnadas',
    autoPublish: true,
    isActive: true,
    displayOrder: 2,
    recommendedBooks: [],
  };

  const drFung: IAuthority = {
    _id: 'auth_fung',
    name: 'Dr. Jason Fung, MD',
    slug: 'dr-jason-fung',
    title: 'Nephrologist',
    specialties: ['Fasting', 'Type 2 Reversal'],
    youtubeChannelId: 'UCfung',
    autoPublish: true,
    isActive: true,
    displayOrder: 3,
    recommendedBooks: [
      {
        _id: 'book_fung_1',
        title: 'The Diabetes Code',
        author: 'Dr. Jason Fung, MD',
        type: 'book',
        affiliateUrl: 'https://amazon.com/dp/fung',
        coverUrl: 'https://m.media-amazon.com/images/fung.jpg',
        badgeText: 'Core Protocol',
        platformName: 'Amazon',
        description: 'Prevent and reverse type 2 diabetes.',
      },
    ],
  };

  const resourceBerry: ILearningResource = {
    _id: 'res_berry_1',
    title: 'Proper Human Diet Protocol by Dr Berry',
    slug: 'proper-human-diet-berry',
    type: 'video',
    authorityId: 'auth_berry',
    authorityName: 'Dr. Ken D. Berry, MD',
    sourceUrl: 'https://www.youtube.com/watch?v=berry1',
    platform: 'youtube',
    embedId: 'berry1',
    thumbnailUrl: 'https://i.ytimg.com/vi/berry1/hqdefault.jpg',
    duration: '22:15',
    summary: 'Clinical explanation of the proper human diet.',
    keyTakeaways: ['Eliminate refined seed oils', 'Eat whole ruminant meat'],
    topics: ['Keto', 'Insulin Resistance'],
    status: 'published',
  };

  const resourceJamnadas: ILearningResource = {
    _id: 'res_jamnadas_1',
    title: 'Fasting for Longevity and Autophagy',
    slug: 'fasting-autophagy-jamnadas',
    type: 'video',
    authorityId: 'auth_jamnadas',
    authorityName: 'Dr. Pradip Jamnadas, MD',
    sourceUrl: 'https://www.youtube.com/watch?v=jamnadas1',
    platform: 'youtube',
    embedId: 'jamnadas1',
    thumbnailUrl: 'https://i.ytimg.com/vi/jamnadas1/hqdefault.jpg',
    duration: '45:00',
    summary: 'Cardiology perspective on fasting and autophagy.',
    keyTakeaways: ['Fasting cleans damaged cells', 'Autophagy peaks at 36-48 hours'],
    topics: ['Fasting', 'Cardiology'],
    status: 'published',
  };

  const sampleArticle: IPost = {
    _id: 'art_editorial_1',
    title: 'Editorial: Understanding Glycemic Spikes',
    slug: 'understanding-glycemic-spikes',
    content: 'Full article text',
    excerpt: 'How to monitor postprandial glucose effectively.',
    category: 'Guides',
    tags: ['Glucose', 'Testing'],
    status: 'published',
  };

  it('strictly isolates Dr. Ken D. Berry videos and does NOT leak Dr. Pradip Jamnadas videos despite shared MD credential', () => {
    const html = ReactDOMServer.renderToString(
      <LearningHubClient
        initialAuthorities={[drBerry, drJamnadas]}
        initialResources={[resourceBerry, resourceJamnadas]}
        initialArticles={[sampleArticle]}
        initialAuthority="auth_berry"
      />
    );

    // Berry video and book should be rendered
    expect(html).toContain('Proper Human Diet Protocol by Dr Berry');
    expect(html).toContain('Lies My Doctor Told Me');

    // Jamnadas video must NOT be rendered
    expect(html).not.toContain('Fasting for Longevity and Autophagy');
  });

  it('strictly isolates Dr. Pradip Jamnadas videos and does NOT leak Dr. Ken Berry videos', () => {
    const html = ReactDOMServer.renderToString(
      <LearningHubClient
        initialAuthorities={[drBerry, drJamnadas]}
        initialResources={[resourceBerry, resourceJamnadas]}
        initialArticles={[sampleArticle]}
        initialAuthority="auth_jamnadas"
      />
    );

    // Jamnadas video should be rendered
    expect(html).toContain('Fasting for Longevity and Autophagy');

    // Berry video must NOT be rendered
    expect(html).not.toContain('Proper Human Diet Protocol by Dr Berry');
    expect(html).not.toContain('Lies My Doctor Told Me');
  });

  it('renders only database-sourced books and does not inject hardcoded fallback books when DB has no books', () => {
    const emptyAuthority: IAuthority = {
      _id: 'auth_empty',
      name: 'Dr. Empty Researcher',
      slug: 'dr-empty-researcher',
      title: 'Physician',
      specialties: ['Research'],
      autoPublish: false,
      isActive: true,
      displayOrder: 1,
      recommendedBooks: [],
    };

    const html = ReactDOMServer.renderToString(
      <LearningHubClient
        initialAuthorities={[emptyAuthority]}
        initialResources={[]}
        initialArticles={[]}
        initialFormat="book"
      />
    );

    // Zero-fallback verification: hardcoded books like 'Why We Get Sick' or 'The Obesity Code'
    // should NOT appear unless they came from initialAuthorities/initialResources
    expect(html).not.toContain('Why We Get Sick');
    expect(html).not.toContain('The Obesity Code');
    expect(html).toContain('No Learning Materials Found');
  });

  it('correctly associates books with authority and isolates books when filtering by authority', () => {
    const html = ReactDOMServer.renderToString(
      <LearningHubClient
        initialAuthorities={[drBerry, drFung]}
        initialResources={[]}
        initialArticles={[]}
        initialFormat="book"
        initialAuthority="auth_berry"
      />
    );

    // Only Berry book should be shown
    expect(html).toContain('Lies My Doctor Told Me');
    // Fung book must NOT be shown
    expect(html).not.toContain('The Diabetes Code');
  });
});
