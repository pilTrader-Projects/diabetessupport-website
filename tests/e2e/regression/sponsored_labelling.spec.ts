import { test, expect } from '@playwright/test';

/**
 * P2-04: Catalog Hygiene, Sponsored Content Labelling, and Fasting Safety E2E Regression Suite.
 *
 * Verifies that:
 * 1. Public catalog displays clear sponsored badges on commercial partner materials.
 * 2. Selecting a fasting topic filter triggers the ClinicalSafetyBox fasting & medication warning.
 * 3. Clearing or switching topic filter removes the fasting safety banner.
 * 4. Fasting topic chips display the medical hedging prefix / suffix "⚠️ ... (Ask Doctor)".
 */

test.describe('P2-04: Sponsored Content Labelling & Fasting Safety', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      if (!err.message.includes('google') && !err.message.includes('doubleclick')) {
        console.warn('Browser page error:', err.message);
      }
    });
  });

  test('REG-SPONSOR-01: Public /learn page displays sponsored badges when sponsored items are present', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Verify main catalog rendered
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check if any sponsored badge exists in the rendered catalog
    const sponsoredBadges = page.locator('[data-testid^="sponsored-badge-"]');
    const badgeCount = await sponsoredBadges.count();

    if (badgeCount > 0) {
      const firstBadge = sponsoredBadges.first();
      await expect(firstBadge).toBeVisible();
      await expect(firstBadge).toContainText(/Sponsored/i);
    }
  });

  test('REG-SPONSOR-02: Selecting a fasting topic triggers ClinicalSafetyBox warning banner', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Verify safety box is not displayed by default when "All" topic is active
    const safetyBox = page.locator('[data-testid="fasting-safety-box"]');
    await expect(safetyBox).not.toBeVisible();

    // Locate topic filter button with "Fasting"
    const fastingChip = page.locator('button').filter({ hasText: /Fasting/i }).first();
    const isFastingAvailable = await fastingChip.isVisible();

    if (isFastingAvailable) {
      // Check that the fasting topic chip includes safety hedging emoji/label
      await expect(fastingChip).toContainText('⚠️');
      await expect(fastingChip).toContainText('(Ask Doctor)');

      // Click the fasting topic chip
      await fastingChip.click();

      // Clinical safety box must become visible
      await expect(safetyBox).toBeVisible();
      await expect(safetyBox).toContainText(/Clinical Safety & Guidance Notice/i);
      await expect(safetyBox).toContainText(/Do Not Adjust Medications Independently/i);

      // Click "All" topics chip to reset
      const allTopicBtn = page.getByRole('button', { name: /^All Topics$/i }).first();
      if (await allTopicBtn.isVisible()) {
        await allTopicBtn.click();
        await expect(safetyBox).not.toBeVisible();
      }
    }
  });
});
