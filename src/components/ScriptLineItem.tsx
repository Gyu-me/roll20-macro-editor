"use client";

import { useEffect, useRef, useState } from "react";
import type {
  EditorMode,
  LabelSetting,
  PlatformMode,
  ScriptLine,
} from "@/types/editor";
import { getLineOutput } from "@/utils/scriptOutput";

type Props = {
  line: ScriptLine;
  label: LabelSetting;
  labels: LabelSetting[];
  platformMode: PlatformMode;
  editorMode: EditorMode;
  onUpdate: (id: string, content: string) => void;
  onChangeLabel: (id: string, labelId: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (labelId: string, afterId: string) => void;
  onCopied: (text: string) => void;
};

export default function ScriptLineItem({
  line,
  label,
  labels,
  platformMode,
  editorMode,
  onUpdate,
  onChangeLabel,
  onDelete,
  onAddAfter,
  onCopied,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [justCopied, setJustCopied] = useState(false);
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [line.content]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!labelDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLabelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [labelDropdownOpen]);

  const isMastering = editorMode === "mastering";
  const output = getLineOutput(line, label, platformMode);

  const handleMasteringClick = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      onCopied(output);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 800);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddAfter(line.labelId, line.id);
    }
  };

  const handleLabelSelect = (labelId: string) => {
    onChangeLabel(line.id, labelId);
    setLabelDropdownOpen(false);
  };

  const badgeStyle = {
    background: `${label.color}22`,
    color: label.color,
    border: `1px solid ${label.color}55`,
  };

  const sortedLabels = [...labels].sort((a, b) => a.order - b.order);

  return (
    <div
      className={[
        "script-line",
        `type-${line.type}`,
        isMastering ? "mastering-mode" : "",
        justCopied ? "just-copied" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isMastering ? handleMasteringClick : undefined}
    >
      <div className="line-label-wrap" ref={dropdownRef}>
        {!isMastering ? (
          <>
            <button
              type="button"
              className="line-label-badge line-label-badge--btn"
              style={badgeStyle}
              onClick={(e) => {
                e.stopPropagation();
                setLabelDropdownOpen((v) => !v);
              }}
              title="태그 변경"
            >
              {label.name}
              <span className="line-label-caret">▾</span>
            </button>
            {labelDropdownOpen && (
              <div className="line-label-dropdown">
                {sortedLabels.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`line-label-option${l.id === line.labelId ? " is-active" : ""}`}
                    onClick={() => handleLabelSelect(l.id)}
                  >
                    <span
                      className="line-label-option-dot"
                      style={{ background: l.color }}
                    />
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="line-label-badge" style={badgeStyle}>
            {label.name}
          </span>
        )}
      </div>

      {isMastering ? (
        <div
          className="line-content-display"
          style={{ background: label.backgroundColor }}
        >
          {line.content ? (
            line.content
          ) : (
            <span className="line-empty-hint">비어있음</span>
          )}
        </div>
      ) : (
        <div className="line-content-wrap">
          <textarea
            ref={textareaRef}
            className="line-textarea"
            value={line.content}
            onChange={(e) => onUpdate(line.id, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${label.name} 입력...  (Enter: 다음 줄 추가 / Shift+Enter: 줄바꿈)`}
            rows={1}
            style={{ background: label.backgroundColor }}
          />
        </div>
      )}

      {!isMastering && (
        <button
          type="button"
          className="line-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(line.id);
          }}
          aria-label="라인 삭제"
          title="삭제"
        >
          ×
        </button>
      )}
    </div>
  );
}
