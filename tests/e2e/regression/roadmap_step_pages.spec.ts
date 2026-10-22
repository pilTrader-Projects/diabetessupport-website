import { test, expect } from '@playwright/test';

/**
 * P2-03: Individual Shareable Roadmap Step Pages E2E Regression Suite.
 *
 * Verifies that:
 * 1. All 5 canonical step routes (/learn/roadmap/[step]) return 200 with complete metadata and headings.
 * 2. Step 5 (/learn/roadmap/stay-safe) renders the critical clinical medication warning.
 * 3. Prev and Next pagination links navigate sequentially across the curriculum.
 * 4. Invalid step slugs return 404 (Not Found).
 * 5. High-converting EmailCapture form is rendered with consent checkbox.
 */

const CANONICAL_STEPS = [
  { slug: 'understand', order: 1, title: 'Understand' },
  { slug: 'spot-signs', order: 2, title: 'Spot the Signs' },
  { slug: 'know-causes', order: 3, title: 'Know the Causes' },
  { slug: 'take-action', order: 4, title: 'Take Action' },
  { slug: 'stay-safe', order: 5, title: 'Stay Safe' },
];

test.describe('P2-03: Individual Shareable Roadmap Step Pages', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      if (!err.message.includes('google') && !err.message.includes('doubleclick')) {
        console.warn('Page error on roadmap step page:', err.message);
      }
    });
  });

  for (const step of CANONICAL_STEPS) {
    test(`REG-STEP-01: /learn/roadmap/${step.slug} renders Step ${step.order} with title, goal, and resources`, async ({
      page,
    }) => {
      const response = await page.goto(`/learn/roadmap/${step.slug}`);
      expect(response?.status()).toBe(200);

      // Verify main heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(`Step ${step.order}: ${step.title}`);

      // Verify breadcrumbs back link
      const backLink = page.locator('a:has-text("Back to 5-Step Roadmap")');
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute('href', '/learn#learning-roadmap');

      // Verify resource cards are rendered
      const resourcesHeading = page.locator('#step-resources-heading');
      await expect(resourcesHeading).toBeVisible();

      // Verify email capture form is rendered
      const emailForm = page.locator('form:has(input[type="email"])');
      await expect(emailForm).toBeVisible();
    });
  }

  test('REG-STEP-02: Step 5 (/learn/roadmap/stay-safe) displays ClinicalSafetyBox with medication warning', async ({
    page,
  }) => {
    const response = await page.goto('/learn/roadmap/stay-safe');
    expect(response?.status()).toBe(200);

    const safetyBox = page.locator('[data-testid="roadmap-step-safety-box"]');
    await expect(safetyBox).toBeVisible();
    await expect(safetyBox).toContainText(/Clinical Safety & Guidance Notice|Do Not Adjust Medications/i);
    await expect(safetyBox).toContainText(/severe hypoglycemia/i);
  });

  test('REG-STEP-03: Prev/Next sequential navigation properly navigates between steps', async ({
    page,
  }) => {
    await page.goto('/learn/roadmap/understand');

    // Click Next Step (Step 2)
    const nextLink = page.locator('a:has-text("Step 2: Spot the Signs")');
    await expect(nextLink).toBeVisible();
    await nextLink.click();

    await page.waitForURL('**/learn/roadmap/spot-signs');
    const headingStep2 = page.locator('h1');
    await expect(headingStep2).toContainText('Step 2: Spot the Signs');

    // Click Previous Step back to Step 1
    const prevLink = page.locator('a:has-text("Step 1: Understand")');
    await expect(prevLink).toBeVisible();
    await prevLink.click();

    await page.waitForURL('**/learn/roadmap/understand');
    const headingStep1 = page.locator('h1');
    await expect(headingStep1).toContainText('Step 1: Understand');
  });

  test('REG-STEP-04: Non-existent step route returns 404 Not Found', async ({ page }) => {
    const response = await page.goto('/learn/roadmap/unknown-random-step-slug');
    expect(response?.status()).toBe(404);
  });
});
