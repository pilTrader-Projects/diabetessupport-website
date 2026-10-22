import { test, expect } from '@playwright/test';

/**
 * Community Forum Regression Suite.
 * Validates public health safe harbor notice, affirmative transactional notification consent,
 * and user data privacy controls on community discussions (RA 10173).
 */
test.describe('Community Forum Interactions & Privacy Regression', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies and set basic consent so banners don't block interactions
    await context.clearCookies();
    await context.addCookies([
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
  });

  test('COMM-01: CreateThreadModal displays PublicForumNotice and transactional email disclosure', async ({ page }) => {
    await page.goto('/community');

    const askBtn = page.locator('button:has-text("Ask Question / Post")').first();
    await expect(askBtn).toBeVisible();
    await askBtn.click();

    // Verify modal is open
    const modal = page.locator('div[role="dialog"], div.fixed.inset-0').first();
    await expect(modal).toBeVisible();

    // Verify PublicForumNotice is present
    const forumNotice = page.locator('[data-testid="public-forum-notice"]');
    await expect(forumNotice).toBeVisible();
    await expect(forumNotice).toContainText('Discussions are publicly visible to all members');
    await expect(forumNotice).toContainText('do not include confidential medical records');

    // If transactional email notifications are enabled by configuration, verify checkbox behavior
    const notifyCheckbox = page.locator('label:has-text("Email me when someone replies") input[type="checkbox"]');
    if ((await notifyCheckbox.count()) > 0) {
      await expect(notifyCheckbox).not.toBeChecked();
      await notifyCheckbox.check();

      // Verify email input and disclosure link appear
      const emailInput = page.locator('input[placeholder="your.email@example.com"]');
      await expect(emailInput).toBeVisible();

      const privacyLink = page.locator('p:has-text("Used solely for reply notifications") a[href="/privacy"]');
      await expect(privacyLink).toBeVisible();
      await expect(privacyLink).toHaveAttribute('target', '_blank');
    }

    // Close modal
    const cancelBtn = page.locator('button:has-text("Cancel")');
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('COMM-02: Thread page renders PublicForumNotice and dynamic reply notification consent checkbox', async ({ page }) => {
    // Navigate to community feed to find first accessible thread or go to first thread
    await page.goto('/community');

    const firstThreadLink = page.locator('a[href^="/community/"]').first();
    const threadHref = await firstThreadLink.getAttribute('href');

    if (threadHref && threadHref !== '/community') {
      await page.goto(threadHref);

      // Verify PublicForumNotice is rendered in the reply section
      const forumNotice = page.locator('[data-testid="public-forum-notice"]');
      await forumNotice.scrollIntoViewIfNeeded();
      await expect(forumNotice).toBeVisible();

      // Find email input in reply form
      const emailInput = page.locator('input[placeholder="you@example.com"]');
      await expect(emailInput).toBeVisible();

      // Initially, when email is empty, the checkbox is not shown (only informational note)
      const notifyCheckbox = page.locator('input[type="checkbox"]:has-text(""), label:has-text("Email me when someone replies to this discussion") input');
      await expect(notifyCheckbox).toHaveCount(0);

      // When typing email, the unticked transactional checkbox appears with Privacy Policy link
      await emailInput.fill('maria.reply@example.ph');
      await expect(notifyCheckbox).toBeVisible();
      await expect(notifyCheckbox).not.toBeChecked();

      const privacyLink = page.locator('p:has-text("Used solely for transactional reply alerts") a[href="/privacy"]');
      await expect(privacyLink).toBeVisible();
      await expect(privacyLink).toHaveAttribute('target', '_blank');

      // When clearing email, checkbox disappears
      await emailInput.fill('');
      await expect(notifyCheckbox).toHaveCount(0);
    }
  });
});
