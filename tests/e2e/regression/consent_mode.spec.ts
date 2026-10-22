import { test, expect } from '@playwright/test';

/**
 * REG-009: Google Consent Mode v2 & Consent Banner Regression Suite (Site Update P1-03).
 *
 * Validates default denied states, affirmative consent gating for AdSense and GA4,
 * granular customization, cookie persistence, and footer reopen controls under RA 10173.
 */

test.describe('Google Consent Mode v2 & ConsentBanner Regression (P1-03)', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure clean state without cookies or local storage
    await context.clearCookies();
  });

  test('TC-01: Displays consent banner on first visit with default denied state', async ({ page }) => {
    const trackerRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com/gtag/js') || url.includes('pagead2.googlesyndication.com')) {
        trackerRequests.push(url);
      }
    });

    await page.goto('/');

    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Privacy & Cookie Preferences');
    await expect(banner).toContainText('Republic Act No. 10173');

    // Confirm action buttons exist
    await expect(page.locator('#consent-reject-all-btn')).toBeVisible();
    await expect(page.locator('#consent-customize-btn')).toBeVisible();
    await expect(page.locator('#consent-accept-all-btn')).toBeVisible();

    // Verify no unconsented tracker requests fired
    expect(trackerRequests.length).toBe(0);
  });

  test('TC-02: Clicking "Accept All" stores granted consent and hides banner', async ({ page, context }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).toBeVisible();

    await page.locator('#consent-accept-all-btn').click();
    await expect(banner).not.toBeVisible();

    // Verify cookie was set
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === 'bts_consent_preferences');
    expect(consentCookie).toBeDefined();

    const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);
    expect(parsed.necessary).toBe(true);
    expect(parsed.version).toBe(1);

    // Verify banner does not reappear upon reload
    await page.reload();
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible();
  });

  test('TC-03: Clicking "Reject Non-Essential" stores denied consent and prevents tracking', async ({ page, context }) => {
    const trackerRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com/gtag/js') || url.includes('pagead2.googlesyndication.com')) {
        trackerRequests.push(url);
      }
    });

    await page.goto('/');

    const banner = page.locator('#cookie-consent-banner');
    await expect(banner).toBeVisible();

    await page.locator('#consent-reject-all-btn').click();
    await expect(banner).not.toBeVisible();

    // Verify cookie was set with false for non-essential
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === 'bts_consent_preferences');
    expect(consentCookie).toBeDefined();

    const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
    expect(parsed.necessary).toBe(true);

    // Reload and assert banner remains hidden and zero tracker calls occur
    await page.reload();
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible();
    expect(trackerRequests.length).toBe(0);
  });

  test('TC-04: Granular customization modal allows saving individual category choices', async ({ page, context }) => {
    await page.goto('/');

    await page.locator('#consent-customize-btn').click();

    const modal = page.locator('#cookie-preferences-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Cookie & Privacy Settings');

    // Toggle analytics ON, leave marketing OFF
    const analyticsToggle = page.locator('#consent-toggle-analytics');
    await analyticsToggle.check({ force: true });
    expect(await analyticsToggle.isChecked()).toBe(true);

    const marketingToggle = page.locator('#consent-toggle-marketing');
    expect(await marketingToggle.isChecked()).toBe(false);

    // Save choices
    await page.locator('#consent-save-preferences-btn').click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible();

    // Verify cookie contains granular state
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === 'bts_consent_preferences');
    expect(consentCookie).toBeDefined();

    const parsed = JSON.parse(decodeURIComponent(consentCookie!.value));
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
  });

  test('TC-05: Footer "Cookie Settings" button reopens preferences modal at any time', async ({ page }) => {
    // Start with pre-set consent cookie
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

    await page.goto('/');

    // Banner should not be visible
    await expect(page.locator('#cookie-consent-banner')).not.toBeVisible();

    // Click footer Cookie Settings button
    const footerBtn = page.locator('#footer-cookie-settings-btn');
    await footerBtn.scrollIntoViewIfNeeded();
    await expect(footerBtn).toBeVisible();
    await footerBtn.click();

    // Preferences modal should open
    const modal = page.locator('#cookie-preferences-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Cookie & Privacy Settings');

    // Close modal via Escape key
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('TC-06: AdUnit renders zero-cookie house promotion on /learn when marketing consent is denied', async ({ page }) => {
    // Visit with explicit marketing consent = false
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

    await page.goto('/learn');

    // Confirm that AdSense <ins> tags are NOT rendered
    const adIns = page.locator('ins.adsbygoogle');
    await expect(adIns).toHaveCount(0);

    // Confirm "Advertisement" label is NOT shown
    const adLabel = page.locator('span:has-text("Advertisement")');
    await expect(adLabel).toHaveCount(0);

    // Confirm the zero-cookie house promotion is displayed instead
    const housePromo = page.locator('text=Explore GlycoSense Free');
    await expect(housePromo.first()).toBeVisible();
  });
});

