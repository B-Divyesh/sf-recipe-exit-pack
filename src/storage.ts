import type { Recipe } from './types';

const DB_NAME = 'recipe-exit-pack';
const STORE = 'workbench';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveWorkbench(recipes: Recipe[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(recipes.map((recipe) => ({ ...recipe, image: recipe.image ? { ...recipe.image, previewUrl: undefined } : undefined })), KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadWorkbench(): Promise<Recipe[]> {
  const db = await openDb();
  const recipes = await new Promise<Recipe[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve((request.result as Recipe[] | undefined) ?? []);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return recipes;
}

export async function clearWorkbench(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}
