import {
  ensureAffiliateUrl,
  extractAmazonAsin,
  buildAmazonProductUrl,
  getAmazonCoverUrl,
} from '../../src/lib/affiliateUtils';

describe('affiliateUtils Unit Tests (TDD)', () => {
  describe('ensureAffiliateUrl', () => {
    it('returns empty string if input is empty or null', () => {
      expect(ensureAffiliateUrl('')).toBe('');
      expect(ensureAffiliateUrl(null as any)).toBe('');
    });

    it('preserves existing amzn.to shortlinks without modification', () => {
      const shortlink = 'https://amzn.to/3XYZ123';
      expect(ensureAffiliateUrl(shortlink)).toBe(shortlink);
    });

    it('preserves Amazon URLs that already have a tag parameter', () => {
      const urlWithTag = 'https://www.amazon.com/dp/1771642658?tag=mycustomtag-20';
      expect(ensureAffiliateUrl(urlWithTag)).toBe(urlWithTag);
    });

    it('appends default affiliate tag to raw Amazon product URLs when missing', () => {
      const rawUrl = 'https://www.amazon.com/dp/1771642658';
      const result = ensureAffiliateUrl(rawUrl, 'diabetes-code');
      expect(result).toBe('https://www.amazon.com/dp/1771642658?tag=diabetes-code');
    });

    it('correctly appends tag with & if URL already has query parameters but no tag', () => {
      const rawWithParams = 'https://www.amazon.com/dp/1771642658?ref=sr_1_1&keywords=diabetes';
      const result = ensureAffiliateUrl(rawWithParams, 'diabetes-code');
      expect(result).toContain('tag=diabetes-code');
      expect(result).toContain('keywords=diabetes');
    });

    it('leaves non-Amazon external protocol URLs untouched', () => {
      const directUrl = 'https://thefastingmethod.com/membership?ref=affiliate';
      expect(ensureAffiliateUrl(directUrl)).toBe(directUrl);
    });
  });

  describe('extractAmazonAsin', () => {
    it('extracts 10-character ASIN from standard Amazon product URL', () => {
      expect(extractAmazonAsin('https://www.amazon.com/dp/1771642658')).toBe('1771642658');
      expect(extractAmazonAsin('https://www.amazon.com/Why-We-Get-Sick/dp/194883698X/')).toBe('194883698X');
      expect(extractAmazonAsin('https://www.amazon.com/gp/product/B082BG79G6')).toBe('B082BG79G6');
    });

    it('returns null if no ASIN is found', () => {
      expect(extractAmazonAsin('https://thefastingmethod.com')).toBeNull();
      expect(extractAmazonAsin('')).toBeNull();
    });
  });

  describe('buildAmazonProductUrl', () => {
    it('builds canonical Amazon product URL with affiliate tag', () => {
      const url = buildAmazonProductUrl('1771642658', 'diabetes-code');
      expect(url).toBe('https://www.amazon.com/dp/1771642658?tag=diabetes-code');
    });
  });

  describe('getAmazonCoverUrl', () => {
    it('generates permanent product image URL from a raw ASIN', () => {
      expect(getAmazonCoverUrl('1771641258')).toBe(
        'https://images-na.ssl-images-amazon.com/images/P/1771641258.01.LZZZZZZZ.jpg'
      );
    });

    it('generates permanent product image URL from full Amazon URL', () => {
      expect(getAmazonCoverUrl('https://www.amazon.com/dp/1771641258?tag=diabetes-code')).toBe(
        'https://images-na.ssl-images-amazon.com/images/P/1771641258.01.LZZZZZZZ.jpg'
      );
      expect(getAmazonCoverUrl('https://www.amazon.com/Why-We-Get-Sick/dp/194883698X/')).toBe(
        'https://images-na.ssl-images-amazon.com/images/P/194883698X.01.LZZZZZZZ.jpg'
      );
    });

    it('returns null for invalid or non-Amazon URLs', () => {
      expect(getAmazonCoverUrl('')).toBeNull();
      expect(getAmazonCoverUrl('https://external-site.com/book')).toBeNull();
    });
  });
});
