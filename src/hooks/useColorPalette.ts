"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "roll20-color-palette";
const MAX_COLORS = 12;

export function useColorPalette() {
  const [colors, setColors] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  }, [colors]);

  const saveColor = useCallback((color: string) => {
    const upper = color.toUpperCase();
    setColors((prev) => {
      if (prev.includes(upper)) return prev;
      return [upper, ...prev].slice(0, MAX_COLORS);
    });
  }, []);

  const removeColor = useCallback((color: string) => {
    const upper = color.toUpperCase();
    setColors((prev) => prev.filter((c) => c !== upper));
  }, []);

  return { colors, saveColor, removeColor };
}
