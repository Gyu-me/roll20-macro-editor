"use client";

import { useCallback, useEffect, useState } from "react";
import LabelManager from "@/components/LabelManager";
import MacroEditor from "@/components/MacroEditor";
import ScriptEditor from "@/components/ScriptEditor";
import TopToolbar from "@/components/TopToolbar";
import { getInitialState } from "@/data/initialState";
import type {
  AppState,
  EditorSettings,
  LabelSetting,
  ScriptLine,
  ScriptLineType,
} from "@/types/editor";
import { loadState, saveState } from "@/utils/storage";

type AppView = "script" | "macro";

const KNOWN_TYPES: ScriptLineType[] = [
  "main",
  "dialogue",
  "whisper",
  "memo",
  "handout",
  "divider",
  "roll",
  "emphasis",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function AppShell() {
  const [view, setView] = useState<AppView>("script");
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  useEffect(() => {
    setAppState(loadState<AppState>() ?? getInitialState());
  }, []);

  const patchScenarioLines = useCallback(
    (updater: (lines: ScriptLine[]) => ScriptLine[]) => {
      setAppState((prev) => {
        if (!prev) return prev;
        const selId = prev.selectedScenarioId;
        return {
          ...prev,
          scenarios: prev.scenarios.map((s) =>
            s.id === selId
              ? { ...s, lines: updater(s.lines), updatedAt: Date.now() }
              : s,
          ),
        };
      });
    },
    [],
  );

  const handleUpdateLine = useCallback(
    (id: string, content: string) => {
      patchScenarioLines((lines) =>
        lines.map((l) =>
          l.id === id ? { ...l, content, updatedAt: Date.now() } : l,
        ),
      );
    },
    [patchScenarioLines],
  );

  const handleDeleteLine = useCallback(
    (id: string) => {
      patchScenarioLines((lines) => lines.filter((l) => l.id !== id));
    },
    [patchScenarioLines],
  );

  const handleAddLine = useCallback(
    (labelId: string, afterId?: string) => {
      const now = Date.now();
      const type: ScriptLineType = KNOWN_TYPES.includes(
        labelId as ScriptLineType,
      )
        ? (labelId as ScriptLineType)
        : "custom";
      const newLine: ScriptLine = {
        id: uid(),
        type,
        labelId,
        content: "",
        createdAt: now,
        updatedAt: now,
      };
      patchScenarioLines((lines) => {
        if (!afterId) return [...lines, newLine];
        const idx = lines.findIndex((l) => l.id === afterId);
        const next = [...lines];
        next.splice(idx + 1, 0, newLine);
        return next;
      });
    },
    [patchScenarioLines],
  );

  const handleUpdateSettings = useCallback((patch: Partial<EditorSettings>) => {
    setAppState((prev) =>
      prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev,
    );
  }, []);

  const handleSave = useCallback(() => {
    setAppState((prev) => {
      if (!prev) return prev;
      const toSave: AppState = { ...prev, lastSavedAt: Date.now() };
      saveState(toSave);
      return toSave;
    });
  }, []);

  const handleAddLabel = useCallback(
    (labelData: Omit<LabelSetting, "id" | "order">) => {
      setAppState((prev) => {
        if (!prev) return prev;
        const labels = prev.settings.labels;
        const maxOrder = labels.reduce((m, l) => Math.max(m, l.order), 0);
        const newLabel: LabelSetting = {
          id: `custom-${uid()}`,
          order: maxOrder + 1,
          ...labelData,
        };
        return {
          ...prev,
          settings: { ...prev.settings, labels: [...labels, newLabel] },
        };
      });
    },
    [],
  );

  const handleDeleteLabel = useCallback((id: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          labels: prev.settings.labels.filter((l) => l.id !== id),
        },
      };
    });
  }, []);

  const handleMoveLabel = useCallback(
    (id: string, direction: "up" | "down") => {
      setAppState((prev) => {
        if (!prev) return prev;
        const sorted = [...prev.settings.labels].sort(
          (a, b) => a.order - b.order,
        );
        const idx = sorted.findIndex((l) => l.id === id);
        if (idx === -1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

        const orderA = sorted[idx].order;
        const orderB = sorted[swapIdx].order;
        const updatedLabels = prev.settings.labels.map((l) => {
          if (l.id === sorted[idx].id) return { ...l, order: orderB };
          if (l.id === sorted[swapIdx].id) return { ...l, order: orderA };
          return l;
        });

        return {
          ...prev,
          settings: { ...prev.settings, labels: updatedLabels },
        };
      });
    },
    [],
  );

  if (!appState) {
    return (
      <div className="app-shell">
        <div className="app-loading">불러오는 중...</div>
      </div>
    );
  }

  const selectedScenario =
    appState.scenarios.find((s) => s.id === appState.selectedScenarioId) ??
    appState.scenarios[0];

  return (
    <div className="app-shell">
      <div className="app-view-tabs">
        <button
          type="button"
          className={`app-view-tab${view === "script" ? " is-active" : ""}`}
          onClick={() => setView("script")}
        >
          스크립트 편집기
        </button>
        <button
          type="button"
          className={`app-view-tab${view === "macro" ? " is-active" : ""}`}
          onClick={() => setView("macro")}
        >
          롤20 매크로
        </button>
      </div>

      <div className={`app-content${view === "script" ? " script-view" : ""}`}>
        {view === "script" && selectedScenario && (
          <>
            <TopToolbar
              settings={appState.settings}
              lastSavedAt={appState.lastSavedAt}
              onUpdateSettings={handleUpdateSettings}
              onAddLine={handleAddLine}
              onOpenLabelManager={() => setIsLabelManagerOpen(true)}
              onSave={handleSave}
            />
            <ScriptEditor
              scenario={selectedScenario}
              settings={appState.settings}
              onUpdateLine={handleUpdateLine}
              onDeleteLine={handleDeleteLine}
              onAddLine={handleAddLine}
            />
          </>
        )}

        {view === "macro" && (
          <div className="macro-tab-wrap">
            <MacroEditor />
          </div>
        )}
      </div>

      {isLabelManagerOpen && (
        <LabelManager
          labels={appState.settings.labels}
          onClose={() => setIsLabelManagerOpen(false)}
          onAddLabel={handleAddLabel}
          onDeleteLabel={handleDeleteLabel}
          onMoveLabel={handleMoveLabel}
        />
      )}
    </div>
  );
}
