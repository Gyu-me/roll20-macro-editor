"use client";

import { useState } from "react";
import type { Scenario, ScenarioFolder } from "@/types/editor";

type Props = {
  scenarios: Scenario[];
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

export default function ScenarioSidebar({
  scenarios,
  folders,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveScenario,
}: Props) {
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editingScenarioName, setEditingScenarioName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [movingScenarioId, setMovingScenarioId] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRenameScenario = (s: Scenario) => {
    setEditingScenarioId(s.id);
    setEditingScenarioName(s.title);
    setMovingScenarioId(null);
  };

  const commitRenameScenario = () => {
    if (editingScenarioId && editingScenarioName.trim()) {
      onRename(editingScenarioId, editingScenarioName.trim());
    }
    setEditingScenarioId(null);
  };

  const startRenameFolder = (f: ScenarioFolder) => {
    setEditingFolderId(f.id);
    setEditingFolderName(f.name);
  };

  const commitRenameFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onRenameFolder(editingFolderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
  };

  const rootScenarios = scenarios.filter((s) => !s.folderId);
  const sortedFolders = [...folders].sort((a, b) => a.createdAt - b.createdAt);

  const renderScenario = (s: Scenario, inFolder = false) => {
    const isSelected = s.id === selectedId;
    const isEditing = editingScenarioId === s.id;
    const isMoving = movingScenarioId === s.id;

    return (
      <li
        key={s.id}
        className={`scenario-item${isSelected ? " is-selected" : ""}${inFolder ? " in-folder" : ""}`}
      >
        {isEditing ? (
          <input
            className="scenario-rename-input"
            value={editingScenarioName}
            autoFocus
            onChange={(e) => setEditingScenarioName(e.target.value)}
            onBlur={commitRenameScenario}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRenameScenario();
              if (e.key === "Escape") setEditingScenarioId(null);
            }}
          />
        ) : isMoving ? (
          <div className="scenario-move-picker">
            <span className="scenario-move-label">폴더 이동:</span>
            <button
              type="button"
              className={`scenario-move-opt${!s.folderId ? " is-current" : ""}`}
              onClick={() => { onMoveScenario(s.id, null); setMovingScenarioId(null); }}
            >
              루트
            </button>
            {sortedFolders.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`scenario-move-opt${s.folderId === f.id ? " is-current" : ""}`}
                onClick={() => { onMoveScenario(s.id, f.id); setMovingScenarioId(null); }}
              >
                {f.name}
              </button>
            ))}
            <button
              type="button"
              className="scenario-move-cancel"
              onClick={() => setMovingScenarioId(null)}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="scenario-item-btn"
              onClick={() => onSelect(s.id)}
              onDoubleClick={() => startRenameScenario(s)}
              title="더블클릭하면 이름 변경"
            >
              <span className="scenario-item-name">{s.title}</span>
              <span className="scenario-item-count">{s.lines.length}줄</span>
            </button>

            {isSelected && (
              <div className="scenario-item-actions">
                {folders.length > 0 && (
                  <button
                    type="button"
                    className="scenario-action-btn"
                    onClick={() => setMovingScenarioId(s.id)}
                    title="폴더 이동"
                  >
                    ↔
                  </button>
                )}
                <button
                  type="button"
                  className="scenario-action-btn"
                  onClick={() => startRenameScenario(s)}
                  title="이름 변경"
                >
                  ✏
                </button>
                {scenarios.length > 1 && (
                  <button
                    type="button"
                    className="scenario-action-btn scenario-delete-btn"
                    onClick={() => onDelete(s.id)}
                    title="삭제"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </li>
    );
  };

  return (
    <aside className="scenario-sidebar">
      <div className="scenario-sidebar-header">
        <span className="scenario-sidebar-title">시나리오</span>
        <div className="scenario-sidebar-btns">
          <button
            type="button"
            className="scenario-create-btn"
            onClick={onCreateFolder}
            title="새 폴더"
          >
            🗂
          </button>
          <button
            type="button"
            className="scenario-create-btn"
            onClick={onCreate}
            title="새 시나리오"
          >
            +
          </button>
        </div>
      </div>

      <ul className="scenario-list">
        {/* 루트 시나리오 */}
        {rootScenarios.map((s) => renderScenario(s, false))}

        {/* 폴더별 */}
        {sortedFolders.map((folder) => {
          const folderScenarios = scenarios.filter((s) => s.folderId === folder.id);
          const isCollapsed = collapsedFolders.has(folder.id);

          return (
            <li key={folder.id} className="folder-item">
              {/* 폴더 헤더 */}
              {editingFolderId === folder.id ? (
                <div className="folder-rename-row">
                  <input
                    className="scenario-rename-input"
                    value={editingFolderName}
                    autoFocus
                    onChange={(e) => setEditingFolderName(e.target.value)}
                    onBlur={commitRenameFolder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRenameFolder();
                      if (e.key === "Escape") setEditingFolderId(null);
                    }}
                  />
                </div>
              ) : (
                <div className="folder-header">
                  <button
                    type="button"
                    className="folder-toggle-btn"
                    onClick={() => toggleFolder(folder.id)}
                    title={isCollapsed ? "펼치기" : "접기"}
                  >
                    <span className="folder-chevron">{isCollapsed ? "▶" : "▼"}</span>
                    <span className="folder-icon">🗂</span>
                    <span className="folder-name">{folder.name}</span>
                    <span className="folder-count">{folderScenarios.length}</span>
                  </button>
                  <div className="folder-actions">
                    <button
                      type="button"
                      className="scenario-action-btn"
                      onClick={() => startRenameFolder(folder)}
                      title="폴더 이름 변경"
                    >
                      ✏
                    </button>
                    <button
                      type="button"
                      className="scenario-action-btn scenario-delete-btn"
                      onClick={() => onDeleteFolder(folder.id)}
                      title="폴더 삭제 (안의 시나리오는 루트로 이동)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* 폴더 안 시나리오 */}
              {!isCollapsed && (
                <ul className="folder-scenarios">
                  {folderScenarios.map((s) => renderScenario(s, true))}
                  {folderScenarios.length === 0 && (
                    <li className="folder-empty">비어있음</li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
