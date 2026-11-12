import { test, expect } from "@playwright/test";

/**
 * The one-page structure. Content checks run against the server HTML with
 * JavaScript off, so they prove the page is server-rendered.
 */

const SECTIONS = ["top", "surya", "how-i-build", "day-job", "credentials", "earlier", "connect"];

const APPROVED_PWC =
  "By day I'm an AI engineer and solution architect at PwC New Zealand, in the Digital Strategy & Architecture team. I build agentic systems, data platforms and cloud architecture for large organisations, which means shipping AI inside the kind of security, governance and scale most product builders never see.";

test.describe("server-rendered content", () => {
  test.use({ javaScriptEnabled: false });

  test("every section is in the HTML, in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(SECTIONS);
  });

  test("the Surya family shows all three tiers and every tool", async ({ page }) => {
    await page.goto("/");
    const surya = page.locator("#surya");
    for (const tier of ["Live and open source", "In development", "Next"]) {
      await expect(surya.getByRole("heading", { level: 3, name: tier })).toBeVisible();
    }
    for (const slug of ["surya-gates", "surya-memory", "surya-voice", "surya-distro", "project-eval", "surya-unite", "surya-coordinator", "surya-voice-pointer", "surya-build"]) {
      await expect(page.locator(`#tool-${slug}`)).toHaveCount(1);
    }
    await expect(page.locator("#tool-surya-unite")).toContainText("Not available yet");
    await expect(page.locator("#tool-surya-unite").getByRole("link", { name: /github/i })).toHaveCount(0);
    await expect(page.locator("#tool-surya-gates")).toContainText("212 tests");
    await expect(surya.getByRole("link", { name: /trysurya\.com/i })).toHaveAttribute("href", "https://trysurya.com");
  });

  test("live tools link to their public repos", async ({ page }) => {
    await page.goto("/");
    for (const repo of ["surya-gates", "surya-memory", "surya-voice", "surya-distro", "project-eval"]) {
      await expect(page.locator(`#surya a[href="https://github.com/KrishantM/${repo}"]`).first()).toBeVisible();
    }
  });

  test("How I build carries proof links pinned to commits", async ({ page }) => {
    await page.goto("/");
    for (const slug of ["langchain-langgraph", "containers-kubernetes", "agentic-engineering", "claude-agent-sdk"]) {
      await expect(page.locator(`#build-${slug}`)).toBeVisible();
    }
    const proofs = page.locator('#how-i-build a[href^="https://github.com/KrishantM/"]');
    expect(await proofs.count()).toBeGreaterThan(10);
    for (const href of await proofs.evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""))) {
      expect(href).toMatch(/\/blob\/[0-9a-f]{40}\//);
    }
    await expect(page.locator("#build-langchain-langgraph")).toContainText(/LangGraph/);
    await expect(page.locator("#build-containers-kubernetes")).toContainText(/k3d/);
  });

  test("the day job is the approved PwC statement, word for word", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("pwc-statement")).toHaveText(APPROVED_PWC);
  });

  test("six certifications, Claude Certified Architect first", async ({ page }) => {
    await page.goto("/");
    const certs = page.locator("#credentials li");
    await expect(certs).toHaveCount(6);
    await expect(certs.first()).toContainText("Claude Certified Architect – Professional");
    await expect(certs.first()).toContainText("CCAR-P");
    await expect(page.locator("#credentials")).toContainText("Databricks Fundamentals");
  });

  test("Gradual and Hiko are kept small", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#earlier article")).toHaveCount(2);
    await expect(page.locator("#earlier")).toContainText("Gradual");
    await expect(page.locator("#earlier")).toContainText("Hiko");
  });

  test("contact routes are present", async ({ page }) => {
    await page.goto("/");
    const connect = page.locator("#connect");
    await expect(connect.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(connect.locator('a[href*="linkedin.com/in/krishant-maharaj"]')).toHaveCount(1);
    await expect(connect.locator('a[href="https://github.com/KrishantM"]')).toHaveCount(1);
  });

  test("the assistant is in the HTML before any script runs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Ask" })).toBeVisible();
    await expect(page.locator("#ask-input")).toBeVisible();
  });
});

test.describe("copy rules", () => {
  test("no em dashes, no banned phrases, no client detail", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("body").innerText();
    expect(text).not.toContain("—");
    expect(text.toLowerCase()).not.toContain("venture hub");
    expect(text.toLowerCase()).not.toContain("seconded");
    expect(text).not.toMatch(/\bexpert\b/i);
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("venture hub");
  });

  test("structured data names the right person and links", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(json ?? "{}");
    expect(data.name).toBe("Krishant Maharaj");
    expect(data.sameAs).toContain("https://github.com/KrishantM");
  });
});

test.describe("navigation and theme", () => {
  test("header links jump to their sections", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, id] of [["Surya", "surya"], ["How I build", "how-i-build"], ["Credentials", "credentials"], ["Connect", "connect"]]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}-title`)).toBeInViewport();
    }
  });

  test("defaults to dark, toggles to light and remembers it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Toggle light or dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Toggle light or dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("works with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#hero-title")).toBeVisible();
    await page.locator("#credentials").scrollIntoViewIfNeeded();
    await expect(page.locator("#credentials li").first()).toBeVisible();
  });
});
