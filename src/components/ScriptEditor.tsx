"use client";

import { useEffect, useRef, useState } from "react";
import BranchBlock from "@/components/BranchBlock";
import ScriptLineItem from "@/components/ScriptLineItem";
import type {
  BranchBlock as BranchBlockType,
  BranchOption,
  EditorSettings,
  Scenario,
  ScriptLine,
} from "@/types/editor";

type BranchHandlers = {
  onAddBranch: (afterId?: string) => void;
  onUpdateBranch: (id: string, patch: Partial<Pick<BranchBlockType, "title" | "description">>) => void;
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
};

type Props = {
  scenario: Scenario;
  settings: EditorSettings;
  onUpdateLine: (id: string, content: string) => void;
  onChangeLabelId: (id: string, labelId: string) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: (labelId: string, afterId?: string, content?: string) => void;
  onRenameScenario: (id: string, name: string) => void;
} & BranchHandlers;

export default function ScriptEditor({
  scenario,
  settings,
  onUpdateLine,
  onChangeLabelId,
  onDeleteLine,
  onAddLine,
  onRenameScenario,
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
}: Props) {
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(scenario.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { labels, platformMode, editorMode } = settings;

  useEffect(() => {
    setTitleDraft(scenario.title);
    setIsEditingTitle(false);
  }, [scenario.id, scenario.title]);

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.select();
  }, [isEditingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== scenario.title) {
      onRenameScenario(scenario.id, trimmed);
    } else {
      setTitleDraft(scenario.title);
    }
    setIsEditingTitle(false);
  };

  const getLabelForLine = (line: ScriptLine) =>
    labels.find((l) => l.id === line.labelId) ?? labels[0];

  const nodeCount = scenario.lines.length;

  return (
    <div className="script-editor-wrap">
      <div className="script-editor">
        <div className="script-editor-inner">
          <div className="scenario-header">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                className="scenario-title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") {
                    setTitleDraft(scenario.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
            ) : (
              <h2
                className="scenario-title scenario-title--editable"
                onClick={() => setIsEditingTitle(true)}
                title="클릭하여 이름 변경"
              >
                {scenario.title}
                <span className="scenario-title-edit-hint">✏</span>
              </h2>
            )}
            <span className="scenario-line-count">
              {nodeCount}개 항목
            </span>
          </div>

          {scenario.lines.length === 0 ? (
            <p className="empty-scenario-hint">
              아직 항목이 없어요. 상단 버튼으로 추가해보세요.
            </p>
          ) : (
            <div className="script-lines">
              {scenario.lines.map((node) => {
                if (node.type === "branch") {
                  return (
                    <BranchBlock
                      key={node.id}
                      branch={node}
                      labels={labels}
                      platformMode={platformMode}
                      editorMode={editorMode}
                      onUpdate={onUpdateBranch}
                      onDelete={onDeleteBranch}
                      onAddOption={onAddBranchOption}
                      onUpdateOption={onUpdateBranchOption}
                      onDeleteOption={onDeleteBranchOption}
                      onReorderOption={onReorderBranchOption}
                      onSelectOption={onSelectBranchOption}
                      onAddLineToOption={onAddLineToOption}
                      onUpdateLineInOption={onUpdateLineInOption}
                      onDeleteLineInOption={onDeleteLineInOption}
                      onChangeLabelInOption={onChangeLabelInOption}
                      onCopied={setLastCopied}
                    />
                  );
                }
                return (
                  <ScriptLineItem
                    key={node.id}
                    line={node}
                    label={getLabelForLine(node)}
                    labels={labels}
                    platformMode={platformMode}
                    editorMode={editorMode}
                    onUpdate={onUpdateLine}
                    onChangeLabel={onChangeLabelId}
                    onDelete={onDeleteLine}
                    onAddAfter={(labelId, afterId) => onAddLine(labelId, afterId)}
                    onCopied={setLastCopied}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editorMode === "mastering" && (
        <div className="mastering-bar">
          <span className="mastering-bar-label">마스터링 모드</span>
          {lastCopied ? (
            <>
              <span className="mastering-bar-hint">마지막 복사:</span>
              <span className="mastering-bar-code">{lastCopied}</span>
            </>
          ) : (
            <span className="mastering-bar-hint">
              라인을 클릭하면 코드가 복사됩니다
            </span>
          )}
        </div>
      )}
    </div>
  );
}
