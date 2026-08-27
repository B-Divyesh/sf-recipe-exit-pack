import './style.css';
import { buildArchive } from './exporter';
import { imageFromFile, normalizeImage, withPreview } from './images';
import { initializeLicense, verifyLicense } from './license';
import { parseFiles, parseJson, parseRecipeText } from './parser';
import { loadWorkbench, saveWorkbench } from './storage';
import type { LicenseState } from './license';
import type { Recipe } from './types';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const fileInput = $('#file-input') as HTMLInputElement;
const imageInput = $('#image-input') as HTMLInputElement;
const workbench = $('#workbench');
const packPanel = $('#pack-panel');
const importPanel = $('#import-panel');
const recipeList = $('#recipe-list');
const editor = $('#recipe-editor') as HTMLFormElement;
const notice = $('#notice');
const errorNotice = $('#error-notice');
const undoToast = $('#undo-toast');

let recipes: Recipe[] = [];
let selectedId = '';
let unlocked = false;
let removed: { recipe: Recipe; index: number } | null = null;
let undoTimer = 0;
let saveTimer = 0;

function selected(): Recipe | undefined { return recipes.find((recipe) => recipe.id === selectedId); }
function splitLines(value: string): string[] { return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean); }
function showMessage(message: string, error = false): void {
  const target = error ? errorNotice : notice;
  target.textContent = message;
  target.hidden = false;
  if (!error) window.setTimeout(() => { if (target.textContent === message) target.hidden = true; }, 6500);
}
function clearError(): void { errorNotice.hidden = true; errorNotice.textContent = ''; }

function updateConnection(): void {
  const pill = $('#connection-pill');
  pill.textContent = navigator.onLine ? 'Online · local' : 'Offline · ready';
  pill.className = `status-pill ${navigator.onLine ? 'online' : 'offline'}`;
}

function applyRecipeFromForm(): void {
  const recipe = selected();
  if (!recipe) return;
  recipe.title = ($('#recipe-title') as HTMLInputElement).value.trim() || 'Untitled recipe';
  recipe.ingredients = splitLines(($('#ingredients') as HTMLTextAreaElement).value);
  recipe.steps = splitLines(($('#steps') as HTMLTextAreaElement).value);
  recipe.notes = ($('#notes') as HTMLTextAreaElement).value.trim();
  recipe.sourceUrl = ($('#source-url') as HTMLInputElement).value.trim();
  recipe.attribution = ($('#attribution') as HTMLInputElement).value.trim();
  recipe.tags = ($('#tags') as HTMLInputElement).value.split(',').map((tag) => tag.trim()).filter(Boolean);
  scheduleSave();
  renderList();
  renderPackSummary();
}

function fillEditor(): void {
  const recipe = selected();
  if (!recipe) return;
  ($('#recipe-title') as HTMLInputElement).value = recipe.title;
  ($('#ingredients') as HTMLTextAreaElement).value = recipe.ingredients.join('\n');
  ($('#steps') as HTMLTextAreaElement).value = recipe.steps.join('\n');
  ($('#notes') as HTMLTextAreaElement).value = recipe.notes;
  ($('#source-url') as HTMLInputElement).value = recipe.sourceUrl;
  ($('#attribution') as HTMLInputElement).value = recipe.attribution;
  ($('#tags') as HTMLInputElement).value = recipe.tags.join(', ');
  $('#file-origin').textContent = `From ${recipe.originalFile}`;
  const preview = $('#image-preview');
  const status = $('#image-status');
  if (recipe.image) {
    if (!recipe.image.previewUrl) recipe.image = withPreview(recipe.image);
    preview.innerHTML = '';
    const img = new Image();
    img.src = recipe.image.previewUrl!;
    img.alt = `Preview of ${recipe.title}`;
    preview.append(img);
    status.textContent = recipe.image.normalized ? 'Matched and normalized to WebP.' : `Matched ${recipe.image.extension.toUpperCase()} image; preserved in its readable source format.`;
  } else {
    preview.innerHTML = '<span aria-hidden="true">▧</span><p>No matched image</p>';
    status.textContent = 'Add an image if your export did not include one.';
  }
}

function renderList(): void {
  const query = ($('#recipe-search') as HTMLInputElement).value.trim().toLowerCase();
  recipeList.innerHTML = '';
  const filtered = recipes.filter((recipe) => `${recipe.title} ${recipe.tags.join(' ')}`.toLowerCase().includes(query));
  filtered.forEach((recipe) => {
    const index = recipes.indexOf(recipe);
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-current', String(recipe.id === selectedId));
    button.innerHTML = `<span class="recipe-number">${String(index + 1).padStart(2, '0')}</span><span class="recipe-name"><strong></strong><small>${recipe.ingredients.length} ingredients · ${recipe.steps.length} steps</small></span><span aria-hidden="true">›</span>`;
    (button.querySelector('strong') as HTMLElement).textContent = recipe.title;
    button.addEventListener('click', () => { applyRecipeFromForm(); selectedId = recipe.id; renderList(); fillEditor(); if (innerWidth < 850) editor.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    item.append(button); recipeList.append(item);
  });
  $('#empty-filter').hidden = filtered.length > 0;
  $('#recipe-count').textContent = String(recipes.length);
}

function renderPackSummary(): void {
  const withImages = recipes.filter((recipe) => recipe.image).length;
  $('#pack-summary').textContent = `${recipes.length} recipe${recipes.length === 1 ? '' : 's'} ready · ${withImages} matched image${withImages === 1 ? '' : 's'} · source manifest included.`;
}

function updateLayout(): void {
  const hasRecipes = recipes.length > 0;
  workbench.hidden = !hasRecipes;
  packPanel.hidden = !hasRecipes;
  importPanel.hidden = hasRecipes;
  if (!hasRecipes) selectedId = '';
  renderList();
  renderPackSummary();
  if (hasRecipes) fillEditor();
}

function scheduleSave(): void {
  if (!unlocked) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveWorkbench(recipes).catch(() => showMessage('Auto-resume could not save this workbench. Your current recipes are still safe in this tab.', true)), 450);
}

function duplicates(): number {
  const keys = recipes.map((recipe) => `${recipe.title.trim().toLowerCase()}|${recipe.sourceUrl.trim().toLowerCase()}`);
  return keys.length - new Set(keys).size;
}

async function addFiles(files: File[]): Promise<void> {
  if (!files.length) return;
  clearError();
  fileInput.disabled = true;
  showMessage(`Reading ${files.length} supplied file${files.length === 1 ? '' : 's'} locally…`);
  try {
    const result = await parseFiles(files);
    for (const recipe of result.recipes) {
      if (recipe.image) {
        const matchedImage = recipe.image;
        try { recipe.image = await normalizeImage(matchedImage); }
        catch {
          recipe.image = undefined;
          const warning = `Skipped unreadable image ${matchedImage.name}. Choose a valid JPEG, PNG, WebP, GIF, or HEIC replacement.`;
          recipe.warnings.push(warning);
          result.warnings.push(warning);
        }
      }
    }
    recipes.push(...result.recipes);
    if (!selectedId && recipes[0]) selectedId = recipes[0].id;
    updateLayout(); scheduleSave();
    if (result.recipes.length) {
      const dupeText = unlocked && duplicates() ? ` Plus found ${duplicates()} possible duplicate${duplicates() === 1 ? '' : 's'}; compare titles in the stack.` : '';
      showMessage(`Added ${result.recipes.length} recipe${result.recipes.length === 1 ? '' : 's'} from ${result.filesRead} file${result.filesRead === 1 ? '' : 's'}.${dupeText}`);
    }
    if (result.warnings.length) showMessage(result.warnings.join(' '), true);
  } catch (error) {
    showMessage(`Those files could not be read: ${error instanceof Error ? error.message : 'unknown error'}. Try an unencrypted ZIP, JSON, Markdown, or plain text export.`, true);
  } finally { fileInput.disabled = false; fileInput.value = ''; }
}

fileInput.addEventListener('change', () => addFiles(Array.from(fileInput.files ?? [])));
$('#add-more').addEventListener('click', () => { fileInput.click(); });
const dropZone = $('#drop-zone');
for (const name of ['dragenter', 'dragover']) dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
for (const name of ['dragleave', 'drop']) dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); });
dropZone.addEventListener('drop', (event) => addFiles(Array.from((event as DragEvent).dataTransfer?.files ?? [])));

$('#parse-paste').addEventListener('click', () => {
  clearError();
  const input = ($('#paste-input') as HTMLTextAreaElement).value.trim();
  if (!input) { showMessage('Paste a recipe first. Include a title plus ingredients, directions, or notes.', true); return; }
  try {
    const parsed = input.startsWith('{') || input.startsWith('[') ? parseJson(input, 'pasted recipe') : [parseRecipeText(input, 'pasted recipe')];
    if (!parsed.length) throw new Error('No recipe fields were found');
    recipes.push(...parsed); selectedId = parsed[0].id; updateLayout(); scheduleSave();
    ($('#paste-input') as HTMLTextAreaElement).value = '';
    showMessage(`Added ${parsed.length} pasted recipe${parsed.length === 1 ? '' : 's'}. Check the fields before packing.`);
  } catch (error) { showMessage(`The pasted content was not recognized: ${error instanceof Error ? error.message : 'check the format'}.`, true); }
});

for (const field of editor.querySelectorAll('input:not(#image-input), textarea')) field.addEventListener('input', applyRecipeFromForm);
($('#recipe-search') as HTMLInputElement).addEventListener('input', renderList);
imageInput.addEventListener('change', async () => {
  const recipe = selected(); const file = imageInput.files?.[0];
  if (!recipe || !file) return;
  $('#image-status').textContent = 'Normalizing image locally…';
  try { recipe.image = await imageFromFile(file); fillEditor(); scheduleSave(); renderPackSummary(); }
  catch { showMessage('That image could not be decoded. Try JPEG, PNG, WebP, or a different HEIC export.', true); }
  imageInput.value = '';
});

$('#remove-recipe').addEventListener('click', () => {
  const index = recipes.findIndex((recipe) => recipe.id === selectedId);
  if (index < 0) return;
  removed = { recipe: recipes[index], index };
  recipes.splice(index, 1);
  selectedId = recipes[Math.min(index, recipes.length - 1)]?.id ?? '';
  updateLayout(); scheduleSave();
  undoToast.hidden = false;
  window.clearTimeout(undoTimer);
  undoTimer = window.setTimeout(() => { removed = null; undoToast.hidden = true; }, 8000);
});
$('#undo-remove').addEventListener('click', () => {
  if (!removed) return;
  recipes.splice(removed.index, 0, removed.recipe); selectedId = removed.recipe.id; removed = null;
  window.clearTimeout(undoTimer); undoToast.hidden = true; updateLayout(); scheduleSave();
});

$('#download-pack').addEventListener('click', async () => {
  applyRecipeFromForm();
  if (!recipes.length) { showMessage('Add at least one recipe before downloading.', true); return; }
  const invalid = recipes.find((recipe) => !recipe.title.trim());
  if (invalid) { selectedId = invalid.id; fillEditor(); showMessage('Every recipe needs a title before packing.', true); return; }
  const progress = $('#export-progress'); const button = $('#download-pack') as HTMLButtonElement;
  progress.hidden = false; button.disabled = true;
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 40)));
  try {
    const result = buildArchive(recipes, { archiveName: ($('#archive-name') as HTMLInputElement).value, includeYaml: unlocked && ($('#include-yaml') as HTMLInputElement).checked });
    const url = URL.createObjectURL(new Blob([result.bytes as BlobPart], { type: 'application/zip' }));
    const link = document.createElement('a'); link.href = url; link.download = result.fileName; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    showMessage(`Exit pack downloaded: ${recipes.length} recipes and ${result.imageCount} images. Keep the ZIP somewhere you control.`);
  } catch (error) { showMessage(`The archive could not be built: ${error instanceof Error ? error.message : 'unknown error'}. Your recipes remain in this tab.`, true); }
  finally { progress.hidden = true; button.disabled = false; }
});

function applyLicenseState(state: LicenseState): void {
  const wasUnlocked = unlocked;
  unlocked = state.unlocked;
  const label = $('#license-state');
  const yaml = $('#include-yaml') as HTMLInputElement;
  yaml.disabled = !unlocked;
  $('#yaml-option').classList.toggle('locked-option', !unlocked);
  if (state.checking) label.textContent = state.unlocked ? 'Archive Plus · checking' : 'Checking license…';
  else if (state.unlocked) label.textContent = 'Archive Plus unlocked';
  else if (state.reason === 'network') label.textContent = 'License check unavailable';
  else if (state.reason && state.reason !== 'ok') label.textContent = 'License no longer active';
  else label.textContent = 'Free edition';
  if (unlocked && !wasUnlocked) {
    loadWorkbench().then((saved) => {
      if (!recipes.length && saved.length) {
        recipes = saved.map((recipe) => ({ ...recipe, image: recipe.image ? withPreview(recipe.image) : undefined }));
        selectedId = recipes[0]?.id ?? ''; updateLayout(); showMessage(`Restored ${recipes.length} recipe${recipes.length === 1 ? '' : 's'} from your local Plus workbench.`);
      } else scheduleSave();
    }).catch(() => { /* optional restore */ });
  }
}

$('#license-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const token = ($('#license-input') as HTMLInputElement).value.trim();
  const message = $('#license-message');
  if (!token) { message.textContent = 'Paste the license token from your receipt.'; return; }
  message.textContent = 'Checking with Sociobot…';
  verifyLicense(token, (state) => { applyLicenseState(state); if (!state.checking) message.textContent = state.unlocked ? 'License restored on this device.' : state.reason === 'network' ? 'Could not reach verification. Try again when online.' : 'That license is not active for Recipe Exit Pack.'; });
});

window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
initializeLicense(applyLicenseState);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { /* offline remains optional */ }));
