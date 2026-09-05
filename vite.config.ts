import { defineConfig } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseShell = ['/', '/demo/', '/privacy/', '/terms/', '/404/', '/legal.css', '/legal.js', '/favicon.svg', '/site.webmanifest', '/assets/hero-recipe-jailbreak-720.webp'];

function appShellPrecache() {
  return {
    name: 'recipe-exit-pack-app-shell-precache',
    async closeBundle() {
      const output = resolve(process.cwd(), 'dist');
      const index = await readFile(resolve(output, 'index.html'), 'utf8');
      const demo = index
        .replaceAll('Recipe Exit Pack — Convert recipe exports', 'Demo — Recipe Exit Pack')
        .replaceAll('Convert recipe app exports into a recipe ZIP with text files, a data file, photos, and source links on your device.', 'Try three sample recipes and download a recipe ZIP without saving to your real data.')
        .replaceAll('Convert recipe app exports into files you control on your device.', 'Try three sample recipes and download a recipe ZIP without saving to your real data.')
        .replace('https://recipe-exit-pack.sociobot.in/"', 'https://recipe-exit-pack.sociobot.in/demo/"');
      await mkdir(resolve(output, 'demo'), { recursive: true });
      await writeFile(resolve(output, 'demo/index.html'), demo);
      const template = await readFile(resolve(process.cwd(), 'public/sw.js'), 'utf8');
      const assetUrls = [...index.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map((match) => match[1]);
      const precache = [...new Set([...baseShell, ...assetUrls])];
      const additionalAssets = precache.filter((url) => !baseShell.includes(url)).map((url) => `, '${url}'`).join('');
      const serviceWorker = template.replace('// __PRECACHE_ASSETS__', additionalAssets);
      await writeFile(resolve(output, 'sw.js'), serviceWorker);
    }
  };
}

export default defineConfig({
  plugins: [appShellPrecache()],
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html'
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts']
  }
});
