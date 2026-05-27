export type MacroCategoryId =
  | "basic"
  | "roll"
  | "secret"
  | "scene"
  | "info"
  | "decorate"
  | "message"
  | "effect"
  | "custom";

export type MacroCategory = {
  id: MacroCategoryId;
  name: string;
  description: string;
  order: number;
};

export type MacroTemplate = {
  id: string;
  categoryId: MacroCategoryId;
  order: number;
  name: string;
  memo: string;
  previewText: string;
  keywords: string[];
  code: string;
};