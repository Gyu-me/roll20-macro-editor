"use client";

import { useState } from "react";
import { MacroEditorPanels } from "@/components/MacroEditor";
import MacroList from "@/components/MacroList";
import ScenarioSidebar from "@/components/ScenarioSidebar";
import ScriptEditor from "@/components/ScriptEditor";
import TopToolbar from "@/components/TopToolbar";
import { macroCategories } from "@/data/macroCategories";
import { macroTemplates } from "@/data/macroTemplates";
import type { AppState, EditorSettings, Scenario, ScenarioFolder } from "@/types/editor";
import type { MacroTemplate } from "@/types/macro";

type ScenarioSidebarProps = {
  scenarios: AppState["scenarios"];
  folders: ScenarioFolder[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateFolder: () => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveScenario: (scenarioId: string, folderId: string | null) => void;
};

type Props = {
  appState: AppState;
  selectedScenario: Scenario;
  scenarioSidebarProps: ScenarioSidebarProps;
  onUpdateLine: (id: string, content: string) => void;
  onChangeLabelId: (id: string, labelId: string) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: (labelId: string, afterId?: string, content?: string) => void;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onSave: () => void;
  onOpenLabelManager: () => void;
};

export default function SplitView({
  appState,
  selectedScenario,
  scenarioSidebarProps,
  onUpdateLine,
  onChangeLabelId,
  onDeleteLine,
  onAddLine,
  onUpdateSettings,
  onSave,
  onOpenLabelManager,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<MacroTemplate>(macroTemplates[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAddToScript = (code: string) => {
    onAddLine("raw", undefined, code);
  };

  return (
    <div className="split-view">
      {/* Panel 1: 카테고리 목록 (고정 160px) */}
      <div className="split-panel split-macro-list">
        <MacroList
          categories={macroCategories}
          templates={macroTemplates}
          selectedId={selectedTemplate.id}
          onSelect={setSelectedTemplate}
          compact
        />
      </div>

      {/* Panel 2: 매크로 편집 (고정 380px) */}
      <div className="split-panel split-macro-content">
        <MacroEditorPanels
          key={selectedTemplate.id}
          selectedTemplate={selectedTemplate}
          compact
          onAddToScript={handleAddToScript}
        />
      </div>

      {/* Panel 3: 스크립트 편집 (나머지 공간) */}
      <div className="split-panel split-script-panel">
        <TopToolbar
          settings={appState.settings}
          lastSavedAt={appState.lastSavedAt}
          onUpdateSettings={onUpdateSettings}
          onAddLine={onAddLine}
          onOpenLabelManager={onOpenLabelManager}
          onSave={onSave}
        />
        <div className="split-script-body">
          {!sidebarCollapsed && (
            <ScenarioSidebar {...scenarioSidebarProps} />
          )}
          <button
            type="button"
            className={`sidebar-collapse-btn${sidebarCollapsed ? " is-collapsed" : ""}`}
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "시나리오 목록 펼치기" : "시나리오 목록 접기"}
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
          <ScriptEditor
            scenario={selectedScenario}
            settings={appState.settings}
            onUpdateLine={onUpdateLine}
            onChangeLabelId={onChangeLabelId}
            onDeleteLine={onDeleteLine}
            onAddLine={onAddLine}
          />
        </div>
      </div>
    </div>
  );
}
