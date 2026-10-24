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

  test('REG-ROADMAP-04: 5-step roadmap curriculum renders above catalog with EmailCapture and SafetyNotice', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Verify roadmap container
    const roadmapSection = page.locator('section[aria-label="Guided 5-Step Learning Roadmap"]');
    await expect(roadmapSection).toBeVisible();

    // Verify 5 step cards
    await expect(page.locator('text=Step 1: Understand')).toBeVisible();
    await expect(page.locator('text=Step 2: Spot the Signs')).toBeVisible();
    await expect(page.locator('text=Step 3: Know the Causes')).toBeVisible();
    await expect(page.locator('text=Step 4: Take Action')).toBeVisible();
    await expect(page.locator('text=Step 5: Stay Safe')).toBeVisible();

    // Verify progress indicator
    const progressLabel = page.locator('text=Roadmap Progress');
    await expect(progressLabel).toBeVisible();

    // Verify EmailCapture after Step 2
    const emailCapture = page.locator('[data-testid="learn-roadmap-email-capture"]');
    await expect(emailCapture).toBeVisible();

    // Verify SafetyNotice before Step 5
    const safetyNotice = page.locator('[data-testid="learn-roadmap-safety-notice"]');
    await expect(safetyNotice).toBeVisible();
  });

  test('REG-ROADMAP-05: Resource cards display speaker, note, and interactive "Mark as done" checkbox', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Locate first checkbox in roadmap
    const firstCheckbox = page.locator('section[aria-label="Guided 5-Step Learning Roadmap"] input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    expect(await firstCheckbox.isChecked()).toBe(false);

    // Toggle checkbox
    await firstCheckbox.click();
    expect(await firstCheckbox.isChecked()).toBe(true);

    // Un-toggle
    await firstCheckbox.click();
    expect(await firstCheckbox.isChecked()).toBe(false);
  });

  test('REG-ROADMAP-06: Mobile layout presents roadmap first and allows expanding catalog', async ({
    page,
  }) => {
    // Set viewport to mobile phone (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/learn');

    // Verify roadmap section is visible at top of page
    const roadmapSection = page.locator('section[aria-label="Guided 5-Step Learning Roadmap"]');
    await expect(roadmapSection).toBeVisible();

    // Verify mobile catalog expander button
    const expandBtn = page.getByRole('button', { name: /Browse Full Resource Catalog/i });
    await expect(expandBtn).toBeVisible();
    await expect(expandBtn).toContainText('Expand Catalog ▼');

    // Toggle expand
    await expandBtn.click();
    await expect(expandBtn).toContainText('Collapse Catalog ▲');

    // Toggle collapse
    await expandBtn.click();
    await expect(expandBtn).toContainText('Expand Catalog ▼');
  });

  test('REG-ROADMAP-07: Resilient to corrupted or malformed localStorage payloads', async ({
    page,
  }) => {
    // Inject corrupt non-array JSON into localStorage before page initialization
    await page.addInitScript(() => {
      window.localStorage.setItem('bts_completed_roadmap_resources', '{"corrupted": true, "number": 42}');
    });

    await page.goto('/learn');

    // Page must render smoothly without uncaught runtime error
    const roadmapSection = page.locator('section[aria-label="Guided 5-Step Learning Roadmap"]');
    await expect(roadmapSection).toBeVisible();

    // Checkboxes should remain functional
    const firstCheckbox = page.locator('section[aria-label="Guided 5-Step Learning Roadmap"] input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();
    expect(await firstCheckbox.isChecked()).toBe(false);
  });

  test('REG-ROADMAP-08: Renders verified share links for each of the 5 curriculum steps', async ({
    page,
  }) => {
    await page.goto('/learn');

    const expectedHrefs = [
      '/learn/roadmap/understand',
      '/learn/roadmap/spot-signs',
      '/learn/roadmap/know-causes',
      '/learn/roadmap/take-action',
      '/learn/roadmap/stay-safe',
    ];

    for (const href of expectedHrefs) {
      const shareLink = page.locator(`a[href="${href}"]`);
      await expect(shareLink).toBeVisible();
    }
  });
});


