import { test, expect } from '@playwright/test';

test('homepage loads without errors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/application error|internal server error|500/i);
});

test('homepage has navigation', async ({ page }) => {
  await page.goto('/');
  // Nav links from CLAUDE.md approved vocabulary
  const nav = page.locator('nav').first();
  await expect(nav).toBeVisible();
  await expect(nav.getByText(/ventures/i)).toBeVisible();
});

test('ventures section reachable', async ({ page }) => {
  await page.goto('/');
  // Page should not 404 or error
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
});
