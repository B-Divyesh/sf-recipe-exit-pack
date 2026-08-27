import type { RecipeImage } from './types';

function extensionFor(mime: string): string {
  return (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
}

async function imageBitmapFrom(blob: Blob): Promise<ImageBitmap> {
  if ('createImageBitmap' in window) return createImageBitmap(blob);
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) { URL.revokeObjectURL(url); reject(new Error('Canvas is unavailable')); return; }
      context.drawImage(image, 0, 0);
      createImageBitmap(canvas).then(resolve, reject).finally(() => URL.revokeObjectURL(url));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be decoded')); };
    image.src = url;
  });
}

export async function normalizeImage(image: RecipeImage): Promise<RecipeImage> {
  if (image.mime === 'image/gif' || image.extension === 'gif') return withPreview(image);
  let blob = new Blob([image.bytes as BlobPart], { type: image.mime });
  if (['heic', 'heif'].includes(image.extension) || /hei[cf]/.test(image.mime)) {
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.9 });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }
  try {
    const bitmap = await imageBitmapFrom(blob);
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const output = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('WebP conversion failed')), 'image/webp', 0.82));
    const bytes = new Uint8Array(await output.arrayBuffer());
    return withPreview({ name: image.name.replace(/\.[^.]+$/, '.webp'), mime: 'image/webp', extension: 'webp', bytes, normalized: true });
  } catch {
    return withPreview({ ...image, mime: blob.type || image.mime, extension: extensionFor(blob.type || image.mime), bytes: new Uint8Array(await blob.arrayBuffer()), normalized: false });
  }
}

export function withPreview(image: RecipeImage): RecipeImage {
  if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
  return { ...image, previewUrl: URL.createObjectURL(new Blob([image.bytes as BlobPart], { type: image.mime })) };
}

export function imageFromFile(file: File): Promise<RecipeImage> {
  const extension = file.name.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg') || extensionFor(file.type);
  return file.arrayBuffer().then((buffer) => normalizeImage({ name: file.name, mime: file.type || `image/${extension}`, extension, bytes: new Uint8Array(buffer), normalized: false }));
}
