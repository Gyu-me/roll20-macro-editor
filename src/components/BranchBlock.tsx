"use client";

import { useEffect, useRef, useState } from "react";
import ScriptLineItem from "@/components/ScriptLineItem";
import type {
  BranchBlock as BranchBlockType,
  BranchOption,
  EditorMode,
  LabelSetting,
  PlatformMode,
} from "@/types/editor";

type Props = {
  branch: BranchBlockType;
  labels: LabelSetting[];
  platformMode: PlatformMode;
  editorMode: EditorMode;
  onUpdate: (id: string, patch: Partial<Pick<BranchBlockType, "title" | "description">>) => void;
  onDelete: (id: string) => void;
  onAddOption: (branchId: string) => void;
  onUpdateOption: (
    branchId: string,
    optionId: string,
    patch: Partial<Pick<BranchOption, "title" | "description" | "condition" | "collapsed">>,
  ) => void;
  onDeleteOption: (branchId: string, optionId: string) => void;
  onReorderOption: (branchId: string, dragId: string, dropId: string, pos: "before" | "after") => void;
  onSelectOption: (branchId: string, optionId: string | null) => void;
  onAddLineToOption: (branchId: string, optionId: string, labelId: string, afterId?: string) => void;
  onUpdateLineInOption: (branchId: string, optionId: string, lineId: string, content: string) => void;
  onDeleteLineInOption: (branchId: string, optionId: string, lineId: string) => void;
  onChangeLabelInOption: (branchId: string, optionId: string, lineId: string, labelId: string) => void;
  onCopied: (text: string) => void;
};

export default function BranchBlock({
  branch,
  labels,
  platformMode,
  editorMode,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onReorderOption,
  onSelectOption,
  onAddLineToOption,
  onUpdateLineInOption,
  onDeleteLineInOption,
  onChangeLabelInOption,
  onCopied,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(branch.title);
  const titleRef = useRef<HTMLInputElement>(null);
  const isMastering = editorMode === "mastering";

  useEffect(() => {
    setTitleDraft(branch.title);
  }, [branch.title]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== branch.title) {
      onUpdate(branch.id, { title: trimmed });
    } else {
      setTitleDraft(branch.title);
    }
    setEditingTitle(false);
  };

  return (
    <div className="branch-block">
      {/* Header */}
      <div className="branch-header">
        <span className="branch-header-icon">⑂</span>
        {!isMastering && editingTitle ? (
          <input
            ref={titleRef}
            className="branch-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(branch.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <span
            className={`branch-title${!isMastering ? " branch-title--editable" : ""}`}
            onClick={!isMastering ? () => setEditingTitle(true) : undefined}
            title={!isMastering ? "클릭하여 제목 변경" : undefined}
          >
            {branch.title}
          </span>
        )}
        {!isMastering && (
          <div className="branch-header-actions">
            <button
              type="button"
              className="branch-header-btn"
              onClick={() => onAddOption(branch.id)}
            >
              + 루트
            </button>
            <button
              type="button"
              className="branch-header-btn branch-header-btn--danger"
              onClick={() => {
                if (window.confirm(`"${branch.title}" 분기 블록을 삭제하시겠습니까?`)) {
                  onDelete(branch.id);
                }
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="branch-body">
        {branch.options.length === 0 && !isMastering && (
          <p className="branch-empty-hint">루트가 없습니다. 위 "+ 루트" 버튼으로 추가하세요.</p>
        )}
        {branch.options.map((option, idx) => {
          const prevOpt = idx > 0 ? branch.options[idx - 1] : null;
          const nextOpt = idx < branch.options.length - 1 ? branch.options[idx + 1] : null;
          return (
            <BranchOptionCard
              key={option.id}
              option={option}
              branchId={branch.id}
              labels={labels}
              platformMode={platformMode}
              editorMode={editorMode}
              isSelected={branch.selectedOptionId === option.id}
              onUpdateOption={onUpdateOption}
              onDeleteOption={onDeleteOption}
              onMoveUp={prevOpt ? () => onReorderOption(branch.id, option.id, prevOpt.id, "before") : undefined}
              onMoveDown={nextOpt ? () => onReorderOption(branch.id, option.id, nextOpt.id, "after") : undefined}
              onSelectOption={onSelectOption}
              onAddLine={onAddLineToOption}
              onUpdateLine={onUpdateLineInOption}
              onDeleteLine={onDeleteLineInOption}
              onChangeLabel={onChangeLabelInOption}
              onCopied={onCopied}
            />
          );
        })}
        {!isMastering && (
          <button
            type="button"
            className="branch-add-option-btn"
            onClick={() => onAddOption(branch.id)}
          >
            + 루트 추가
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Option Card ────────────────────────────────────────────

type OptionProps = {
  option: BranchOption;
  branchId: string;
  labels: LabelSetting[];
  platformMode: PlatformMode;
  editorMode: EditorMode;
  isSelected: boolean;
  onUpdateOption: (
    branchId: string,
    optionId: string,
    patch: Partial<Pick<BranchOption, "title" | "description" | "condition" | "collapsed">>,
  ) => void;
  onDeleteOption: (branchId: string, optionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSelectOption: (branchId: string, optionId: string | null) => void;
  onAddLine: (branchId: string, optionId: string, labelId: string, afterId?: string) => void;
  onUpdateLine: (branchId: string, optionId: string, lineId: string, content: string) => void;
  onDeleteLine: (branchId: string, optionId: string, lineId: string) => void;
  onChangeLabel: (branchId: string, optionId: string, lineId: string, labelId: string) => void;
  onCopied: (text: string) => void;
};

function BranchOptionCard({
  option,
  branchId,
  labels,
  platformMode,
  editorMode,
  isSelected,
  onUpdateOption,
  onDeleteOption,
  onMoveUp,
  onMoveDown,
  onSelectOption,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  onChangeLabel,
  onCopied,
}: OptionProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(option.title);
  const titleRef = useRef<HTMLInputElement>(null);
  const isMastering = editorMode === "mastering";

  useEffect(() => {
    setTitleDraft(option.title);
  }, [option.title]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== option.title) {
      onUpdateOption(branchId, option.id, { title: trimmed });
    } else {
      setTitleDraft(option.title);
    }
    setEditingTitle(false);
  };

  // 마스터링 모드: 선택된 옵션만 펼침, 편집 모드: collapsed 상태 따름
  const collapsed = isMastering ? !isSelected : (option.collapsed ?? false);

  const getLabelForLine = (line: { labelId: string }) =>
    labels.find((l) => l.id === line.labelId) ?? labels[0];

  const visibleLabels = [...labels]
    .filter((l) => !l.hideFromToolbar)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={`branch-option${isSelected ? " is-selected" : ""}`}>
      {/* Option Header */}
      <div className="branch-option-header">
        {!isMastering && (
          <button
            type="button"
            className="branch-option-toggle"
            onClick={() => onUpdateOption(branchId, option.id, { collapsed: !option.collapsed })}
            title={option.collapsed ? "펼치기" : "접기"}
          >
            {option.collapsed ? "▶" : "▼"}
          </button>
        )}

        {!isMastering && editingTitle ? (
          <input
            ref={titleRef}
            className="branch-option-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(option.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <span
            className={`branch-option-title${!isMastering ? " branch-option-title--editable" : ""}`}
            onClick={!isMastering ? () => setEditingTitle(true) : undefined}
            title={!isMastering ? "클릭하여 루트 이름 변경" : undefined}
          >
            {option.title}
          </span>
        )}

        <div className="branch-option-actions">
          {isMastering ? (
            <button
              type="button"
              className={`branch-option-select-btn${isSelected ? " is-selected" : ""}`}
              onClick={() => onSelectOption(branchId, isSelected ? null : option.id)}
            >
              {isSelected ? "선택됨 ✓" : "이 루트 선택"}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="branch-option-action-btn"
                title="위로"
                onClick={onMoveUp}
                disabled={!onMoveUp}
              >
                ▲
              </button>
              <button
                type="button"
                className="branch-option-action-btn"
                title="아래로"
                onClick={onMoveDown}
                disabled={!onMoveDown}
              >
                ▼
              </button>
              <button
                type="button"
                className="branch-option-action-btn branch-option-action-btn--danger"
                title="루트 삭제"
                onClick={() => onDeleteOption(branchId, option.id)}
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      {/* Option Body */}
      {!collapsed && (
        <div className="branch-option-body">
          {option.lines.length === 0 ? (
            <p className="branch-option-empty-hint">
              {isMastering ? "비어있음" : "아래 버튼으로 라인을 추가해보세요."}
            </p>
          ) : (
            <div className="branch-option-lines">
              {option.lines.map((line) => (
                <ScriptLineItem
                  key={line.id}
                  line={line}
                  label={getLabelForLine(line)}
                  labels={labels}
                  platformMode={platformMode}
                  editorMode={editorMode}
                  onUpdate={(lineId, content) => onUpdateLine(branchId, option.id, lineId, content)}
                  onChangeLabel={(lineId, labelId) => onChangeLabel(branchId, option.id, lineId, labelId)}
                  onDelete={(lineId) => onDeleteLine(branchId, option.id, lineId)}
                  onAddAfter={(labelId, afterId) => onAddLine(branchId, option.id, labelId, afterId)}
                  onCopied={onCopied}
                />
              ))}
            </div>
          )}

          {!isMastering && (
            <div className="branch-option-add-row">
              {visibleLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  className="branch-option-add-line-btn"
                  style={{ "--tag-color": label.color } as React.CSSProperties}
                  onClick={() => onAddLine(branchId, option.id, label.id)}
                  title={`${label.name} 라인 추가`}
                >
                  <span className="branch-option-add-dot" style={{ background: label.color }} />
                  {label.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
