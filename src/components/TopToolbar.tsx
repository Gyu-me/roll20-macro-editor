"use client";

import type { EditorSettings } from "@/types/editor";

type Props = {
  settings: EditorSettings;
  lastSavedAt: number | null;
  currentScenarioTitle: string;
  onOpenScenarioPanel: () => void;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onAddLine: (labelId: string) => void;
  onAddBranch: () => void;
  onOpenLabelManager: () => void;
  onSave: () => void;
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TopToolbar({
  settings,
  lastSavedAt,
  currentScenarioTitle,
  onOpenScenarioPanel,
  onUpdateSettings,
  onAddLine,
  onAddBranch,
  onOpenLabelManager,
  onSave,
}: Props) {
  const isMastering = settings.editorMode === "mastering";

  const visibleLabels = [...settings.labels]
    .filter((l) => !l.hideFromToolbar)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="script-toolbar">
      {/* 시나리오 선택 버튼 */}
      <button
        type="button"
        className="toolbar-scenario-btn"
        onClick={onOpenScenarioPanel}
        title="시나리오 목록 열기"
      >
        <span className="toolbar-scenario-icon">▤</span>
        <span className="toolbar-scenario-title">{currentScenarioTitle}</span>
      </button>

      <div className="toolbar-sep" />

      {/* 태그 추가 버튼들 */}
      <div className="toolbar-tags">
        {visibleLabels.map((label) => (
          <button
            key={label.id}
            type="button"
            className="toolbar-tag-btn"
            onClick={() => onAddLine(label.id)}
            disabled={isMastering}
            title={label.command || undefined}
            style={{ "--tag-color": label.color } as React.CSSProperties}
          >
            <span className="toolbar-tag-dot" style={{ background: label.color }} />
            {label.name}
          </button>
        ))}
        <button
          type="button"
          className="toolbar-add-custom-btn"
          onClick={onOpenLabelManager}
          disabled={isMastering}
          title="태그 추가 및 관리"
        >
          + 태그
        </button>

        <div className="toolbar-sep" />

        {/* 분기 추가 버튼 */}
        <button
          type="button"
          className="toolbar-branch-btn"
          onClick={onAddBranch}
          disabled={isMastering}
          title="분기 블록 추가"
        >
          <span className="toolbar-branch-icon">⑂</span>
          분기
        </button>
      </div>

      {/* 오른쪽 액션 */}
      <div className="toolbar-actions">
        <button
          type="button"
          className={`toolbar-mode-btn ${isMastering ? "mastering" : "editing"}`}
          onClick={() =>
            onUpdateSettings({ editorMode: isMastering ? "edit" : "mastering" })
          }
          title="모드 전환"
        >
          {isMastering ? "● 마스터링" : "✏ 편집 중"}
        </button>
        <div className="toolbar-save-group">
          <button type="button" className="toolbar-save-btn" onClick={onSave}>
            저장
          </button>
          {lastSavedAt !== null && (
            <span className="toolbar-save-time">{formatTime(lastSavedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
