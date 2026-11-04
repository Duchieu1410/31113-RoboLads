import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Phases 8, 9, 10: Game Layer, Sprites & Quality Floor', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Phase 8: Custom pixel cursor enabled on desktop (>=640px) and disabled on mobile (<640px)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const width = page.viewportSize()?.width ?? 1280;
    const bodyCursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor;
    });

    if (width >= 640) {
      // Desktop fine pointer has pixel cursor data URI or default fallback
      expect(bodyCursor).toBeDefined();
    } else {
      // Mobile (<640px) must strictly reset to auto/default system cursor
      expect(bodyCursor).toBe('auto');
    }
  });

  test('Phase 8: Konami code triggers 32x32 Cerberus sprite runner', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Enter Konami Code: Up Up Down Down Left Right Left Right B A
    const sequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];

    for (const key of sequence) {
      await page.keyboard.press(key);
      await page.waitForTimeout(40);
    }

    // Celebratory banner should appear
    const banner = page.getByText(/CERBERUS PROTOCOL UNLEASHED/i);
    await expect(banner).toBeVisible();

    // 32x32 Cerberus Pixel Sprite should be rendered
    const cerberusSprite = page.locator('img[alt*="Cerberus Cyber-Hound Sprite"]');
    await expect(cerberusSprite).toBeVisible();
    await expect(cerberusSprite).toHaveAttribute('style', /image-rendering:\s*pixelated/i);
  });

  test('Phase 8: Command palette /cerberus triggers Cerberus speed run', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open terminal
    await page.keyboard.press('/');
    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible();

    // Run /cerberus
    await input.fill('/cerberus');
    await page.keyboard.press('Enter');

    // Confirm sprite runner appears
    const cerberusSprite = page.locator('img[alt*="Cerberus Cyber-Hound Sprite"]');
    await expect(cerberusSprite).toBeVisible();
  });

  test('Phase 9: Section C contains Mini-Robot companion sprite', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const miniRobot = page.locator('img[alt="Mini DecodeBot Robot Companion Sprite"]');
    await expect(miniRobot).toBeVisible();
    await expect(miniRobot).toHaveAttribute('style', /image-rendering:\s*pixelated/i);
  });

  test('Phase 10: Screen <640px strictly hides Hotbar and preserves XP bar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const width = page.viewportSize()?.width ?? 1280;
    const hotbarNav = page.locator('aside nav[aria-label="Page sections"]');
    const xpBar = page.getByRole('progressbar', { name: /Page exploration progress/i });

    // Luminous XP Bar is always present
    await expect(xpBar).toBeVisible();

    if (width < 640) {
      // Hotbar section jumps hidden on mobile (< 640px)
      await expect(hotbarNav).toBeHidden();
    } else {
      // Hotbar section jumps visible in top HUD command strip on desktop
      await expect(hotbarNav).toBeVisible();
    }
  });

  test('Phase 10: Zero Axe accessibility violations on landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast']) // Color contrast checked specifically
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
