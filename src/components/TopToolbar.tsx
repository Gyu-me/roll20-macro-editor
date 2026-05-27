"use client";

import type { EditorSettings, ScriptLine } from "@/types/editor";

type Props = {
  settings: EditorSettings;
  lastSavedAt: number | null;
  onUpdateSettings: (patch: Partial<EditorSettings>) => void;
  onAddLine: (type: ScriptLine["type"]) => void;
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
  onSave,
}: Props) {
  const isRoll20 = settings.platformMode === "roll20";
  const isMastering = settings.editorMode === "mastering";

  return (
    <div className="script-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">추가</span>
        {(
          [
            ["main", "지문"],
            ["dialogue", "대사"],
            ["whisper", "귓속말"],
            ["memo", "메모"],
            ["handout", "핸드아웃"],
            ["divider", "구분선"],
          ] as [ScriptLine["type"], string][]
        ).map(([type, label]) => (
          <button
            key={type}
            type="button"
            className="toolbar-add-btn"
            onClick={() => onAddLine(type)}
            disabled={isMastering}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-platform-btn ${isRoll20 ? "roll20" : "ccfolia"}`}
          onClick={() =>
            onUpdateSettings({ platformMode: isRoll20 ? "ccfolia" : "roll20" })
          }
          title="플랫폼 전환"
        >
          {isRoll20 ? "Roll20" : "코코포리아"}
        </button>
      </div>

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-mode-btn ${isMastering ? "mastering" : "editing"}`}
          onClick={() =>
            onUpdateSettings({ editorMode: isMastering ? "edit" : "mastering" })
          }
          title="모드 전환"
        >
          {isMastering ? "🎭 마스터링" : "✏️ 수정 중"}
        </button>
      </div>

      <div className="toolbar-sep" />

      <div className="toolbar-group">
        <button type="button" className="toolbar-save-btn" onClick={onSave}>
          저장
        </button>
        {lastSavedAt !== null && (
          <span className="toolbar-save-time">{formatTime(lastSavedAt)} 저장됨</span>
        )}
      </div>
    </div>
  );
}
