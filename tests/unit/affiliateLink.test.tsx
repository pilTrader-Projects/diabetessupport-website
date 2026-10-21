import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AffiliateLink } from '@/components/common/AffiliateLink';

describe('<AffiliateLink /> Component (TDD Tests)', () => {
  const defaultProps = {
    href: 'https://www.amazon.com/dp/1771642658',
    merchant: 'Amazon',
    label: 'The Diabetes Code',
  };

  it('renders outbound anchor with mandatory rel="sponsored noopener noreferrer" and target="_blank"', () => {
    const html = ReactDOMServer.renderToString(<AffiliateLink {...defaultProps} />);

    expect(html).toContain('href="https://www.amazon.com/dp/1771642658"');
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('data-click-type="affiliate_card"');
    expect(html).toContain('data-book-title="The Diabetes Code"');
    expect(html).toContain('The Diabetes Code');
  });

  it('renders visible disclosure label linking to /disclosure by default', () => {
    const html = ReactDOMServer.renderToString(<AffiliateLink {...defaultProps} />);

    expect(html).toContain('href="/disclosure"');
    expect(html).toContain('(affiliate link)');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('supports plain variant without adjacent disclosure link', () => {
    const html = ReactDOMServer.renderToString(<AffiliateLink {...defaultProps} variant="plain" />);

    expect(html).not.toContain('/disclosure');
    expect(html).not.toContain('(affiliate link)');
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain('The Diabetes Code');
  });

  it('supports card layout variant with container wrapper', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateLink {...defaultProps} variant="card">
        <div className="book-card-body">Card Body Content</div>
      </AffiliateLink>
    );

    expect(html).toContain('book-card-body');
    expect(html).toContain('Card Body Content');
    expect(html).toContain('/disclosure');
    expect(html).toContain('relative');
  });

  it('supports badge variant with styled disclosure indicator', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateLink {...defaultProps} variant="badge" disclosureText="Sponsored" />
    );

    expect(html).toContain('href="/disclosure"');
    expect(html).toContain('Sponsored');
    expect(html).toContain('uppercase');
  });

  it('auto-detects merchant from URL when merchant prop is omitted', () => {
    const html = ReactDOMServer.renderToString(
      <AffiliateLink href="https://shopee.ph/product/12345" />
    );

    expect(html).toContain('Shopee Recommendation');
  });
});
