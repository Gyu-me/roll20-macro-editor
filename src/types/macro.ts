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

export type ColorPreset = {
  name: string;
  values: Record<string, string>; // colorName (without #) → hex value
};

export type StyleVariant = {
  id: string;
  name: string;
  code: string;
};

export type MacroTemplate = {
  id: string;
  categoryId: MacroCategoryId;
  order: number;
  name: string;
  memo: string;
  previewText: string;
  previewCode?: string;
  previewBackground?: string;
  keywords: string[];
  code: string;
  colorPresets?: ColorPreset[];
  variants?: StyleVariant[];
  fieldDefaults?: Record<string, string>;
};
