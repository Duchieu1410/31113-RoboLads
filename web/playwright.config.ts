import { defineConfig } from '@playwright/test';

const WIDTHS = [375, 768, 1280, 1920] as const;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  reporter: 'list',
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
  projects: WIDTHS.map((width) => ({
    name: `w${width}`,
    use: { browserName: 'chromium' as const, viewport: { width, height: width < 700 ? 800 : 900 } },
  })),
});
