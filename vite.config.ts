import { defineConfig } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseShell = ['/', '/privacy/', '/terms/', '/legal.css', '/favicon.svg', '/site.webmanifest', '/assets/hero-recipe-jailbreak-720.webp'];

function appShellPrecache() {
  return {
    name: 'recipe-exit-pack-app-shell-precache',
    async closeBundle() {
      const output = resolve(process.cwd(), 'dist');
      const index = await readFile(resolve(output, 'index.html'), 'utf8');
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
