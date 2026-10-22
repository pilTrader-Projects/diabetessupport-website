import { test, expect } from '@playwright/test';

test.describe('P1-06: Standardized <AffiliateLink /> & Outbound Compliance', () => {
  test('AFF-01: Outbound affiliate elements enforce rel="sponsored noopener noreferrer" and target="_blank"', async ({ page }) => {
    await page.goto('/learn');
    await page.locator('h1').first().waitFor();

    // Open video modal if present to reveal companion reading cards
    const playBtn = page.locator('button[data-testid="play-video-btn"], button:has-text("Play Video")').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(500);
    }

    // Query all rendered affiliate cards and links
    const affiliateLinks = page.locator('a[data-click-type="affiliate_card"]');
    const count = await affiliateLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = affiliateLinks.nth(i);
        const rel = await link.getAttribute('rel');
        const target = await link.getAttribute('target');

        expect(rel).toContain('sponsored');
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
        expect(target).toBe('_blank');
      }
    }
  });

  test('AFF-02: Affiliate elements display visible commercial disclosure indicator linking to /disclosure', async ({ page }) => {
    await page.goto('/learn');
    await page.locator('h1').first().waitFor();

    // Open video modal to display companion reading cards
    const playBtn = page.locator('button[data-testid="play-video-btn"], button:has-text("Play Video")').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(500);
    }

    // If companion reading cards exist, check for the affiliate link disclosure badge
    const affiliateCards = page.locator('a[data-click-type="affiliate_card"]');
    if ((await affiliateCards.count()) > 0) {
      const disclosureBadge = page.locator('text=(affiliate link)').first();
      await expect(disclosureBadge).toBeVisible();
    }
  });

  test('AFF-03: Direct commercial disclosure page /disclosure loads successfully with 200 OK', async ({ page }) => {
    const response = await page.goto('/disclosure');
    expect(response?.status()).toBe(200);

    const heading = page.locator('h1');
    await expect(heading).toContainText(/Disclosure|Commercial/i);
    await expect(page.locator('body')).toContainText(/affiliate/i);
  });

  test('AFF-04: /hidden-clock citation enforces compliant <AffiliateLink /> with Amazon ASIN and sponsored rel', async ({ page }) => {
    await page.goto('/hidden-clock');

    const bikmanLink = page.locator('a[href*="1953295770"]');
    await expect(bikmanLink).toBeVisible();

    const rel = await bikmanLink.getAttribute('rel');
    expect(rel).toContain('sponsored');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');

    const target = await bikmanLink.getAttribute('target');
    expect(target).toBe('_blank');

    const merchant = await bikmanLink.getAttribute('data-merchant');
    expect(merchant).toBe('Amazon');

    const position = await bikmanLink.getAttribute('data-card-position');
    expect(position).toBe('funnel_authority_citation');
  });
});

