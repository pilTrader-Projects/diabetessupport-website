import { test, expect } from '@playwright/test';

test.describe('Core User Journeys & Smoke Verification', () => {
  test('Home Page renders correctly', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Learn route renders correctly', async ({ page }) => {
    const res = await page.goto('/learn');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Funnel /insulin-reset checklist renders correctly', async ({ page }) => {
    const res = await page.goto('/insulin-reset');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Community feed renders correctly', async ({ page }) => {
    const res = await page.goto('/community');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
});
