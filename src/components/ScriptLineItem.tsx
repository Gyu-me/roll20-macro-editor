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
  platformMode: PlatformMode;
  editorMode: EditorMode;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (labelId: string, afterId: string) => void;
  onCopied: (text: string) => void;
};

export default function ScriptLineItem({
  line,
  label,
  platformMode,
  editorMode,
  onUpdate,
  onDelete,
  onAddAfter,
  onCopied,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [line.content]);

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

  const badgeStyle = {
    background: `${label.color}22`,
    color: label.color,
    border: `1px solid ${label.color}55`,
  };

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
      <div className="line-label-wrap">
        <span className="line-label-badge" style={badgeStyle}>
          {label.name}
        </span>
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
