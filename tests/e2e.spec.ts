import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  await page.getByRole('button', { name: /Download exit pack/ }).click();
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
  await expect(page.getByRole('link', { name: /Pack my recipes/ })).toBeVisible();
  await expect(page.locator('.hero-art img')).toBeVisible();
});

test('legal pages expose one heading and a main landmark', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
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
    await writeFile(path, serviceWorker.replace("recipe-exit-pack-v1", 'recipe-exit-pack-regression-update'));
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
