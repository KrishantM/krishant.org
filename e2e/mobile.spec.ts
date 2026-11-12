import { test, expect, type Page } from "@playwright/test";

/** Phone and tablet widths, in both themes. */

const WIDTHS = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
];

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
}

for (const vp of WIDTHS) {
  for (const theme of ["dark", "light"] as const) {
    test(`${vp.name} ${vp.width}px, ${theme}: no sideways scroll on any section`, async ({ page }) => {
      await setTheme(page, theme);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      for (const id of ["surya", "how-i-build", "credentials", "connect"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await expect(page.locator(`#${id}-title`)).toBeVisible();
      }
      const after = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(after).toBeLessThanOrEqual(0);
    });
  }
}

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu opens, links to a section and closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const mobile = page.getByRole("navigation", { name: "Mobile" });
    await mobile.getByRole("link", { name: "How I build" }).click();
    await expect(page).toHaveURL(/#how-i-build$/);
    await expect(mobile).toBeHidden();
    await expect(page.locator("#how-i-build-title")).toBeInViewport();
  });

  test("Escape closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  });

  test("touch targets are at least 44px", async ({ page }) => {
    await page.goto("/");
    const targets = [
      page.getByRole("button", { name: "Menu" }),
      page.getByRole("button", { name: "Toggle light or dark theme" }),
      page.getByRole("link", { name: /back to the top/ }),
      page.getByRole("button", { name: "Send" }),
      page.getByRole("tab", { name: "Ask", exact: true }),
      page.getByRole("tab", { name: "Fit check" }),
    ];
    for (const t of targets) {
      const box = await t.boundingBox();
      expect(box, await t.evaluate((e) => e.outerHTML.slice(0, 80))).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("every Gates choice is tappable and the verdict fits the screen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Try Surya Gates" }).click();
    const radios = page.locator("#panel-gates").getByRole("radio");
    for (const r of await radios.all()) {
      const box = await r.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const verdict = await page.getByTestId("gates-verdict").boundingBox();
    expect(verdict!.x).toBeGreaterThanOrEqual(0);
    expect(verdict!.x + verdict!.width).toBeLessThanOrEqual(375);
  });

  test("the ask input does not zoom the page on focus (16px text)", async ({ page }) => {
    await page.goto("/");
    const size = await page.locator("#ask-input").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
