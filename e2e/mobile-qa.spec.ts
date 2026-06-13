/**
 * Mobile QA — task #12
 *
 * Verifies the mobile uplift from tasks 9 / 10 / 11 holds together across
 * breakpoints and themes, with no regression on desktop.
 *
 * Coverage:
 *   - No-flash theme bootstrap (.js class + data-theme before first paint)
 *   - Hero copy (task 11 wording)
 *   - Mobile nav switching (task 9 — full-screen MobileView)
 *   - Touch targets ≥ 44 px (task 10)
 *   - Theme switching in both directions
 *   - Desktop layout at 1280 px (no regression)
 *   - Tablet boundary at 768 px (md breakpoint)
 *   - Mobile-medium (428 px, iPhone 14 Pro Max)
 *   - Reduced-motion: layout and nav functional
 *
 * Viewport presets match real devices plus the exact Tailwind md breakpoint.
 *
 * Selector notes:
 *   - The Sidebar renders TWO nav[aria-label="Primary"] elements (one inside the
 *     hidden desktop aside, one as the mobile bottom bar). Playwright's custom
 *     CSS pseudo-class :visible filters to the rendered one at each viewport.
 *   - Similarly there are two HomeMark and two ThemeToggle buttons in the DOM.
 *     Tests that need a specific instance use :visible or .nth(1) (mobile is
 *     always second in DOM order, as rendered by Sidebar.tsx).
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Viewport presets ─────────────────────────────────────────────────────────
const VP = {
  mobileSm: { width: 375, height: 812 }, // iPhone SE / 13 Mini
  mobileMd: { width: 428, height: 926 }, // iPhone 14 Pro Max
  tablet: { width: 768, height: 1024 }, // Tailwind md breakpoint (desktop begins here)
  desktop: { width: 1280, height: 800 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function clearStoredTheme(page: Page) {
  await page.evaluate(() => localStorage.removeItem("theme"));
}

// Sidebar renders the mobile bottom nav as the SECOND nav[aria-label="Primary"]
// in DOM order (after the desktop one inside the hidden aside). Using :visible
// here is Playwright's custom CSS extension — it matches only rendered elements.
const mobileBottomNav = (page: Page) =>
  page.locator('nav[aria-label="Primary"]:visible');

// Similarly, the mobile ThemeToggle corner float is the second in DOM order.
const mobileThemeToggle = (page: Page) =>
  page.locator('button[aria-label="Toggle light or dark theme"]').nth(1);

// The HomeMark K button — use :visible to get the mobile corner float (not the
// hidden desktop aside copy). The aria-label is "${fullName}, back to the console".
const mobileHomeMark = (page: Page) =>
  page.locator('button[aria-label*="back to the console"]:visible');

// ─── 1. No-flash theme bootstrap ─────────────────────────────────────────────
test.describe("No-flash theme bootstrap", () => {
  test("data-theme is set on <html> before first render", async ({ page }) => {
    await page.goto("/");
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toMatch(/^(dark|light)$/);
  });

  test("defaults to warm-dark with no stored preference", async ({ page }) => {
    await page.goto("/");
    await clearStoredTheme(page);
    await page.reload();
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("dark");
  });

  test("respects a stored warm-light preference", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("light");
  });

  test(".js class added to <html> (enables scroll-reveal animations)", async ({
    page,
  }) => {
    await page.goto("/");
    const hasJs = await page.evaluate(() =>
      document.documentElement.classList.contains("js"),
    );
    expect(hasJs).toBe(true);
  });
});

// ─── 2. Hero copy (task 11) ───────────────────────────────────────────────────
test.describe("Hero copy — task 11", () => {
  test("h1 headline is present and starts with approved wording", async ({
    page,
  }) => {
    await page.goto("/");
    // Partial match avoids Unicode apostrophe edge-cases while still verifying
    // the task-11 rewrite ("I build software" replaced the old AI-cliché copy).
    await expect(page.locator("h1")).toContainText("I build software");
  });

  test("subline is present", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("p").filter({ hasText: "Real products, solid foundations" }),
    ).toBeVisible();
  });

  test('no "venture hub" phrase anywhere on the page', async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).not.toContain("venture hub");
  });
});

// ─── 3. Mobile nav structure and switching (task 9) ──────────────────────────
test.describe("Mobile nav structure — task 9", () => {
  test.use({ viewport: VP.mobileSm });

  test("bottom tab bar is visible at 375 px", async ({ page }) => {
    await page.goto("/");
    await expect(mobileBottomNav(page)).toBeVisible();
  });

  test("HomeMark (K) button is visible at 375 px", async ({ page }) => {
    await page.goto("/");
    await expect(mobileHomeMark(page)).toBeVisible();
  });

  test("desktop sidebar is NOT visible at 375 px", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('aside[aria-label="Sidebar"]')).not.toBeVisible();
  });

  test("tapping a nav icon opens a full-screen MobileView", async ({
    page,
  }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    await expect(
      page.locator('[role="region"][aria-label="Ventures"]'),
    ).toBeVisible();
  });

  test("MobileView shows a back button and a section tab strip", async ({
    page,
  }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    await expect(
      page.locator('button[aria-label="Back to console"]'),
    ).toBeVisible();
    await expect(page.locator('nav[aria-label="Sections"]')).toBeVisible();
  });

  test("K button and bottom nav hide while MobileView is open", async ({
    page,
  }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    // Mobile bottom nav is conditionally rendered; K button is too.
    // Both are unmounted when noWindowsOpen becomes false.
    await expect(
      page.locator('nav[aria-label="Primary"]:visible'),
    ).not.toBeVisible({ timeout: 5000 });
    await expect(mobileHomeMark(page)).not.toBeVisible({ timeout: 5000 });
  });

  test("back button closes MobileView and restores the console nav", async ({
    page,
  }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    await page.locator('button[aria-label="Back to console"]').click();
    await expect(mobileBottomNav(page)).toBeVisible();
    await expect(mobileHomeMark(page)).toBeVisible();
  });

  test("section tab strip switches the active view", async ({ page }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    // Switch to Credentials via the in-view tab strip.
    await page
      .locator('nav[aria-label="Sections"]')
      .locator('button[aria-label="Credentials"]')
      .click();
    await expect(
      page.locator('[role="region"][aria-label="Credentials"]'),
    ).toBeVisible();
  });

  test("ThemeToggle corner float stays accessible while MobileView is open", async ({
    page,
  }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    // The mobile ThemeToggle is z-40; MobileView is z-30 — toggle stays on top.
    await expect(mobileThemeToggle(page)).toBeVisible();
  });

  test("all five sections reachable via bottom nav", async ({ page }) => {
    await page.goto("/");
    // nav label → MobileView region aria-label (they differ for map/about).
    const sections: Array<[string, string]> = [
      ["Ventures", "Ventures"],
      ["Map", "The map"],
      ["Credentials", "Credentials"],
      ["About", "About me"],
      ["Connect", "Connect"],
    ];
    for (const [navLabel, regionLabel] of sections) {
      // Close the current section if one is open.
      const backBtn = page.locator('button[aria-label="Back to console"]');
      if (await backBtn.isVisible()) await backBtn.click();
      await mobileBottomNav(page)
        .locator(`button[aria-label="${navLabel}"]`)
        .click();
      await expect(
        page.locator(`[role="region"][aria-label="${regionLabel}"]`),
      ).toBeVisible();
    }
  });
});

// ─── 4. Touch targets ≥ 44 px (task 10) ──────────────────────────────────────
test.describe("Touch targets — task 10", () => {
  test.use({ viewport: VP.mobileSm });

  // boundingBox() returns sub-pixel CSS values; round to nearest integer before
  // comparing against the 44 px minimum to avoid floating-point false-negatives.
  function px(n: number | null | undefined): number {
    return Math.round(n ?? 0);
  }

  test("bottom nav icon buttons are ≥ 44 × 44 px", async ({ page }) => {
    await page.goto("/");
    const buttons = mobileBottomNav(page).locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(
        px(box?.height),
        `bottom nav button [${i}] height`,
      ).toBeGreaterThanOrEqual(44);
      expect(
        px(box?.width),
        `bottom nav button [${i}] width`,
      ).toBeGreaterThanOrEqual(44);
    }
  });

  test("HomeMark (K) button is ≥ 44 × 44 px on mobile", async ({ page }) => {
    await page.goto("/");
    const box = await mobileHomeMark(page).boundingBox();
    expect(px(box?.height)).toBeGreaterThanOrEqual(44);
    expect(px(box?.width)).toBeGreaterThanOrEqual(44);
  });

  test("AskConsole send button is ≥ 44 px tall on mobile", async ({ page }) => {
    await page.goto("/");
    const box = await page.locator('button[aria-label="Send"]').boundingBox();
    expect(px(box?.height)).toBeGreaterThanOrEqual(44);
  });

  test("ThemeToggle corner float is ≥ 44 × 44 px on mobile", async ({
    page,
  }) => {
    await page.goto("/");
    const box = await mobileThemeToggle(page).boundingBox();
    expect(px(box?.height)).toBeGreaterThanOrEqual(44);
    expect(px(box?.width)).toBeGreaterThanOrEqual(44);
  });

  test("MobileView back button is ≥ 44 × 44 px", async ({ page }) => {
    await page.goto("/");
    await mobileBottomNav(page).locator('button[aria-label="Ventures"]').click();
    const box = await page
      .locator('button[aria-label="Back to console"]')
      .boundingBox();
    expect(px(box?.height)).toBeGreaterThanOrEqual(44);
    expect(px(box?.width)).toBeGreaterThanOrEqual(44);
  });
});

// ─── 5. Theme switching ───────────────────────────────────────────────────────
test.describe("Theme switching", () => {
  test("ThemeToggle switches to warm-light and persists to localStorage", async ({
    page,
  }) => {
    await page.goto("/");
    await clearStoredTheme(page);
    await page.reload();
    // Use the first (desktop) toggle — it's visible on the default viewport.
    await page
      .locator('button[aria-label="Toggle light or dark theme"]')
      .first()
      .click();
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("light");
    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe("light");
  });

  test("warm-light → dark round-trip restores dark theme", async ({ page }) => {
    await page.goto("/");
    const toggle = page
      .locator('button[aria-label="Toggle light or dark theme"]')
      .first();
    await toggle.click(); // dark → light
    await toggle.click(); // light → dark
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(theme).toBe("dark");
  });

  test("mobile nav works in warm-light theme", async ({ page }) => {
    await page.setViewportSize(VP.mobileSm);
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();
    await mobileBottomNav(page)
      .locator('button[aria-label="Ventures"]')
      .click();
    await expect(
      page.locator('[role="region"][aria-label="Ventures"]'),
    ).toBeVisible();
  });

  test("mobile nav works in warm-dark theme", async ({ page }) => {
    await page.setViewportSize(VP.mobileSm);
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await mobileBottomNav(page)
      .locator('button[aria-label="Ventures"]')
      .click();
    await expect(
      page.locator('[role="region"][aria-label="Ventures"]'),
    ).toBeVisible();
  });
});

// ─── 6. Desktop — no regression ──────────────────────────────────────────────
test.describe("Desktop no-regression", () => {
  test.use({ viewport: VP.desktop });

  test("desktop sidebar (left rail) is visible at 1280 px", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible();
  });

  test("mobile bottom nav is NOT visible at 1280 px", async ({ page }) => {
    await page.goto("/");
    // The mobile nav is the second nav[aria-label="Primary"] in DOM order.
    // At ≥ 768 px, md:hidden makes it display:none.
    await expect(
      page.locator('nav[aria-label="Primary"]').nth(1),
    ).not.toBeVisible();
  });

  test("hero h1 and subline are present on desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("I build software");
    await expect(
      page
        .locator("p")
        .filter({ hasText: "Real products, solid foundations" }),
    ).toBeVisible();
  });
});

// ─── 7. Tablet breakpoint (768 px — md) ──────────────────────────────────────
test.describe("Tablet breakpoint (768 px — md)", () => {
  test.use({ viewport: VP.tablet });

  test("desktop layout active at 768 px — sidebar visible", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible();
  });

  test("mobile bottom nav is hidden at 768 px", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('nav[aria-label="Primary"]').nth(1),
    ).not.toBeVisible();
  });
});

// ─── 8. Mobile medium (428 px — iPhone 14 Pro Max) ───────────────────────────
test.describe("Mobile medium (428 px)", () => {
  test.use({ viewport: VP.mobileMd });

  test("mobile layout active — bottom nav visible, sidebar hidden", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(mobileBottomNav(page)).toBeVisible();
    await expect(
      page.locator('aside[aria-label="Sidebar"]'),
    ).not.toBeVisible();
  });

  test("mobile nav switching works at 428 px", async ({ page }) => {
    await page.goto("/");
    await mobileBottomNav(page)
      .locator('button[aria-label="Ventures"]')
      .click();
    await expect(
      page.locator('[role="region"][aria-label="Ventures"]'),
    ).toBeVisible();
  });
});

// ─── 9. Reduced-motion ───────────────────────────────────────────────────────
test.describe("Reduced-motion", () => {
  test("page renders correctly with prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      viewport: VP.mobileSm,
    });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("I build software");
    await ctx.close();
  });

  test("mobile nav functional with prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      viewport: VP.mobileSm,
    });
    const page = await ctx.newPage();
    await page.goto("/");
    // With reduced-motion, the MobileView has animate-none applied.
    // It should still open and be reachable.
    await page
      .locator('nav[aria-label="Primary"]:visible')
      .locator('button[aria-label="Ventures"]')
      .click();
    await expect(
      page.locator('[role="region"][aria-label="Ventures"]'),
    ).toBeVisible();
    await ctx.close();
  });
});
