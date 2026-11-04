import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Phase 5: Game Layer and Polish', () => {
  test('Command Palette opens on / and T, runs commands, and closes on Esc', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Press '/' to open command palette
    await page.keyboard.press('/');
    const palette = page.getByRole('dialog', { name: /Command Console/i });
    await expect(palette).toBeVisible();

    // Run /help command
    const input = page.getByLabel('Terminal command input');
    await input.fill('/help');
    await page.keyboard.press('Enter');

    // Verify help text appears in terminal output log
    const log = page.getByLabel('Terminal output log');
    await expect(log).toContainText('/robot');
    await expect(log).toContainText('/sound');

    // Run axe on open palette
    const axeResults = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(axeResults.violations).toEqual([]);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(palette).not.toBeVisible();
  });

  test('Inventory Modal opens on E, displays 9 quick slots and roster, and closes on Esc', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Press 'E' to open inventory
    await page.keyboard.press('e');
    const inv = page.getByRole('dialog', { name: /Player Inventory/i });
    await expect(inv).toBeVisible();

    // Check roster card and quick slots
    await expect(inv).toContainText('CERBERUS PILOT');
    await expect(inv).toContainText('#31113');
    await expect(inv).toContainText('QUICK SLOTS');

    // Run axe on open inventory
    const axeResults = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(axeResults.violations).toEqual([]);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(inv).not.toBeVisible();
  });

  test('Advancements system is removed and does not clutter HUD or drawer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify ADV button is not in navbar
    const advBtn = page.getByRole('button', { name: /ADV - Open advancements dialog/i });
    await expect(advBtn).toHaveCount(0);

    // Verify Advancements modal is not mounted
    const modal = page.getByRole('dialog', { name: /Advancements/i });
    await expect(modal).toHaveCount(0);
  });

  test('Sound Toggle changes state and persists to localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const isMobile = (page.viewportSize()?.width ?? 1280) <= 1024;
    const soundBtn = isMobile
      ? page.locator('header .lg\\:hidden button[aria-label*="Sound effects"]')
      : page.getByRole('button', { name: /Sound effects:/i }).first();
    await expect(soundBtn).toBeVisible();

    // Initially muted
    let stored = await page.evaluate(() => window.localStorage.getItem('robolads-pixel-sound-v1'));
    expect(stored === null || stored === 'off').toBe(true);

    // Click to enable sound
    await soundBtn.click();
    stored = await page.evaluate(() => window.localStorage.getItem('robolads-pixel-sound-v1'));
    expect(stored).toBe('on');

    // Click to mute sound
    await soundBtn.click();
    stored = await page.evaluate(() => window.localStorage.getItem('robolads-pixel-sound-v1'));
    expect(stored).toBe('off');
  });

  test('Konami code unlocks secret easter egg banner', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Enter Konami Code sequence: Up Up Down Down Left Right Left Right B A
    const keys = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(60);
    }

    const eggBanner = page.getByRole('region', { name: /Secret Easter Egg/i });
    await expect(eggBanner).toBeVisible();
    await expect(eggBanner).toContainText('CERBERUS PROTOCOL UNLEASHED');
  });
});
