"use client";

import type { EditorSettings } from "@/types/editor";

type Props = {
  settings: EditorSettings;
  lastSavedAt: number | null;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onAddLine: (labelId: string) => void;
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
  onUpdateSettings,
  onAddLine,
  onOpenLabelManager,
  onSave,
}: Props) {
  const isMastering = settings.editorMode === "mastering";

  const visibleLabels = [...settings.labels]
    .filter((l) => !l.hideFromToolbar)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="script-toolbar">
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
      </div>

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
