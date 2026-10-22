import { test, expect } from '@playwright/test';

/**
 * P1-04: Unified <EmailCapture /> Component & Consent Architecture Regression Suite (Issue #74).
 *
 * Verifies that:
 * 1. Newsletter page (/subscribe) presents an unticked affirmative consent checkbox linking to /privacy under RA 10173.
 * 2. Form submission fails or blocks when affirmative consent is unticked (HTML5 required validation).
 * 3. Form submission succeeds when email and affirmative consent are provided.
 * 4. Funnel page (/insulin-reset) captures leads with the dark-mode funnel layout and redirects to /reset-success.
 * 5. Honeypot spam defense is present and invisible in the DOM.
 */

test.describe('P1-04 Unified EmailCapture & Consent Architecture', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies for fresh state
    await context.clearCookies();
  });

  test('TC-01: /subscribe renders affirmative consent checkbox linking to /privacy and unchecked by default', async ({ page }) => {
    await page.goto('/subscribe');

    const form = page.locator('[data-testid="email-capture-form"]');
    await expect(form).toBeVisible();

    const consentCheckbox = page.locator('[data-testid="email-capture-consent-checkbox"]');
    await expect(consentCheckbox).toBeVisible();
    await expect(consentCheckbox).not.toBeChecked();

    const privacyLink = form.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('target', '_blank');

    // Honeypot should be hidden
    const honeypot = page.locator('[data-testid="email-capture-honeypot"]');
    await expect(honeypot).not.toBeVisible();
  });

  test('TC-02: Submitting without consent does not trigger successful submission', async ({ page }) => {
    await page.goto('/subscribe');

    await page.locator('[data-testid="email-capture-input"]').fill('test-unconsented@example.com');
    // Ensure consent is unchecked
    const consentCheckbox = page.locator('[data-testid="email-capture-consent-checkbox"]');
    await expect(consentCheckbox).not.toBeChecked();

    // Attempt submit
    await page.locator('[data-testid="email-capture-submit-btn"]').click();

    // Checkbox is HTML5 required, so it is invalid and success message should NOT appear
    await expect(page.locator('[data-testid="email-capture-success"]')).toHaveCount(0);
  });

  test('TC-03: Submitting with valid email and checked consent succeeds and dispatches conversion telemetry', async ({ page }) => {
    await page.goto('/subscribe');

    // Register event listener to capture conversion telemetry
    await page.evaluate(() => {
      (window as any).__capturedConversionEvents = [];
      window.addEventListener('bts:email_signup', (e: any) => {
        (window as any).__capturedConversionEvents.push(e.detail);
      });
    });

    await page.locator('[data-testid="firstname-capture-input"]').fill('Jane');
    await page.locator('[data-testid="email-capture-input"]').fill('jane.e2e@example.com');
    await page.locator('[data-testid="email-capture-consent-checkbox"]').check();

    // Intercept or submit
    await page.locator('[data-testid="email-capture-submit-btn"]').click();

    // Verify success state is displayed
    const successBox = page.locator('[data-testid="email-capture-success"]');
    await expect(successBox).toBeVisible({ timeout: 10000 });
    await expect(successBox).toContainText(/Check Your Inbox!/i);

    // Verify conversion event was dispatched with zero PII
    const events = await page.evaluate(() => (window as any).__capturedConversionEvents);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toMatchObject({
      edition: 'ph',
    });
    expect(events[0].source).toBeDefined();
    // Verify no email address was leaked in telemetry detail
    expect(JSON.stringify(events[0])).not.toContain('jane.e2e@example.com');
  });

  test('TC-04: Funnel page (/insulin-reset) renders funnel layout, captures lead, and redirects to /reset-success', async ({ page }) => {
    await page.goto('/insulin-reset');

    const form = page.locator('[data-testid="email-capture-form"]');
    await expect(form).toBeVisible();

    const consentCheckbox = page.locator('[data-testid="email-capture-consent-checkbox"]');
    await expect(consentCheckbox).toBeVisible();
    await expect(consentCheckbox).not.toBeChecked();

    await page.locator('[data-testid="firstname-capture-input"]').fill('Carlos');
    await page.locator('[data-testid="email-capture-input"]').fill('carlos.funnel@example.com');
    await consentCheckbox.check();

    await page.locator('[data-testid="email-capture-submit-btn"]').click();

    // Verifies redirection to /reset-success on completion
    await expect(page).toHaveURL(/\/reset-success/, { timeout: 10000 });
  });

  test('TC-05: Hero "Get the Free 8-Page Guide" button smoothly navigates to lead capture form', async ({ page }) => {
    await page.goto('/insulin-reset');

    const heroCtaBtn = page.locator('button:has-text("Get the Free 8-Page Guide")');
    await expect(heroCtaBtn).toBeVisible();

    await heroCtaBtn.click();

    const leadForm = page.locator('#lead-form');
    await expect(leadForm).toBeInViewport();
  });

  test('TC-06: LeadMagnetCard on /glycosense enforces affirmative consent before claim submission', async ({ page }) => {
    // Pre-set consent cookie so banner doesn't obstruct form
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

    await page.goto('/glycosense');

    const emailInput = page.locator('#lead-magnet-email');
    await emailInput.scrollIntoViewIfNeeded();
    await expect(emailInput).toBeVisible();

    const consentCheckbox = page.locator('#lead-magnet-consent-checkbox');
    await expect(consentCheckbox).toBeVisible();
    await expect(consentCheckbox).not.toBeChecked();

    // Fill valid email but leave consent unticked
    await emailInput.fill('maria.lead@example.ph');
    const submitBtn = page.locator('button[type="submit"]:has-text("Claim Your Free")');
    await submitBtn.click();

    // Verifies accessibility alert requirement
    const errorAlert = page.locator('[role="alert"]:has-text("agree to the privacy policy")');
    await expect(errorAlert).toBeVisible();

    // Now tick consent and submit
    await consentCheckbox.check();
    await submitBtn.click();

    // Verify success confirmation card displays
    const successCard = page.locator('h5:has-text("Free Account Access Ready!")');
    await expect(successCard).toBeVisible({ timeout: 10000 });
  });
});

