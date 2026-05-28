"use client";

import { useState } from "react";
import ScriptLineItem from "@/components/ScriptLineItem";
import type { EditorSettings, Scenario, ScriptLine } from "@/types/editor";

type Props = {
  scenario: Scenario;
  settings: EditorSettings;
  onUpdateLine: (id: string, content: string) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: (labelId: string, afterId?: string, content?: string) => void;
};

export default function ScriptEditor({
  scenario,
  settings,
  onUpdateLine,
  onDeleteLine,
  onAddLine,
}: Props) {
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const { labels, platformMode, editorMode } = settings;

  const getLabelForLine = (line: ScriptLine) =>
    labels.find((l) => l.id === line.labelId) ?? labels[0];

  return (
    <div className="script-editor-wrap">
      <div className="script-editor">
        <div className="script-editor-inner">
          <div className="scenario-header">
            <h2 className="scenario-title">{scenario.title}</h2>
            <span className="scenario-line-count">
              {scenario.lines.length}개 라인
            </span>
          </div>

          {scenario.lines.length === 0 ? (
            <p className="empty-scenario-hint">
              아직 라인이 없어요. 상단 버튼으로 추가해보세요.
            </p>
          ) : (
            <div className="script-lines">
              {scenario.lines.map((line) => (
                <ScriptLineItem
                  key={line.id}
                  line={line}
                  label={getLabelForLine(line)}
                  platformMode={platformMode}
                  editorMode={editorMode}
                  onUpdate={onUpdateLine}
                  onDelete={onDeleteLine}
                  onAddAfter={(labelId, afterId) => onAddLine(labelId, afterId)}
                  onCopied={setLastCopied}
                />
              ))}
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
