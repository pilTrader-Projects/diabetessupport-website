import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AffiliateBookModal from '../../src/components/admin/learning/AffiliateBookModal';
import { IAffiliateRecommendation } from '../../src/types/learning';

describe('AffiliateBookModal Component (TDD Unit Tests)', () => {
  const mockBook: IAffiliateRecommendation = {
    title: 'The Diabetes Code',
    author: 'Dr. Jason Fung, MD',
    type: 'book',
    subtitle: 'Prevent and Reverse Type 2 Diabetes Naturally',
    description: 'The landmark clinical reversal guide revealing how therapeutic fasting relieves beta-cell stress.',
    affiliateUrl: 'https://www.amazon.com/dp/1771642653?tag=diabetes-code',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/71...jpg',
    badgeText: 'Clinical Reversal Protocol',
    platformName: 'Amazon',
    topics: ['Insulin Resistance', 'Type 2 Diabetes'],
  };

  it('renders correctly with pre-filled book details when open in edit mode', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateBookModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        initialData={mockBook}
        defaultAuthor="Dr. Jason Fung"
      />
    );

    expect(html).toContain('Edit Curated Book / Protocol');
    expect(html).toContain('The Diabetes Code');
    expect(html).toContain('Dr. Jason Fung, MD');
    expect(html).toContain('Clinical Reversal Protocol');
    expect(html).toContain('Save Book Details');
    expect(html).toContain('↗ Test Link');
  });

  it('renders in create mode when initialData is null', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateBookModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        initialData={null}
        defaultAuthor="Dr. Benjamin Bikman"
      />
    );

    expect(html).toContain('Add Curated Book or Protocol');
    expect(html).toContain('Dr. Benjamin Bikman');
    expect(html).toContain('Save Book Details');
  });

  it('returns null when isOpen is false', () => {
    const element = (
      <AffiliateBookModal
        isOpen={false}
        onClose={jest.fn()}
        onSave={jest.fn()}
        initialData={mockBook}
      />
    );

    expect(element.props.isOpen).toBe(false);
  });
});
