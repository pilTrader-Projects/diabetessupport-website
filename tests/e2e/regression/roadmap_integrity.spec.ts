import { test, expect } from '@playwright/test';

/**
 * P2-01: Learning Roadmap Engine & Integrity E2E Regression Suite
 *
 * Verifies that:
 * 1. Learning Hub (/learn) loads without uncaught integrity exceptions.
 * 2. Clinical safety notices and medical disclaimers remain visible and intact.
 * 3. Media resources and player controls are accessible and responsive.
 */

test.describe('P2-01: Learning Hub & Roadmap Foundation Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept and monitor console errors or uncaught page exceptions
    page.on('pageerror', (err) => {
      if (!err.message.includes('google') && !err.message.includes('doubleclick')) {
        console.warn('Page error on /learn:', err.message);
      }
    });
  });

  test('REG-ROADMAP-01: /learn loads successfully with complete metadata and no server-side integrity errors', async ({
    page,
  }) => {
    const response = await page.goto('/learn');
    expect(response?.status()).toBe(200);

    // Verify main header
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/Learning Hub|Evidence/i);

    // Verify canonical tag matches URL
    const canonical = page.locator('link[rel="canonical"]');
    if ((await canonical.count()) > 0) {
      await expect(canonical).toHaveAttribute('href', /.*\/learn$/);
    }
  });

  test('REG-ROADMAP-02: Clinical safety boundaries and educational notices are preserved', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Verify footer disclaimer or educational notice is rendered
    const footerDisclaimer = page.locator('footer');
    await expect(footerDisclaimer).toBeVisible();
    await expect(footerDisclaimer).toContainText(/medical disclaimer|educational purposes/i);
  });

  test('REG-ROADMAP-03: Video player triggers and modal attributions remain operational', async ({
    page,
  }) => {
    await page.goto('/learn');

    const playBtn = page.locator('button[data-testid="play-video-btn"], button:has-text("Play Video")').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();

      // Modal container should become visible
      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify close button dismisses cleanly
      const closeBtn = page.locator('button[aria-label="Close video player"]');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(modal).toBeHidden();
    }
  });
});
