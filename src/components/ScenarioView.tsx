"use client";

import { useState } from "react";
import ScenarioPanel from "@/components/ScenarioPanel";
import ScriptEditor from "@/components/ScriptEditor";
import TopToolbar from "@/components/TopToolbar";
import type {
  AppState,
  BranchBlock,
  BranchOption,
  EditorSettings,
  Scenario,
  ScenarioFolder,
  ScriptLine,
  ScriptNode,
} from "@/types/editor";
import { getLineOutput } from "@/utils/scriptOutput";

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

function buildScriptText(nodes: ScriptNode[], appState: AppState): string {
  const labelMap = Object.fromEntries(appState.settings.labels.map((l) => [l.id, l]));
  const lines: string[] = [];

  for (const node of nodes) {
    if (node.type === "branch") {
      const selected = node.options.find((o) => o.id === node.selectedOptionId) ?? node.options[0];
      if (selected) {
        for (const line of selected.lines) {
          const label = labelMap[line.labelId];
          if (!label) continue;
          const out = getLineOutput(line as ScriptLine, label, appState.settings.platform);
          if (out) lines.push(out);
        }
      }
    } else {
      const label = labelMap[node.labelId];
      if (!label) continue;
      const out = getLineOutput(node as ScriptLine, label, appState.settings.platform);
      if (out) lines.push(out);
    }
  }

  return lines.join("\n");
}

export default function ScenarioView({
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
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  const handleCopyScript = async () => {
    const text = buildScriptText(selectedScenario.lines, appState);
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("스크립트를 복사했어요.");
    } catch {
      setCopyMsg("복사 실패. 직접 선택해서 복사해주세요.");
    }
    setTimeout(() => setCopyMsg(""), 2500);
  };

  return (
    <div className="scenario-view">
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

      <div className="scenario-view-copy-bar">
        <button type="button" className="scenario-copy-btn" onClick={handleCopyScript}>
          스크립트 전체 복사
        </button>
        {copyMsg && <span className="scenario-copy-msg">{copyMsg}</span>}
      </div>

      <div className="scenario-view-body">
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
  );
}
