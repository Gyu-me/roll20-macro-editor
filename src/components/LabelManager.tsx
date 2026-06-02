"use client";

import { useRef, useState } from "react";
import type { LabelSetting } from "@/types/editor";

type Props = {
  labels: LabelSetting[];
  onClose: () => void;
  onAddLabel: (label: Omit<LabelSetting, "id" | "order">) => void;
  onUpdateLabel: (id: string, patch: Partial<LabelSetting>) => void;
  onDeleteLabel: (id: string) => void;
  onMoveLabel: (id: string, direction: "up" | "down") => void;
};

export default function LabelManager({
  labels,
  onClose,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  onMoveLabel,
}: Props) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [color, setColor] = useState("#666666");
  const [excludeFromOutput, setExcludeFromOutput] = useState(false);

  const sorted = [...labels].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddLabel({
      name: name.trim(),
      command: command.trim(),
      color,
      backgroundColor: "#ffffff",
      excludeFromOutput,
      isDefault: false,
    });
    setName("");
    setCommand("");
    setColor("#666666");
    setExcludeFromOutput(false);
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="lm-header">
          <h3 className="lm-title">태그 설정</h3>
          <button type="button" className="lm-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="lm-list">
          {sorted.map((label, idx) => (
            <LabelRow
              key={label.id}
              label={label}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              onUpdateColor={(color) => onUpdateLabel(label.id, { color })}
              onMove={(dir) => onMoveLabel(label.id, dir)}
              onDelete={() => onDeleteLabel(label.id)}
            />
          ))}
        </div>

        <div className="lm-add-section">
          <p className="lm-add-title">새 태그 추가</p>
          <div className="lm-add-form">
            <div className="lm-add-row1">
              <input
                type="color"
                className="lm-color-picker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="태그 색상"
              />
              <input
                type="text"
                className="lm-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="태그 이름"
              />
            </div>
            <div className="lm-add-row2">
              <input
                type="text"
                className="lm-input lm-input-command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Roll20 명령어 (예: /desc, /w gm, /as &quot;이름&quot;)"
              />
              <button
                type="button"
                className="lm-add-btn"
                onClick={handleAdd}
                disabled={!name.trim()}
              >
                추가
              </button>
            </div>
            <label className="lm-exclude-check">
              <input
                type="checkbox"
                checked={excludeFromOutput}
                onChange={(e) => setExcludeFromOutput(e.target.checked)}
              />
              출력에서 제외 (메모용)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

type LabelRowProps = {
  label: LabelSetting;
  isFirst: boolean;
  isLast: boolean;
  onUpdateColor: (color: string) => void;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
};

function LabelRow({ label, isFirst, isLast, onUpdateColor, onMove, onDelete }: LabelRowProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lm-row">
      <button
        type="button"
        className="lm-color-dot-btn"
        style={{ background: label.color }}
        title="색상 변경"
        onClick={() => colorInputRef.current?.click()}
      >
        <input
          ref={colorInputRef}
          type="color"
          className="lm-color-dot-input"
          value={label.color}
          onChange={(e) => onUpdateColor(e.target.value)}
          tabIndex={-1}
        />
      </button>

      <span className="lm-row-name">{label.name}</span>
      <span className="lm-row-command">
        {label.command || (
          <span className="lm-row-command-empty">명령어 없음</span>
        )}
      </span>

      {label.isDefault && (
        <span className="lm-default-badge">기본</span>
      )}
      {label.excludeFromOutput && (
        <span className="lm-exclude-badge">출력 제외</span>
      )}

      <div className="lm-row-actions">
        <button
          type="button"
          className="lm-move-btn"
          onClick={() => onMove("up")}
          disabled={isFirst}
          title="위로"
        >
          ▲
        </button>
        <button
          type="button"
          className="lm-move-btn"
          onClick={() => onMove("down")}
          disabled={isLast}
          title="아래로"
        >
          ▼
        </button>
        {!label.isDefault && (
          <button
            type="button"
            className="lm-delete-btn"
            onClick={onDelete}
            title="삭제"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
