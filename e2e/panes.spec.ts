import { test, expect } from '@playwright/test';

/**
 * Regression cover for the reported bug: opening a venture detail from inside
 * a pane (e.g. the Hiko node on the map) and then closing it landed on a
 * 404, because the detail panel closed to `/ventures` — a route that does not
 * exist. Section nav is window-based, so `/` is the only valid close target.
 */

const NOT_FOUND = /this signal didn't resolve|404/i;

test('venture detail opened from the map closes without a 404', async ({ page }) => {
  await page.goto('/');

  // Open the Map pane from the sidebar, then click the Hiko node (internal page).
  await page.getByRole('button', { name: 'Map', exact: true }).first().click();
  const hiko = page.getByRole('link', { name: /Hiko/i }).first();
  await hiko.click();

  await expect(page).toHaveURL(/\/ventures\/hiko$/);
  await expect(page.getByRole('heading', { name: 'Hiko', level: 1 })).toBeVisible();

  // Closing must return to the console, not a dead /ventures route.
  await page.getByRole('button', { name: 'Close panel' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('body')).not.toContainText(NOT_FOUND);
});

test('Escape also closes a venture detail without a 404', async ({ page }) => {
  await page.goto('/ventures/hiko');
  // The panel focuses its close button on mount, so waiting for that proves
  // React has hydrated and the Escape handler is attached. Without this the
  // keypress can land before hydration on a slow (production) load.
  await expect(page.getByRole('button', { name: 'Close panel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('body')).not.toContainText(NOT_FOUND);
});

test('every internal venture page renders and closes cleanly', async ({ page }) => {
  for (const slug of ['surya', 'project-eval', 'gradual', 'hiko']) {
    const res = await page.goto(`/ventures/${slug}`);
    expect(res?.status(), `${slug} should not 404`).toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText(NOT_FOUND);

    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('body')).not.toContainText(NOT_FOUND);
  }
});

test('no em dashes in user-facing copy', async ({ page }) => {
  // Krishant doesn't write with em dashes and they read as AI-generated, so
  // they're kept out of the content files. Sweep the console plus every pane.
  await page.goto('/');
  const surfaces = ['Ventures', 'Map', 'Credentials', 'About', 'Connect'];
  for (const name of surfaces) {
    await page.getByRole('button', { name, exact: true }).first().click();
    await page.waitForTimeout(300);
  }
  const body = await page.locator('body').innerText();
  expect(body, 'em dash found in rendered copy').not.toContain('—');

  for (const slug of ['surya', 'project-eval', 'gradual', 'hiko']) {
    await page.goto(`/ventures/${slug}`);
    const detail = await page.locator('body').innerText();
    expect(detail, `em dash found on /ventures/${slug}`).not.toContain('—');
  }
});

test('Surya leads the ventures pane and appears on the map', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Ventures', exact: true }).first().click();
  const venturesPane = page.getByRole('heading', { name: 'Surya' });
  await expect(venturesPane.first()).toBeVisible();
  await expect(page.getByText("An app isn't a business.").first()).toBeVisible();

  // Surya is also a node on the constellation.
  await page.getByRole('button', { name: 'Map', exact: true }).first().click();
  await expect(page.getByRole('link', { name: /Surya/i }).first()).toBeVisible();
});
