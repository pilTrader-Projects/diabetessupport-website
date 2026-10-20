/**
 * Unit Test Suite for URL Backward-Compatibility Redirects.
 *
 * @usecase Validates that legacy /blog and /blog/:slug URLs redirect permanently (301/308) to /learn.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = require('../../next.config.js');

describe('Backward Compatibility URL Redirects (next.config.js)', () => {
  it('should define an async redirects function', () => {
    expect(nextConfig.redirects).toBeDefined();
    expect(typeof nextConfig.redirects).toBe('function');
  });

  it('should configure permanent 301/308 redirect from /blog to /community', async () => {
    const redirects = await nextConfig.redirects();

    const blogRootRedirect = redirects.find(
      (r: any) => r.source === '/blog' && r.destination === '/community'
    );
    expect(blogRootRedirect).toBeDefined();
    expect(blogRootRedirect.permanent).toBe(true);
  });

  it('should configure permanent wildcard redirect from /blog/:slug* to /community/:slug*', async () => {
    const redirects = await nextConfig.redirects();

    const blogWildcardRedirect = redirects.find(
      (r: any) => r.source === '/blog/:slug*' && r.destination === '/community/:slug*'
    );
    expect(blogWildcardRedirect).toBeDefined();
    expect(blogWildcardRedirect.permanent).toBe(true);
  });

  it('should redirect legacy emoji slug to clean slug permanently', async () => {
    const redirects = await nextConfig.redirects();

    const emojiRedirect = redirects.find(
      (r: any) =>
        r.source ===
          '/community/%f0%9f%a9%b8how-diabetes-really-starts-the-silent-process-inside-your-body-you-need-to-know' &&
        r.destination ===
          '/community/how-diabetes-really-starts-the-silent-process-inside-your-body-you-need-to-know'
    );
    expect(emojiRedirect).toBeDefined();
    expect(emojiRedirect.permanent).toBe(true);
  });

  it.each([
    ['/privacy-policy', '/privacy'],
    ['/terms-of-service', '/terms'],
  ])('should permanently redirect legacy legal route %s to %s', async (source, destination) => {
    const redirects = await nextConfig.redirects();

    const legalRedirect = redirects.find(
      (r: any) => r.source === source && r.destination === destination
    );
    expect(legalRedirect).toBeDefined();
    expect(legalRedirect.permanent).toBe(true);
  });
});
