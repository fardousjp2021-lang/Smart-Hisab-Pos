import { test, expect, type Page } from '@playwright/test';

// The sync lamp must be emerald ONLY when every task is succeeded (or
// nothing is outstanding). Any pending / syncing / failed work must switch
// it away from emerald. We drive the assertion off /dev/sync-dot, which
// renders every state through the same pure helper used in production.

// Tailwind's `bg-emerald-400` resolves to this OKLCH value at runtime.
const EMERALD_RGB_MATCHER = /^(?:rgb|oklch|oklab)\(/; // any color format
const EMERALD_HUE_HINTS = ['emerald', '163.223', '52, 211, 153', '#34d399'];

const isEmerald = (color: string): boolean => {
  const c = color.toLowerCase();
  if (c.includes('163.223')) return true;              // oklch emerald-400
  if (c.includes('rgb(52, 211, 153)')) return true;    // emerald-400 fallback
  if (c.includes('#34d399')) return true;
  return false;
};

async function dotColorForStory(page: Page, storyTitle: string): Promise<string> {
  return page.evaluate((title) => {
    const heading = [...document.querySelectorAll('h3')].find(
      (h) => (h.textContent || '').trim() === title,
    );
    if (!heading) throw new Error(`story not found: ${title}`);
    const card = heading.parentElement!;
    const dot = card.querySelector('span[aria-hidden="true"]') as HTMLElement | null;
    if (!dot) throw new Error(`dot not found in story: ${title}`);
    return getComputedStyle(dot).backgroundColor;
  }, storyTitle);
}

test.describe('aggregate sync lamp color', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/sync-dot', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Sync Dot — Stories' })).toBeVisible();
  });

  test('is emerald when all tasks are succeeded', async ({ page }) => {
    const color = await dotColorForStory(page, 'Aggregate — all succeeded');
    expect(isEmerald(color), `expected emerald, got ${color}`).toBe(true);
  });

  test('is NOT emerald in any non-succeeded aggregate state', async ({ page }) => {
    const nonEmeraldStories = [
      'Aggregate — empty (no items)',
      'Aggregate — only queued',
      'Aggregate — only syncing',
      'Aggregate — syncing + queued',
      'Aggregate — only failed',
      'Aggregate — failed + pending (mixed)',
    ];

    for (const title of nonEmeraldStories) {
      const color = await dotColorForStory(page, title);
      expect(isEmerald(color), `story "${title}" unexpectedly emerald (${color})`).toBe(false);
    }
  });

  test('per-status "Succeeded" dot is emerald, others are not', async ({ page }) => {
    const succeededColor = await page.evaluate(() => {
      // "Per-status dots" card renders one row per status with the label text.
      const heading = [...document.querySelectorAll('h3')].find(
        (h) => (h.textContent || '').trim() === 'Per-status dots',
      )!;
      const card = heading.parentElement!;
      const rows = [...card.querySelectorAll('li')];
      const row = rows.find((li) => (li.textContent || '').toLowerCase().includes('succeeded'))!;
      const dot = row.querySelector('span[aria-hidden="true"]') as HTMLElement;
      return getComputedStyle(dot).backgroundColor;
    });
    expect(isEmerald(succeededColor), `expected emerald, got ${succeededColor}`).toBe(true);

    const otherColors = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('h3')].find(
        (h) => (h.textContent || '').trim() === 'Per-status dots',
      )!;
      const card = heading.parentElement!;
      return [...card.querySelectorAll('li')]
        .filter((li) => !(li.textContent || '').toLowerCase().includes('succeeded'))
        .map((li) => {
          const dot = li.querySelector('span[aria-hidden="true"]') as HTMLElement;
          return getComputedStyle(dot).backgroundColor;
        });
    });

    for (const c of otherColors) {
      expect(isEmerald(c), `non-succeeded per-status dot unexpectedly emerald (${c})`).toBe(false);
    }
  });
});

// Silence unused var warnings for the intent-documenting constants above.
void EMERALD_RGB_MATCHER;
void EMERALD_HUE_HINTS;
