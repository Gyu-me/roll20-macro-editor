"use client";

import { useState } from "react";
import { MacroEditorPanels } from "@/components/MacroEditor";
import MacroList from "@/components/MacroList";
import ScenarioPanel from "@/components/ScenarioPanel";
import ScriptEditor from "@/components/ScriptEditor";
import TopToolbar from "@/components/TopToolbar";
import { macroCategories } from "@/data/macroCategories";
import { macroTemplates } from "@/data/macroTemplates";
import type {
  AppState,
  BranchBlock,
  BranchOption,
  EditorSettings,
  Scenario,
  ScenarioFolder,
} from "@/types/editor";
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
  onReorderScenario: (dragId: string, dropId: string, pos: "before" | "after" | "into") => void;
  onReorderFolder: (dragId: string, dropId: string, pos: "before" | "after") => void;
  onUpdateLine: (id: string, content: string) => void;
  onChangeLabelId: (id: string, labelId: string) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: (labelId: string, afterId?: string, content?: string) => void;
  onReorderNode: (dragId: string, dropId: string, pos: "before" | "after") => void;
  // Branch handlers
  onAddBranch: (afterId?: string) => void;
  onUpdateBranch: (id: string, patch: Partial<Pick<BranchBlock, "title" | "description">>) => void;
  onDeleteBranch: (id: string) => void;
  onAddBranchOption: (branchId: string) => void;
  onUpdateBranchOption: (
    branchId: string,
    optionId: string,
    patch: Partial<Pick<BranchOption, "title" | "description" | "condition" | "collapsed">>,
  ) => void;
  onDeleteBranchOption: (branchId: string, optionId: string) => void;
  onReorderBranchOption: (branchId: string, dragId: string, dropId: string, pos: "before" | "after") => void;
  onSelectBranchOption: (branchId: string, optionId: string | null) => void;
  onAddLineToOption: (branchId: string, optionId: string, labelId: string, afterId?: string) => void;
  onUpdateLineInOption: (branchId: string, optionId: string, lineId: string, content: string) => void;
  onDeleteLineInOption: (branchId: string, optionId: string, lineId: string) => void;
  onChangeLabelInOption: (branchId: string, optionId: string, lineId: string, labelId: string) => void;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onSave: () => void;
  onOpenLabelManager: () => void;
};

export default function SplitView({
  appState,
  selectedScenario,
  scenarioSidebarProps,
  onReorderScenario,
  onReorderFolder,
  onUpdateLine,
  onChangeLabelId,
  onDeleteLine,
  onAddLine,
  onReorderNode,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddBranchOption,
  onUpdateBranchOption,
  onDeleteBranchOption,
  onReorderBranchOption,
  onSelectBranchOption,
  onAddLineToOption,
  onUpdateLineInOption,
  onDeleteLineInOption,
  onChangeLabelInOption,
  onUpdateSettings,
  onSave,
  onOpenLabelManager,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<MacroTemplate>(macroTemplates[0]);
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);

  const handleAddToScript = (code: string) => {
    onAddLine("raw", undefined, code);
  };

  return (
    <div className="split-view">
      {/* Panel 1: 카테고리 목록 (flex 2) */}
      <div className="split-panel split-macro-list">
        <MacroList
          categories={macroCategories}
          templates={macroTemplates}
          selectedId={selectedTemplate.id}
          onSelect={setSelectedTemplate}
          compact
        />
      </div>

      {/* Panel 2: 매크로 편집 (flex 3) */}
      <div className="split-panel split-macro-content">
        <MacroEditorPanels
          key={selectedTemplate.id}
          selectedTemplate={selectedTemplate}
          compact
          onAddToScript={handleAddToScript}
        />
      </div>

      {/* Panel 3: 스크립트 편집 (flex 5) */}
      <div className="split-panel split-script-panel">
        <TopToolbar
          settings={appState.settings}
          lastSavedAt={appState.lastSavedAt}
          currentScenarioTitle={selectedScenario.title}
          onOpenScenarioPanel={() => setScenarioPanelOpen(true)}
          onUpdateSettings={onUpdateSettings}
          onAddLine={onAddLine}
          onAddBranch={onAddBranch}
          onOpenLabelManager={onOpenLabelManager}
          onSave={onSave}
        />

        <div className="split-script-body">
          <ScriptEditor
            scenario={selectedScenario}
            settings={appState.settings}
            onUpdateLine={onUpdateLine}
            onChangeLabelId={onChangeLabelId}
            onDeleteLine={onDeleteLine}
            onAddLine={onAddLine}
            onReorderNode={onReorderNode}
            onRenameScenario={scenarioSidebarProps.onRename}
            onAddBranch={onAddBranch}
            onUpdateBranch={onUpdateBranch}
            onDeleteBranch={onDeleteBranch}
            onAddBranchOption={onAddBranchOption}
            onUpdateBranchOption={onUpdateBranchOption}
            onDeleteBranchOption={onDeleteBranchOption}
            onReorderBranchOption={onReorderBranchOption}
            onSelectBranchOption={onSelectBranchOption}
            onAddLineToOption={onAddLineToOption}
            onUpdateLineInOption={onUpdateLineInOption}
            onDeleteLineInOption={onDeleteLineInOption}
            onChangeLabelInOption={onChangeLabelInOption}
          />
        </div>

        {scenarioPanelOpen && (
          <ScenarioPanel
            scenarios={scenarioSidebarProps.scenarios}
            folders={scenarioSidebarProps.folders}
            selectedId={scenarioSidebarProps.selectedId}
            onClose={() => setScenarioPanelOpen(false)}
            onSelect={scenarioSidebarProps.onSelect}
            onCreate={scenarioSidebarProps.onCreate}
            onRename={scenarioSidebarProps.onRename}
            onDelete={scenarioSidebarProps.onDelete}
            onCreateFolder={scenarioSidebarProps.onCreateFolder}
            onRenameFolder={scenarioSidebarProps.onRenameFolder}
            onDeleteFolder={scenarioSidebarProps.onDeleteFolder}
            onReorderScenario={onReorderScenario}
            onReorderFolder={onReorderFolder}
          />
        )}
      </div>
    </div>
  );
}
