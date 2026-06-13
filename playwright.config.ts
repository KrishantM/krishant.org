import { defineConfig } from '@playwright/test';

const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    ...(bypassToken ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': bypassToken } } : {}),
  },
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Auto-start the dev server when no PLAYWRIGHT_BASE_URL is provided.
  // reuseExistingServer lets local devs keep their own `npm run dev` running.
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
});
