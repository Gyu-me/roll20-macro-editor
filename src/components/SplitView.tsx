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

const MIN_LIST = 140;
const MAX_LIST = 320;
const MIN_MACRO = 260;
const MIN_SCRIPT = 280;

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
  onDeleteLine: (id: string) => void;
  onAddLine: (labelId: string, afterId?: string, content?: string) => void;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onSave: () => void;
  onOpenLabelManager: () => void;
};

function DragHandle({ onDrag }: { onDrag: (dx: number) => void }) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    let lastX = e.clientX;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - lastX;
      lastX = ev.clientX;
      onDrag(dx);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <div
      className="panel-drag-handle"
      onMouseDown={handleMouseDown}
      title="드래그하여 크기 조절"
    />
  );
}

export default function SplitView({
  appState,
  selectedScenario,
  scenarioSidebarProps,
  onUpdateLine,
  onDeleteLine,
  onAddLine,
  onUpdateSettings,
  onSave,
  onOpenLabelManager,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<MacroTemplate>(macroTemplates[0]);
  const [listW, setListW] = useState(180);
  const [macroW, setMacroW] = useState(360);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAddToScript = (code: string) => {
    onAddLine("raw", undefined, code);
  };

  return (
    <div className="split-view">
      {/* Panel 1: 매크로 목록 */}
      <div
        className="split-panel split-macro-list"
        style={{ width: listW, flexShrink: 0 }}
      >
        <MacroList
          categories={macroCategories}
          templates={macroTemplates}
          selectedId={selectedTemplate.id}
          onSelect={setSelectedTemplate}
          compact
        />
      </div>

      <DragHandle onDrag={(dx) => setListW((w) => Math.max(MIN_LIST, Math.min(MAX_LIST, w + dx)))} />

      {/* Panel 2: 매크로 편집/미리보기 */}
      <div
        className="split-panel split-macro-content"
        style={{ width: macroW, flexShrink: 0 }}
      >
        <MacroEditorPanels
          key={selectedTemplate.id}
          selectedTemplate={selectedTemplate}
          compact
          onAddToScript={handleAddToScript}
        />
      </div>

      <DragHandle onDrag={(dx) => setMacroW((w) => Math.max(MIN_MACRO, w + dx))} />

      {/* Panel 3: 스크립트 편집 */}
      <div className="split-panel split-script-panel" style={{ flex: 1, minWidth: MIN_SCRIPT }}>
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
            onDeleteLine={onDeleteLine}
            onAddLine={onAddLine}
          />
        </div>
      </div>
    </div>
  );
}
