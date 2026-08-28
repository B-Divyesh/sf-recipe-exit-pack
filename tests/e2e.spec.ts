import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { strFromU8, unzipSync } from 'fflate';

async function openDemo(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Recipe Exit Pack');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveValue('Weeknight lemon pasta');
}

test('pasted recipe can be checked and downloaded without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Recipe Exit Pack/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByText('Paste one recipe instead').click();
  await page.getByLabel('Recipe text or JSON').fill(`# Test Pancakes

Ingredients
- 1 cup flour
- 1 egg

Directions
1. Mix everything.
2. Cook in a pan.

Notes
Sunday breakfast.

Source: https://example.com/pancakes
Author: Test Kitchen`);
  await page.getByRole('button', { name: 'Add pasted recipe' }).click();
  await expect(page.getByLabel('Title')).toHaveValue('Test Pancakes');
  await expect(page.getByText('1 recipe ready')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download recipe ZIP/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('my-recipe-exit-pack.zip');
  expect(errors).toEqual([]);
});

test('landing page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  expect(blocking, blocking.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
});

test('user-supplied JSON and image files are matched locally', async ({ page }) => {
  await page.goto('/');
  const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  await page.locator('#file-input').setInputFiles([
    { name: 'cake.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ name: 'Archive Cake', ingredients: ['flour'], directions: ['Bake.'], source_url: 'https://example.com/cake', photo_filename: 'cake.png' })) },
    { name: 'cake.png', mimeType: 'image/png', buffer: onePixelPng }
  ]);
  await expect(page.getByLabel('Title')).toHaveValue('Archive Cake');
  await expect(page.locator('#image-preview img')).toBeVisible();
  await expect(page.getByLabel('Source URL')).toHaveValue('https://example.com/cake');
});

test('rejects corrupt image replacements and keeps the previous readable image', async ({ page }) => {
  const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  await page.goto('/');
  await page.locator('#file-input').setInputFiles([
    { name: 'cake.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ name: 'Archive Cake', ingredients: ['flour'], directions: ['Bake.'] })) },
    { name: 'cake.png', mimeType: 'image/png', buffer: onePixelPng }
  ]);
  await expect(page.locator('#image-preview img')).toHaveJSProperty('naturalWidth', 1);
  await page.locator('#image-input').setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('this is not an image') });
  await expect(page.getByRole('alert')).toContainText('That image could not be decoded');
  await expect(page.locator('#image-preview img')).toHaveJSProperty('naturalWidth', 1);
  await page.locator('#image-input').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: onePixelPng });
  await expect(page.locator('#image-preview img')).toHaveJSProperty('naturalWidth', 1);
});

test('skips corrupt matched images so they cannot be exported', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles([
    { name: 'cake.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ name: 'Archive Cake', ingredients: ['flour'], directions: ['Bake.'], photo_filename: 'cake.png' })) },
    { name: 'cake.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') }
  ]);
  await expect(page.getByRole('alert')).toContainText('Skipped unreadable image cake.png');
  await expect(page.locator('#image-preview img')).toHaveCount(0);
  await expect(page.getByText('No matched image')).toBeVisible();
  await expect(page.getByText('0 matched images')).toBeVisible();
});

test('390px layout fits and remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.locator('.hero-art img')).toBeVisible();
});

test('legal pages expose one heading and a main landmark', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('demo, legal, and 404 routes have their own titles, metadata, and focus target', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Recipe Exit Pack');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://recipe-exit-pack.sociobot.in/demo/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Demo loaded.');
  await page.goto('/404/');
  await expect(page).toHaveTitle('Page not found — Recipe Exit Pack');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Go to the converter' })).toBeVisible();
});

test('installed shell reopens offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/Recipe Exit Pack/);
  await page.getByText('Paste one recipe instead').click();
  await page.getByLabel('Recipe text or JSON').fill('Offline Toast\n\nIngredients\n- bread\n\nDirections\n1. Toast it.');
  await page.getByRole('button', { name: 'Add pasted recipe' }).click();
  await expect(page.getByLabel('Title')).toHaveValue('Offline Toast');
});

test('an updated service worker precaches the current app shell for offline reload', async ({ page, context }) => {
  const path = resolve(process.cwd(), 'dist/sw.js');
  const serviceWorker = await readFile(path, 'utf8');
  expect(serviceWorker).toMatch(/\/assets\/main-[^']+\.js/);
  expect(serviceWorker).toMatch(/\/assets\/main-[^']+\.css/);
  try {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await writeFile(path, serviceWorker.replace("recipe-exit-pack-v2", 'recipe-exit-pack-regression-update'));
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const controllerChanged = new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Updated service worker did not take control')), 5_000);
        navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(timeout); resolve(); }, { once: true });
      });
      await registration.update();
      await controllerChanged;
    });
    const updatedCache = await page.evaluate(async () => {
      const cache = await caches.open('recipe-exit-pack-regression-update');
      return (await cache.keys()).map((key) => new URL(key.url).pathname);
    });
    expect(updatedCache).toEqual(expect.arrayContaining([
      expect.stringMatching(/^\/assets\/main-.+\.js$/),
      expect.stringMatching(/^\/assets\/main-.+\.css$/)
    ]));
    await page.reload();
    await expect(page.locator('#connection-pill')).toHaveText('Online · local');
    await context.setOffline(true);
    await page.reload();
    await expect(page).toHaveTitle(/Recipe Exit Pack/);
    await page.getByText('Paste one recipe instead').click();
    await page.getByLabel('Recipe text or JSON').fill('Updated Offline Toast\n\nIngredients\n- bread\n\nDirections\n1. Toast it.');
    await page.getByRole('button', { name: 'Add pasted recipe' }).click();
    await expect(page.getByLabel('Title')).toHaveValue('Updated Offline Toast');
  } finally {
    await writeFile(path, serviceWorker);
  }
});

test('@claim:recipe-zip-content demo download contains each promised file type', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download recipe ZIP/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const entries = unzipSync(new Uint8Array(await readFile(path!)));
  const names = Object.keys(entries);
  expect(names).toEqual(expect.arrayContaining([
    'recipes/001-weeknight-lemon-pasta/recipe.md',
    'recipes/001-weeknight-lemon-pasta/metadata.json',
    'recipes/001-weeknight-lemon-pasta/image.png',
    'manifest/sources.md',
    'manifest/recipes.json'
  ]));
  expect(strFromU8(entries['manifest/sources.md'])).toContain('Mara Lee');
});

test('@claim:demo-isolation sample edits reset without opening real storage', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Title').fill('Changed sample title');
  await page.waitForTimeout(550);
  const before = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(before).toContain('demo:recipe-exit-pack');
  expect(before).not.toContain('recipe-exit-pack');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Title')).toHaveValue('Weeknight lemon pasta');
  const after = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(after).toContain('demo:recipe-exit-pack');
  expect(after).not.toContain('recipe-exit-pack');
});

test('@claim:offline-after-first-visit demo reloads and edits offline', async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle('Demo — Recipe Exit Pack');
  await page.getByLabel('Title').fill('Offline sample recipe');
  await expect(page.getByLabel('Title')).toHaveValue('Offline sample recipe');
});

test('@claim:no-recipe-uploads sample review and download make same-origin requests only', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.locator('#notes').fill('Checked in the isolated demo.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download recipe ZIP/ }).click();
  await downloadPromise;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('@claim:no-tracking demo makes no third-party requests during review and download', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download recipe ZIP/ }).click();
  await downloadPromise;
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('@claim:free-download sample ZIP downloads with no stored license', async ({ page }) => {
  await page.goto('/demo/');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('sb_license:')))).toEqual([]);
  await expect(page.getByLabel('Title')).toHaveValue('Weeknight lemon pasta');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download recipe ZIP/ }).click();
  await expect(await downloadPromise).toBeTruthy();
});
