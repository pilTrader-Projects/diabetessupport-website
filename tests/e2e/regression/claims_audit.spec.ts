import { test, expect } from '@playwright/test';

/**
 * P0-03: Claims, Content & Endorsement Audit Regression Suite (Issue #72).
 *
 * Verifies that:
 * 1. Root landing page (/) contains no misleading 'zero ads' or 'zero-commercial' claims.
 * 2. GlycoSense tool page (/glycosense) accurately frames GlycoSense as personal logging without AI diagnostic claims.
 * 3. Philippine landing page (/ph) contains no 'zero commercial barrier' overclaims.
 * 4. Learning materials (/learn) present YouTube authority attribution and non-affiliation notices upon modal opening.
 */

test.describe('P0-03 Claims, Content & Endorsement Audit', () => {
  test('Root page (/) does not contain forbidden advertising or commercial overclaims', async ({ page }) => {
    await page.goto('/');

    const pageContent = await page.content();

    // Verify "zero ads" is not present in body
    expect(pageContent).not.toMatch(/zero ads/i);

    // Verify "zero-commercial barrier" is not present in body
    expect(pageContent).not.toMatch(/zero-commercial barrier/i);

    // Verify "non-promotional educational movement" is not present in body
    expect(pageContent).not.toMatch(/non-promotional educational movement/i);
  });

  test('GlycoSense page (/glycosense) operational note frames tool as personal logging without AI claims', async ({ page }) => {
    await page.goto('/glycosense');

    // Verify SaMD operational note frames GlycoSense as personal logging
    const operationalNote = page.locator('text=GlycoSense personal logging features');
    await expect(operationalNote).toBeVisible();
    await expect(page.locator('text=GlycoSense AI features')).toHaveCount(0);
  });

  test('Philippine edition (/ph) does not claim zero commercial barrier', async ({ page }) => {
    await page.goto('/ph');

    const phContent = await page.content();
    expect(phContent).not.toMatch(/zero commercial barrier/i);
  });

  test('Learning Hub (/learn) video player displays YouTube attribution and non-affiliation notice', async ({ page }) => {
    await page.goto('/learn');

    // Find and click the play video button on the first card
    const playButton = page.locator('button:has-text("Play Video")').first();
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await playButton.click();

    // Verify modal is open and shows YouTube attribution
    const modalTitle = page.locator('#video-modal-title');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    const attributionNotice = page.locator('text=/Video by .* on YouTube/');
    await expect(attributionNotice.first()).toBeVisible();

    const nonAffiliationNotice = page.locator('text=/not affiliated with/i');
    await expect(nonAffiliationNotice.first()).toBeVisible();
  });
});
