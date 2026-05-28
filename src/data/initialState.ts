import type { AppState } from "@/types/editor";
import { DEFAULT_LABELS } from "./defaultLabels";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getInitialState(): AppState {
  const now = Date.now();
  const scenarioId = uid();
  return {
    folders: [],
    scenarios: [
      {
        id: scenarioId,
        folderId: null,
        title: "새 시나리오",
        lines: [
          {
            id: uid(),
            type: "divider",
            labelId: "divider",
            content: "프롤로그",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uid(),
            type: "main",
            labelId: "main",
            content: "오늘도 또 우리 수탉이 딱 쫓기었다.",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uid(),
            type: "dialogue",
            labelId: "dialogue",
            content: "이봐, 자네도 들었나?",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uid(),
            type: "memo",
            labelId: "memo",
            content: "여기서 PC의 반응을 유도한다.",
            createdAt: now,
            updatedAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    selectedScenarioId: scenarioId,
    settings: {
      platformMode: "roll20",
      editorMode: "edit",
      autoSaveEnabled: true,
      fontSize: 14,
      fontFamily: "Arial",
      autoResizeTextarea: true,
      labels: DEFAULT_LABELS,
    },
    lastSavedAt: null,
  };
}
