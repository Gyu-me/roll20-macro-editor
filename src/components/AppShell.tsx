"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LabelManager from "@/components/LabelManager";
import MacroEditor from "@/components/MacroEditor";
import SplitView from "@/components/SplitView";
import { DEFAULT_LABELS } from "@/data/defaultLabels";
import { getInitialState } from "@/data/initialState";

function migrateState(state: AppState): AppState {
  const existingIds = new Set(state.settings.labels.map((l) => l.id));

  // 기본 라벨의 command/roll20Style/excludeFromOutput을 최신 defaultLabels 기준으로 동기화
  const syncedLabels = state.settings.labels.map((l) => {
    if (!l.isDefault) return l;
    const def = DEFAULT_LABELS.find((d) => d.id === l.id);
    if (!def) return l;
    return {
      ...l,
      command: def.command,
      roll20Style: def.roll20Style,
      excludeFromOutput: def.excludeFromOutput,
    };
  });

  // 새로 추가된 기본 라벨(raw 등) 누락 시 보충
  const maxOrder = syncedLabels.reduce((m, l) => Math.max(m, l.order), 0);
  const missing = DEFAULT_LABELS.filter((d) => !existingIds.has(d.id)).map(
    (d, i) => ({ ...d, order: maxOrder + i + 1 }),
  );

  return {
    ...state,
    settings: {
      ...state.settings,
      labels: [...syncedLabels, ...missing],
    },
  };
}
import type {
  AppState,
  EditorSettings,
  LabelSetting,
  Scenario,
  ScriptLine,
  ScriptLineType,
} from "@/types/editor";
import { loadState, saveState } from "@/utils/storage";

type AppView = "split" | "macro";

const KNOWN_TYPES: ScriptLineType[] = [
  "main",
  "dialogue",
  "whisper",
  "memo",
  "handout",
  "divider",
  "roll",
  "emphasis",
  "raw",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeScenario(title: string): Scenario {
  const now = Date.now();
  return {
    id: uid(),
    folderId: null,
    title,
    lines: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function AppShell() {
  const [view, setView] = useState<AppView>("split");
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = loadState<AppState>() ?? getInitialState();
    setAppState(migrateState(raw));
  }, []);

  // ── Scenario mutations ───────────────────────────────────

  const handleSelectScenario = useCallback((id: string) => {
    setAppState((prev) =>
      prev ? { ...prev, selectedScenarioId: id } : prev,
    );
  }, []);

  const handleCreateScenario = useCallback(() => {
    const s = makeScenario("새 시나리오");
    setAppState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenarios: [...prev.scenarios, s],
        selectedScenarioId: s.id,
      };
    });
  }, []);

  const handleRenameScenario = useCallback((id: string, name: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenarios: prev.scenarios.map((s) =>
          s.id === id ? { ...s, title: name, updatedAt: Date.now() } : s,
        ),
      };
    });
  }, []);

  const handleDeleteScenario = useCallback((id: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      const rest = prev.scenarios.filter((s) => s.id !== id);
      const newSel =
        prev.selectedScenarioId === id
          ? (rest[0]?.id ?? null)
          : prev.selectedScenarioId;
      // Also remove from folders
      const folders = prev.folders.map((f) => ({
        ...f,
        scenarioIds: f.scenarioIds.filter((sid) => sid !== id),
      }));
      return { ...prev, scenarios: rest, selectedScenarioId: newSel, folders };
    });
  }, []);

  // ── Folder mutations ─────────────────────────────────────

  const handleCreateFolder = useCallback(() => {
    const now = Date.now();
    const newFolder = {
      id: uid(),
      name: "새 폴더",
      scenarioIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setAppState((prev) =>
      prev ? { ...prev, folders: [...prev.folders, newFolder] } : prev,
    );
  }, []);

  const handleRenameFolder = useCallback((id: string, name: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        folders: prev.folders.map((f) =>
          f.id === id ? { ...f, name, updatedAt: Date.now() } : f,
        ),
      };
    });
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      // Move scenarios in this folder to root
      const scenarios = prev.scenarios.map((s) =>
        s.folderId === id ? { ...s, folderId: null } : s,
      );
      return {
        ...prev,
        folders: prev.folders.filter((f) => f.id !== id),
        scenarios,
      };
    });
  }, []);

  const handleMoveScenario = useCallback((scenarioId: string, folderId: string | null) => {
    setAppState((prev) => {
      if (!prev) return prev;
      const scenarios = prev.scenarios.map((s) =>
        s.id === scenarioId ? { ...s, folderId, updatedAt: Date.now() } : s,
      );
      const folders = prev.folders.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            scenarioIds: f.scenarioIds.includes(scenarioId)
              ? f.scenarioIds
              : [...f.scenarioIds, scenarioId],
          };
        }
        return {
          ...f,
          scenarioIds: f.scenarioIds.filter((sid) => sid !== scenarioId),
        };
      });
      return { ...prev, scenarios, folders };
    });
  }, []);

  // ── Line mutations ───────────────────────────────────────

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
    (labelId: string, afterId?: string, content?: string) => {
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
        content: content ?? "",
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

  // ── Settings ─────────────────────────────────────────────

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

  // ── Label management ─────────────────────────────────────

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

  // ── Export / Import ──────────────────────────────────────

  const handleExport = useCallback(() => {
    if (!appState) return;
    const json = JSON.stringify(appState, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `roll20-script-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [appState]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as AppState;
          // Merge: ensure new default labels exist
          const existingIds = new Set(imported.settings?.labels?.map((l) => l.id) ?? []);
          const missingDefaults = DEFAULT_LABELS.filter((d) => !existingIds.has(d.id));
          if (missingDefaults.length > 0) {
            const maxOrder = (imported.settings?.labels ?? []).reduce(
              (m, l) => Math.max(m, l.order ?? 0),
              0,
            );
            imported.settings.labels = [
              ...(imported.settings.labels ?? []),
              ...missingDefaults.map((d, i) => ({ ...d, order: maxOrder + i + 1 })),
            ];
          }
          setAppState(imported);
          saveState(imported);
        } catch {
          alert("파일을 읽을 수 없어요. 올바른 JSON 파일인지 확인해주세요.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  // ────────────────────────────────────────────────────────

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

  const scenarioSidebarProps = {
    scenarios: appState.scenarios,
    folders: appState.folders,
    selectedId: appState.selectedScenarioId,
    onSelect: handleSelectScenario,
    onCreate: handleCreateScenario,
    onRename: handleRenameScenario,
    onDelete: handleDeleteScenario,
    onCreateFolder: handleCreateFolder,
    onRenameFolder: handleRenameFolder,
    onDeleteFolder: handleDeleteFolder,
    onMoveScenario: handleMoveScenario,
  };

  const scriptProps = {
    appState,
    selectedScenario,
    scenarioSidebarProps,
    onUpdateLine: handleUpdateLine,
    onDeleteLine: handleDeleteLine,
    onAddLine: handleAddLine,
    onUpdateSettings: handleUpdateSettings,
    onSave: handleSave,
    onOpenLabelManager: () => setIsLabelManagerOpen(true),
  };

  return (
    <div className="app-shell">
      <div className="app-view-tabs">
        <button
          type="button"
          className={`app-view-tab${view === "split" ? " is-active" : ""}`}
          onClick={() => setView("split")}
        >
          시나리오 정리 + 롤꾸편집
        </button>
        <button
          type="button"
          className={`app-view-tab${view === "macro" ? " is-active" : ""}`}
          onClick={() => setView("macro")}
        >
          롤20꾸미기
        </button>

        <div className="app-tab-spacer" />

        <div className="app-tab-actions">
          <button
            type="button"
            className="app-action-btn"
            onClick={handleExport}
            title="현재 상태를 JSON 파일로 저장"
          >
            내보내기
          </button>
          <button
            type="button"
            className="app-action-btn"
            onClick={() => importInputRef.current?.click()}
            title="JSON 파일에서 불러오기"
          >
            가져오기
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
        </div>
      </div>

      <div className={`app-content${view === "split" ? " script-view" : ""}`}>
        {view === "split" && selectedScenario && (
          <SplitView {...scriptProps} />
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
