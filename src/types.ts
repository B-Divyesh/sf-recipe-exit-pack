export interface RecipeImage {
  name: string;
  mime: string;
  extension: string;
  bytes: Uint8Array;
  previewUrl?: string;
  normalized: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  notes: string;
  sourceUrl: string;
  attribution: string;
  tags: string[];
  image?: RecipeImage;
  originalFile: string;
  warnings: string[];
  imageHints?: string[];
}

export interface ParseResult {
  recipes: Recipe[];
  warnings: string[];
  filesRead: number;
}

export interface ExportOptions {
  archiveName: string;
  includeYaml: boolean;
}
