"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "roll20-template-memos";

function loadMemos(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function useTemplateMemo(templateId: string, fallback: string) {
  const [memo, setMemo] = useState<string>(() => {
    const stored = loadMemos();
    return stored[templateId] ?? fallback;
  });

  const updateMemo = useCallback(
    (text: string) => {
      setMemo(text);
      try {
        const all = loadMemos();
        all[templateId] = text;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch {}
    },
    [templateId],
  );

  return [memo, updateMemo] as const;
}
