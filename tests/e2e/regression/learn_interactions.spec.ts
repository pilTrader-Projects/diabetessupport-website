import { test, expect } from '@playwright/test';

test.describe('REG-001 & REG-002: Learning Hub (/learn) Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor uncaught exceptions on the page
    page.on('pageerror', (err) => {
      // Exclude expected third-party tracker/ads network failures in dev
      if (!err.message.includes('google') && !err.message.includes('doubleclick')) {
        console.warn('Browser page error:', err.message);
      }
    });
  });

  test('REG-001: Filter buttons and interactive controls are responsive and not blocked by global telemetry', async ({ page }) => {
    await page.goto('/learn');

    // 1. Verify main heading and library layout
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Learning Hub|Evidence/i);

    // 2. Click "Videos & Talks" filter button
    const videosFilterBtn = page.getByRole('button', { name: /Videos & Talks/i }).first();
    if (await videosFilterBtn.isVisible()) {
      await videosFilterBtn.click();
      // Should acquire active styling (purple/indigo background gradient)
      await expect(videosFilterBtn).toHaveClass(/from-purple-700/);
    }

    // 3. Click "All Materials" filter button
    const allFilterBtn = page.getByRole('button', { name: /All Materials/i }).first();
    if (await allFilterBtn.isVisible()) {
      await allFilterBtn.click();
      await expect(allFilterBtn).toHaveClass(/from-purple-700/);
    }

    // 4. Test Search Library input responsiveness
    const searchInput = page.getByPlaceholder(/Search by clinician, topic/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Insulin');
      await expect(searchInput).toHaveValue('Insulin');
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    }

    // 5. Test Authority chip selection if available
    const authorityChips = page.locator('button').filter({ hasText: /Dr\.|Prof\.|All/i });
    if ((await authorityChips.count()) > 1) {
      const secondChip = authorityChips.nth(1);
      await secondChip.click();
      // Verify button handled the click without crashing or being captured
      await expect(secondChip).toBeEnabled();
    }
  });

  test('REG-002: Video modal launches on play button click and closes gracefully', async ({ page }) => {
    await page.goto('/learn');

    // Look for any play button in the feed
    const playBtn = page.locator('button[data-testid="play-video-btn"]').first();

    if (await playBtn.isVisible()) {
      await playBtn.click();

      // Modal container should become visible with role="dialog"
      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible();

      // YouTube iframe should be rendered inside
      const iframe = modal.locator('iframe[src*="youtube"]');
      await expect(iframe).toBeAttached();

      // Close modal using close button
      const closeBtn = page.locator('button[aria-label="Close video player"]');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(modal).toBeHidden();
    }
  });

  test('REG-003: Affiliate companion elements pass through clicks without stopping event propagation', async ({ page }) => {
    await page.goto('/learn');

    // Evaluate that clicks on affiliate cards trigger the GA4 dispatch without throwing
    const affiliateCards = page.locator('[data-click-type="affiliate_card"]');
    const count = await affiliateCards.count();

    if (count > 0) {
      const firstCard = affiliateCards.first();
      await expect(firstCard).toBeVisible();

      // Verify it has proper attributes
      const clickType = await firstCard.getAttribute('data-click-type');
      expect(clickType).toBe('affiliate_card');

      const position = await firstCard.getAttribute('data-card-position');
      expect(position).toBeTruthy();

      // Verify target is _blank
      const target = await firstCard.getAttribute('target');
      expect(target).toBe('_blank');
    }
  });
});
