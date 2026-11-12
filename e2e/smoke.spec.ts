import { test, expect } from "@playwright/test";

test("home page loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("#hero-title")).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/application error|internal server error/i);
  expect(errors).toEqual([]);
});

test("venture pages render and a missing one is a 404", async ({ page }) => {
  for (const slug of ["surya", "project-eval", "gradual", "hiko"]) {
    const res = await page.goto(`/ventures/${slug}`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Krishant" })).toBeVisible();
  }
  const res = await page.goto("/ventures/not-a-real-one");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("isn't here");
});

test("the header works from a venture page", async ({ page }) => {
  await page.goto("/ventures/gradual");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Credentials" }).click();
  await expect(page).toHaveURL(/\/#credentials$/);
  await expect(page.locator("#credentials-title")).toBeInViewport();
  await page.goto("/ventures/gradual");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page).toHaveURL(/\/#ask$/);
  await expect(page.locator("#ask-input")).toBeFocused();
});

test("the Surya page lists the family", async ({ page }) => {
  await page.goto("/ventures/surya");
  await expect(page.getByRole("heading", { name: "The Surya family" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Surya Gates/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Surya Unite/ })).toBeVisible();
});
