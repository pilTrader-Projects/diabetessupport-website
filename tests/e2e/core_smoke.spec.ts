import { test, expect } from '@playwright/test';

const SMOKE_ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/ph', name: 'Philippine Edition (/ph)' },
  { path: '/learn', name: 'Learning Hub (/learn)' },
  { path: '/hidden-clock', name: 'Hidden Clock Funnel (/hidden-clock)' },
  { path: '/community', name: 'Community Forum (/community)' },
];

test.describe('Post-Deploy Production Smoke Test Suite', () => {
  for (const route of SMOKE_ROUTES) {
    test(`[Smoke Test] ${route.name} (${route.path}) renders canonical, single-brand title, og tags, footer and Cookie Settings`, async ({ page }) => {
      // Pre-set consent cookie so banner doesn't block interactions
      await page.context().addCookies([
        {
          name: 'bts_consent_preferences',
          value: encodeURIComponent(
            JSON.stringify({
              necessary: true,
              analytics: false,
              marketing: false,
              version: 1,
              updatedAt: new Date().toISOString(),
            })
          ),
          domain: 'localhost',
          path: '/',
        },
      ]);

      const res = await page.goto(route.path);
      expect(res?.status()).toBe(200);

      // 1. Single-brand title verification
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Before the Numbers');
      const titleMatches = pageTitle.match(/Before the Numbers/g) || [];
      expect(titleMatches.length).toBe(1);

      // 2. Self-referencing canonical link verification
      const canonicalTag = page.locator('link[rel="canonical"]');
      await expect(canonicalTag).toHaveCount(1);
      const canonicalHref = await canonicalTag.getAttribute('href');
      expect(canonicalHref).toMatch(/^https:\/\/(www\.)?beforethenumbers\.org/);

      // 3. OpenGraph tags verification
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveCount(1);
      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveCount(1);
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveCount(1);

      // 4. Global unified footer links
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
      await expect(footer.locator('a[href="/terms"]')).toBeVisible();
      await expect(footer.locator('a[href="/disclosure"]')).toBeVisible();

      // 5. Cookie Settings button interaction with hydration-safe retry
      const footerBtn = page.locator('#footer-cookie-settings-btn');
      await footerBtn.scrollIntoViewIfNeeded();
      await expect(footerBtn).toBeVisible();

      const modal = page.locator('#cookie-preferences-modal');
      await expect(async () => {
        await footerBtn.click();
        await expect(modal).toBeVisible({ timeout: 1000 });
      }).toPass({ timeout: 10000 });

      await expect(modal).toContainText('Cookie & Privacy Settings');

      // Close modal via Escape key
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });
  }
});
