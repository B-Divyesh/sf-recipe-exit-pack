import type { Recipe } from './types';

const DEMO_DB_NAME = 'demo:recipe-exit-pack';
const STORE = 'workbench';
const KEY = 'current';

function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function save(dbName: string, recipes: Recipe[]): Promise<void> {
  const db = await openDb(dbName);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(recipes.map((recipe) => ({ ...recipe, image: recipe.image ? { ...recipe.image, previewUrl: undefined } : undefined })), KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function load(dbName: string): Promise<Recipe[]> {
  const db = await openDb(dbName);
  const recipes = await new Promise<Recipe[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve((request.result as Recipe[] | undefined) ?? []);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return recipes;
}

async function clear(dbName: string): Promise<void> {
  const db = await openDb(dbName);
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

// Demo data is deliberately kept in its own IndexedDB namespace. The demo
// never opens a real-workbench database.
export const saveDemoWorkbench = (recipes: Recipe[]) => save(DEMO_DB_NAME, recipes);
export const loadDemoWorkbench = () => load(DEMO_DB_NAME);
export const clearDemoWorkbench = () => clear(DEMO_DB_NAME);
