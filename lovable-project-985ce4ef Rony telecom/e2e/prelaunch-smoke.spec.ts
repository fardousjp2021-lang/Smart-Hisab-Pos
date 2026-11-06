/**
 * Pre-launch smoke suite.
 *
 * Fast browser-level checks that complement the static/live verifier in
 * scripts/prelaunch-verify.mjs. These run against the dev preview by
 * default; point PLAYWRIGHT_BASE_URL at a production URL for a live
 * smoke run in CI.
 *
 * These tests never write to Firestore and never mutate business data —
 * they only assert that the app renders, guards work, and public
 * artefacts (manifest, service worker script) are reachable.
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080';

test.describe('Pre-launch smoke', () => {
  test('home renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    // Filter out well-known noisy Firestore permission-denied bootstrap noise
    // that only occurs when running without a live session.
    const meaningful = errors.filter((e) => !/permission-denied|Missing or insufficient permissions/i.test(e));
    expect(meaningful, meaningful.join('\n')).toEqual([]);
  });

  test('web app manifest is served and installable', async ({ request }) => {
    const res = await request.get(`${BASE}/manifest.webmanifest`);
    expect(res.ok()).toBeTruthy();
    const m = await res.json();
    expect(m.name).toBeTruthy();
    expect(m.icons?.length ?? 0).toBeGreaterThan(0);
    expect(['standalone', 'fullscreen']).toContain(m.display);
  });

  test('offline fallback page is reachable', async ({ request }) => {
    const res = await request.get(`${BASE}/offline.html`);
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body.length).toBeGreaterThan(20);
  });

  test('session persistence — reload keeps route', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('private route guard resolves (does not hang)', async ({ page }) => {
    const res = await page.goto(`${BASE}/sales`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    expect(res?.status() ?? 200).toBeLessThan(500);
  });
});
