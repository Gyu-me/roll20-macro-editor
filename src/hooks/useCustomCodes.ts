"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "roll20-custom-codes";

export type SavedCode = {
  id: string;
  name: string;
  memo: string;
  code: string;
  baseTemplateId?: string;
  savedAt: number;
};

function loadCodes(): SavedCode[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedCode[];
  } catch {
    return [];
  }
}

function persistCodes(codes: SavedCode[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {}
}

export function useCustomCodes() {
  const [codes, setCodes] = useState<SavedCode[]>(() => loadCodes());

  const saveCode = useCallback(
    (entry: Omit<SavedCode, "id" | "savedAt">): string => {
      const newCode: SavedCode = {
        ...entry,
        id: `code_${Date.now()}`,
        savedAt: Date.now(),
      };
      setCodes((prev) => {
        const next = [newCode, ...prev];
        persistCodes(next);
        return next;
      });
      return newCode.id;
    },
    [],
  );

  const updateCode = useCallback(
    (id: string, updates: Partial<Pick<SavedCode, "name" | "memo" | "code">>) => {
      setCodes((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        persistCodes(next);
        return next;
      });
    },
    [],
  );

  const deleteCode = useCallback((id: string) => {
    setCodes((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistCodes(next);
      return next;
    });
  }, []);

  return { codes, saveCode, updateCode, deleteCode };
}
