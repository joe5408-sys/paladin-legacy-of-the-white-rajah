import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests against the production build (`vite preview`), i.e. the same
 * files Netlify serves. Uses the locally installed Microsoft Edge by default so
 * no browser download is needed; set PW_CHANNEL=chrome (or chromium after
 * `npx playwright install chromium`) to use another browser.
 *
 * Run with: npm run e2e
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // the game is timing-sensitive; keep runs sequential
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4173',
    channel: process.env.PW_CHANNEL ?? 'msedge',
    headless: true,
    viewport: { width: 960, height: 540 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Test the live site instead with: E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npm run e2e
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
