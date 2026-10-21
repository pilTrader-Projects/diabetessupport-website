import {
  checkSingleAffiliateLink,
  checkAffiliateLinks,
  AffiliateLinkItem,
} from '../../../scripts/check-affiliate-links';

describe('scripts/check-affiliate-links.ts', () => {
  it('identifies and reports malformed or non-http URLs as broken', async () => {
    const item: AffiliateLinkItem = {
      url: 'not-a-valid-url',
      source: 'Test Authority',
      title: 'Bad URL Book',
    };

    const result = await checkSingleAffiliateLink(item);
    expect(result.status).toBe('broken');
    expect(result.message).toContain('Invalid URL scheme');
  });

  it('marks successful 200 HTTP responses as healthy', async () => {
    const item: AffiliateLinkItem = {
      url: 'https://www.amazon.com/dp/1771642658',
      source: 'Authority: Dr. Jason Fung',
      title: 'The Diabetes Code',
    };

    const mockFetch = jest.fn().mockResolvedValue({
      status: 200,
      url: 'https://www.amazon.com/dp/1771642658',
    });

    const result = await checkSingleAffiliateLink(item, { fetchFn: mockFetch as any });
    expect(result.status).toBe('healthy');
    expect(result.httpStatus).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('marks 404 and 410 HTTP responses as broken', async () => {
    const item: AffiliateLinkItem = {
      url: 'https://www.amazon.com/dp/0000000000',
      source: 'Authority: Dr. Example',
      title: 'Out of Print Book',
    };

    const mockFetch = jest.fn().mockResolvedValue({
      status: 404,
      url: 'https://www.amazon.com/dp/0000000000',
    });

    const result = await checkSingleAffiliateLink(item, { fetchFn: mockFetch as any });
    expect(result.status).toBe('broken');
    expect(result.httpStatus).toBe(404);
    expect(result.message).toContain('HTTP 404');
  });

  it('handles Amazon 503 bot mitigation challenges as warnings instead of failing as dead links', async () => {
    const item: AffiliateLinkItem = {
      url: 'https://www.amazon.com/dp/B079JogbE',
      source: 'Authority: Dr. Ben Bikman',
      title: 'Why We Get Sick',
    };

    const mockFetch = jest.fn().mockResolvedValue({
      status: 503,
      url: 'https://www.amazon.com/dp/B079JogbE',
    });

    const result = await checkSingleAffiliateLink(item, { fetchFn: mockFetch as any });
    expect(result.status).toBe('warning');
    expect(result.httpStatus).toBe(503);
    expect(result.message).toContain('bot mitigation');
  });

  it('flags unexpected external domain redirection as warning', async () => {
    const item: AffiliateLinkItem = {
      url: 'https://example-partner.com/deal',
      source: 'Partner Listing',
      title: 'Third Party Product',
    };

    const mockFetch = jest.fn().mockResolvedValue({
      status: 200,
      url: 'https://unrelated-domain.com/landing',
    });

    const result = await checkSingleAffiliateLink(item, { fetchFn: mockFetch as any });
    expect(result.status).toBe('warning');
    expect(result.message).toContain('Redirected to external host');
  });

  it('handles request timeout and network failures gracefully', async () => {
    const item: AffiliateLinkItem = {
      url: 'https://network-timeout-test.com',
      source: 'Timeout Authority',
      title: 'Slow Server Book',
    };

    const mockFetch = jest.fn().mockRejectedValue(new Error('ETIMEDOUT: Connection timed out'));

    const result = await checkSingleAffiliateLink(item, { fetchFn: mockFetch as any });
    expect(result.status).toBe('broken');
    expect(result.message).toContain('Network connection error');
  });

  it('checkAffiliateLinks correctly summarizes results and aggregates counts', async () => {
    const testItems: AffiliateLinkItem[] = [
      { url: 'https://amazon.com/healthy1', source: 'Auth A', title: 'Healthy 1' },
      { url: 'https://amazon.com/broken1', source: 'Auth B', title: 'Broken 1' },
      { url: 'https://amazon.com/healthy1', source: 'Auth C', title: 'Duplicate of 1' }, // should deduplicate
    ];

    const mockFetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('broken')) {
        return Promise.resolve({ status: 404, url });
      }
      return Promise.resolve({ status: 200, url });
    });

    const report = await checkAffiliateLinks({
      urls: testItems,
      checkDatabase: false,
      fetchFn: mockFetch as any,
    });

    expect(report.total).toBe(2); // deduplicated
    expect(report.healthy).toBe(1);
    expect(report.broken).toBe(1);
  });
});
