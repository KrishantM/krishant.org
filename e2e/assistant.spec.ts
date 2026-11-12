import { test, expect, type Page } from "@playwright/test";
import demo from "../src/content/gates-demo.json";
import { evidenceCatalogue } from "../src/lib/evidence";

const catalogue = evidenceCatalogue();
function ev(id: string) {
  const e = catalogue.find((c) => c.id === id);
  if (!e) throw new Error(`no evidence ${id}`);
  return { id: e.id, title: e.title, href: e.href, kind: e.kind, text: e.text };
}

/**
 * The assistant's three modes. Ask and Fit check use mocked /api/ask
 * responses so the suite never spends model calls; the Gates demo needs no
 * backend at all. Set E2E_LIVE_ASSISTANT=1 to also run one real call.
 */

async function openTab(page: Page, name: string) {
  const tab = page.getByRole("tab", { name, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

test.describe("Try Surya Gates", () => {
  test("shows a real verdict for every action", async ({ page }) => {
    await page.goto("/");
    await openTab(page, "Try Surya Gates");
    const panel = page.locator("#panel-gates");
    await expect(panel).toBeVisible();
    const verdict = page.getByTestId("gates-verdict");

    for (const a of demo.actions) {
      await panel.getByRole("radio", { name: a.label, exact: true }).click();
      await expect(verdict).toHaveAttribute("data-verdict", a.verdict.action);
      if (a.verdict.action === "pass") await expect(verdict).toContainText("Carries on");
      if (a.verdict.action === "stop") {
        await expect(verdict).toContainText("Waits for a person");
        await expect(verdict).toContainText(a.verdict.class);
      }
      if (a.verdict.action === "refuse") await expect(verdict).toContainText("Refused outright");
    }
  });

  test("labels the output as real and links the exact code", async ({ page }) => {
    await page.goto("/");
    await openTab(page, "Try Surya Gates");
    const panel = page.locator("#panel-gates");
    await expect(panel).toContainText("Real output from Surya Gates");
    await expect(panel.getByRole("link", { name: /classify\(\) at/ })).toHaveAttribute("href", demo.source.url);
  });

  test("the hero button and the deep link open it", async ({ page }) => {
    await page.goto("/");
    await page.locator("#top").getByRole("button", { name: "Try Surya Gates" }).click();
    await expect(page.getByRole("tab", { name: "Try Surya Gates" })).toHaveAttribute("aria-selected", "true");

    await page.goto("/#try-gates");
    await expect(page.getByRole("tab", { name: "Try Surya Gates" })).toHaveAttribute("aria-selected", "true");
  });

  test("the Gates card's Try it here opens the demo", async ({ page }) => {
    await page.goto("/");
    await page.locator("#tool-surya-gates").getByRole("button", { name: "Try it here" }).click();
    await expect(page.getByRole("tab", { name: "Try Surya Gates" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("gates-verdict")).toBeInViewport();
  });
});

test.describe("Ask (mocked)", () => {
  test("shows the answer, code cards that link to lines, and actions", async ({ page }) => {
    let sent: { mode?: string; message?: string } = {};
    await page.route("**/api/ask", async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({
        json: {
          text: "Gates sorts each call into a class before anything runs. Reading and testing pass, while a push waits for a person.",
          code: [
            {
              repo: "surya-gates",
              path: "surya_gates/rules.py",
              startLine: 298,
              endLine: 310,
              url: `https://github.com/KrishantM/surya-gates/blob/${demo.source.commit}/surya_gates/rules.py#L298-L310`,
              lang: "python",
              text: "def classify(name, args=None, cwd=None):\n    ...",
            },
          ],
          actions: [{ label: "Surya Gates on GitHub", href: "https://github.com/KrishantM/surya-gates" }],
        },
      });
    });
    await page.goto("/");
    await page.locator("#ask-input").fill("How does Gates decide what needs a yes?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.locator("#panel-ask")).toContainText("Gates sorts each call into a class");
    expect(sent.mode).toBe("ask");
    const cards = page.getByTestId("code-cards");
    await expect(cards).toContainText("surya_gates/rules.py");
    await expect(cards).toContainText("lines 298 to 310");
    await expect(cards.getByRole("link").first()).toHaveAttribute("href", /#L298-L310$/);
    await expect(page.locator("#panel-ask").getByRole("link", { name: "Surya Gates on GitHub" })).toBeVisible();
  });

  test("a suggestion sends its query", async ({ page }) => {
    let message = "";
    await page.route("**/api/ask", async (route) => {
      message = route.request().postDataJSON().message;
      await route.fulfill({ json: { text: "You can email me.", actions: [] } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "How can I reach you?" }).click();
    await expect(page.locator("#panel-ask")).toContainText("You can email me.");
    expect(message).toBe("How can I reach you?");
  });

  test("an error shows a friendly message", async ({ page }) => {
    await page.route("**/api/ask", (route) => route.fulfill({ status: 502, json: { text: "Something on my side broke for a second. Try again in a moment." } }));
    await page.goto("/");
    await page.locator("#ask-input").fill("hello");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator("#panel-ask")).toContainText("Something on my side broke");
  });
});

test.describe("Fit check (mocked)", () => {
  const JD =
    "We are hiring an AI engineer to build agentic systems with LangGraph, deploy services on Kubernetes, and work with enterprise clients on cloud architecture across Azure and AWS. Experience with Go and Rust is a plus.";

  test("maps requirements to evidence and offers a conversation for the rest", async ({ page }) => {
    let sent: { mode?: string; message?: string } = {};
    await page.route("**/api/ask", async (route) => {
      sent = route.request().postDataJSON();
      // The real route resolves evidence from this same catalogue.
      await route.fulfill({
        json: {
          fit: {
            matches: [
              { requirement: "Agentic systems with LangGraph", evidence: [ev("build:langchain-langgraph"), ev("tool:project-eval")] },
              { requirement: "Cloud architecture on Azure and AWS", evidence: [ev("pwc")] },
            ],
            discuss: ["Go", "Rust"],
          },
        },
      });
    });
    await page.goto("/");
    await openTab(page, "Fit check");
    await page.locator("#fit-input").fill(JD);
    await page.getByRole("button", { name: "Map it to my work" }).click();

    const result = page.getByTestId("fit-result");
    await expect(result).toContainText("Agentic systems with LangGraph");
    await expect(result.getByRole("link", { name: /Project Eval/ })).toHaveAttribute("href", "https://github.com/KrishantM/project-eval");
    await expect(result.getByRole("link", { name: /Day job at PwC/ })).toHaveAttribute("href", "#day-job");
    // The line under each link is the site's own text for that evidence.
    const texts = await result.getByTestId("fit-evidence-text").allTextContents();
    expect(texts).toEqual([ev("build:langchain-langgraph").text, ev("tool:project-eval").text, ev("pwc").text]);
    await expect(result).toContainText("word for word");
    const discuss = page.getByTestId("fit-discuss");
    await expect(discuss).toContainText("Happy to go deeper on these in a conversation");
    await expect(discuss).toContainText("Rust");
    await expect(discuss.getByRole("link", { name: /Get in touch/ })).toHaveAttribute("href", /^mailto:/);
    await expect(result).not.toContainText(/gap|weakness|lack/i);
    expect(sent.mode).toBe("fit");
    expect(sent.message).toBe(JD);
  });

  test("asks for more when the paste is too short, without calling the API", async ({ page }) => {
    let called = false;
    await page.route("**/api/ask", (route) => {
      called = true;
      return route.fulfill({ json: {} });
    });
    await page.goto("/");
    await openTab(page, "Fit check");
    await page.locator("#fit-input").fill("Python engineer");
    await page.getByRole("button", { name: "Map it to my work" }).click();
    await expect(page.locator("#panel-fit")).toContainText("Paste a bit more");
    expect(called).toBe(false);
  });
});

test.describe("tabs", () => {
  test("arrow keys move between modes and state is kept", async ({ page }) => {
    await page.goto("/");
    const ask = page.getByRole("tab", { name: "Ask", exact: true });
    await ask.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Try Surya Gates" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Fit check" })).toHaveAttribute("aria-selected", "true");
    await page.locator("#fit-input").fill("kept text");
    await openTab(page, "Ask");
    await openTab(page, "Fit check");
    await expect(page.locator("#fit-input")).toHaveValue("kept text");
  });
});

test.describe("API guards", () => {
  test("rejects a bad request and a too-short job description", async ({ request }) => {
    const bad = await request.post("/api/ask", { data: "not json", headers: { "content-type": "application/json" } });
    expect(bad.status()).toBe(400);
    const short = await request.post("/api/ask", { data: { mode: "fit", message: "short" } });
    expect(short.status()).toBe(400);
  });
});

test.describe("live assistant", () => {
  test.skip(!process.env.E2E_LIVE_ASSISTANT, "set E2E_LIVE_ASSISTANT=1 to make one real model call");
  test.setTimeout(90_000);

  test("answers a code question with cited excerpts", async ({ page }) => {
    await page.goto("/");
    await page.locator("#ask-input").fill("How does Surya Gates decide which tool calls need a person's approval?");
    await page.getByRole("button", { name: "Send" }).click();
    const cards = page.getByTestId("code-cards");
    await expect(cards).toBeVisible({ timeout: 75_000 });
    const href = await cards.getByRole("link").first().getAttribute("href");
    expect(href).toMatch(/^https:\/\/github\.com\/KrishantM\/surya-gates\/blob\/[0-9a-f]{40}\/.+#L\d+-L\d+$/);
    const text = await page.locator("#panel-ask").innerText();
    expect(text).not.toContain("—");
  });
});
