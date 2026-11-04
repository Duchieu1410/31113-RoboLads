import { test, expect } from '@playwright/test';

test.describe('Phase 7: Interactive Mastery & World Evolution', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('3D subsystem callout pins exist on stage, are clickable, and focus chapters', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to 3D robot section
    const robotSection = page.locator('#robot-target');
    await robotSection.scrollIntoViewIfNeeded();

    // Hotspot callout pins (01, 02, 03, 04)
    const pin1 = page.getByRole('button', { name: /01\. Focus .*CHASSIS/i });
    await expect(pin1).toBeAttached();

    // Click pin 1 to focus chassis
    await pin1.dispatchEvent('click');

    // Verify 'subsystems' advancement is unlocked in localStorage
    await expect.poll(async () => {
      return page.evaluate(() => {
        const stored = window.localStorage.getItem('robolads-advancements-v1');
        return stored ? JSON.parse(stored).subsystems : undefined;
      });
    }).toBeDefined();
  });

  test('Failure Log page displays Lessons Learned post-mortem framing', async ({ page }) => {
    await page.goto('/resources?category=Failure%20Log', { waitUntil: 'networkidle' });

    // Header banner
    const banner = page.getByText(/LESSONS LEARNED \/\/ POST-MORTEM BUILD LOGS/i);
    await expect(banner).toBeVisible();
  });

  test('World time-of-day cycles via /time command and updates hero badge', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Press / to open Command Palette
    await page.keyboard.press('/');
    const terminalInput = page.getByLabel('Terminal command input');
    await expect(terminalInput).toBeVisible();

    // Run /time day
    await terminalInput.fill('/time day');
    await page.keyboard.press('Enter');

    // Terminal log confirms DAY
    const log = page.getByLabel('Terminal output log');
    await expect(log).toContainText('DAY');

    // Verify hero badge updated
    const timeBadge = page.getByTestId('world-time-badge');
    await expect(timeBadge).toHaveText('DAY');

    // Run /time sunset
    await terminalInput.fill('/time sunset');
    await page.keyboard.press('Enter');
    await expect(log).toContainText('SUNSET');
    await expect(timeBadge).toHaveText('SUNSET');

    // Verify time_traveler advancement unlocked
    await expect.poll(async () => {
      return page.evaluate(() => {
        const stored = window.localStorage.getItem('robolads-advancements-v1');
        return stored ? JSON.parse(stored).time_traveler : undefined;
      });
    }).toBeDefined();
  });

  test('Cerberus mascot logo 5 clicks cycles world time and unlocks time_traveler', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const logoBtn = page.getByRole('button', { name: /HSGS RoboLads Cerberus mascot logo/i }).first();
    await expect(logoBtn).toBeVisible();

    // Click 5 times
    for (let i = 0; i < 5; i++) {
      await logoBtn.click();
    }

    // World time should cycle from NIGHT to DAY
    const timeBadge = page.getByTestId('world-time-badge');
    await expect(timeBadge).toHaveText('DAY');

    await expect.poll(async () => {
      return page.evaluate(() => {
        const stored = window.localStorage.getItem('robolads-advancements-v1');
        const parsed = stored ? JSON.parse(stored) : {};
        return parsed.time_traveler && parsed.konami ? true : undefined;
      });
    }).toBe(true);
  });

  test('Command Palette /search command returns filtered resources with links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open terminal
    await page.keyboard.press('/');
    const terminalInput = page.getByLabel('Terminal command input');
    await expect(terminalInput).toBeVisible();

    // Run /search odometry
    await terminalInput.fill('/search odometry');
    await page.keyboard.press('Enter');

    // Output should show results
    const log = page.getByLabel('Terminal output log');
    await expect(log).toContainText('Pinpoint Odometry');
  });

  test('Top HUD Command Strip contains luminous XP bar with LVL badge', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const xpBar = page.getByRole('progressbar', { name: /Page exploration progress/i });
    await expect(xpBar).toBeVisible();

    const lvlBadge = page.locator('.px-xp__badge');
    await expect(lvlBadge).toBeVisible();
    await expect(lvlBadge).toContainText('LVL');
  });
});
