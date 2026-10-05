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
});
