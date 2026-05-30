"use client";

import { useState } from "react";
import type { Scenario, ScenarioFolder } from "@/types/editor";

type DragItem = { id: string; type: "scenario" | "folder" };
type DropInfo = { id: string; pos: "before" | "after" | "into" } | null;

type Props = {
  scenarios: Scenario[];
  folders: ScenarioFolder[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateFolder: () => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onReorderScenario: (dragId: string, dropId: string, pos: "before" | "after" | "into") => void;
  onReorderFolder: (dragId: string, dropId: string, pos: "before" | "after") => void;
};

export default function ScenarioPanel({
  scenarios,
  folders,
  selectedId,
  onClose,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onReorderScenario,
  onReorderFolder,
}: Props) {
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [dropInfo, setDropInfo] = useState<DropInfo>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  // ── 드래그앤드랍 ──────────────────────────────────────
  const calcPos = (
    e: React.DragEvent,
    allowInto = false,
  ): "before" | "after" | "into" => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (
      allowInto &&
      dragging?.type === "scenario" &&
      Math.abs(e.clientY - mid) < rect.height * 0.28
    ) {
      return "into";
    }
    return e.clientY < mid ? "before" : "after";
  };

  const startDrag = (e: React.DragEvent, item: DragItem) => {
    setDragging(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string, allowInto = false) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = calcPos(e, allowInto);
    setDropInfo({ id, pos });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Element)) {
      setDropInfo(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string, allowInto = false) => {
    e.preventDefault();
    if (!dragging || dragging.id === targetId) {
      setDragging(null);
      setDropInfo(null);
      return;
    }
    const pos = calcPos(e, allowInto);
    if (dragging.type === "scenario") {
      onReorderScenario(dragging.id, targetId, pos);
    } else {
      onReorderFolder(dragging.id, targetId, pos === "into" ? "after" : pos);
    }
    setDragging(null);
    setDropInfo(null);
  };

  const endDrag = () => {
    setDragging(null);
    setDropInfo(null);
  };

  // ── 인라인 이름 변경 ──────────────────────────────────
  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const commitRename = (isFolder: boolean) => {
    if (editingId && editingName.trim()) {
      isFolder
        ? onRenameFolder(editingId, editingName.trim())
        : onRename(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── 렌더 헬퍼 ─────────────────────────────────────────
  const dropClass = (id: string): string => {
    if (!dropInfo || dropInfo.id !== id) return "";
    if (dropInfo.pos === "before") return " sp-drop-before";
    if (dropInfo.pos === "after") return " sp-drop-after";
    return " sp-drop-into";
  };

  const rootScenarios = scenarios.filter((s) => !s.folderId);
  const sortedFolders = [...folders].sort((a, b) => a.createdAt - b.createdAt);

  const renderScenario = (s: Scenario, inFolder = false) => {
    const isSelected = s.id === selectedId;
    const isEditing = editingId === s.id;

    return (
      <div
        key={s.id}
        className={[
          "sp-item",
          isSelected ? "is-selected" : "",
          inFolder ? "in-folder" : "",
          dragging?.id === s.id ? "is-dragging" : "",
          dropClass(s.id),
        ]
          .filter(Boolean)
          .join(" ")}
        draggable
        onDragStart={(e) => startDrag(e, { id: s.id, type: "scenario" })}
        onDragOver={(e) => handleDragOver(e, s.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, s.id)}
        onDragEnd={endDrag}
      >
        <span className="sp-drag-handle" title="드래그하여 순서 변경">
          ⠿
        </span>

        {isEditing ? (
          <input
            className="sp-rename-input"
            value={editingName}
            autoFocus
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => commitRename(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(false);
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          <button
            type="button"
            className="sp-item-name-btn"
            onClick={() => {
              onSelect(s.id);
              onClose();
            }}
          >
            <span className="sp-item-name">{s.title}</span>
            <span className="sp-item-count">{s.lines.length}줄</span>
          </button>
        )}

        {!isEditing && (
          <div className="sp-item-actions">
            <button
              type="button"
              className="sp-action-btn"
              onClick={() => startRename(s.id, s.title)}
              title="이름 변경"
            >
              ✏
            </button>
            {scenarios.length > 1 && (
              <button
                type="button"
                className="sp-action-btn sp-delete-btn"
                onClick={() => onDelete(s.id)}
                title="삭제"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-panel" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="sp-header">
          <span className="sp-title">시나리오</span>
          <div className="sp-header-actions">
            <button
              type="button"
              className="sp-header-btn"
              onClick={onCreateFolder}
              title="새 폴더"
            >
              + 폴더
            </button>
            <button
              type="button"
              className="sp-header-btn sp-header-btn--primary"
              onClick={onCreate}
              title="새 시나리오"
            >
              + 시나리오
            </button>
            <button
              type="button"
              className="sp-close-btn"
              onClick={onClose}
              title="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 리스트 */}
        <div className="sp-body">
          {rootScenarios.map((s) => renderScenario(s, false))}

          {sortedFolders.map((folder) => {
            const folderScenarios = scenarios.filter(
              (s) => s.folderId === folder.id,
            );
            const isCollapsed = collapsedFolders.has(folder.id);
            const isEditingFolder = editingId === folder.id;

            return (
              <div
                key={folder.id}
                className={[
                  "sp-folder",
                  dragging?.id === folder.id ? "is-dragging" : "",
                  dropClass(folder.id),
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className="sp-folder-header"
                  draggable
                  onDragStart={(e) =>
                    startDrag(e, { id: folder.id, type: "folder" })
                  }
                  onDragOver={(e) => handleDragOver(e, folder.id, true)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, folder.id, true)}
                  onDragEnd={endDrag}
                >
                  <span className="sp-drag-handle">⠿</span>

                  {isEditingFolder ? (
                    <input
                      className="sp-rename-input"
                      value={editingName}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => commitRename(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(true);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="sp-folder-toggle"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      <span className="sp-folder-chevron">
                        {isCollapsed ? "▶" : "▼"}
                      </span>
                      <span className="sp-folder-name">{folder.name}</span>
                      <span className="sp-folder-count">
                        {folderScenarios.length}
                      </span>
                    </button>
                  )}

                  {!isEditingFolder && (
                    <div className="sp-item-actions">
                      <button
                        type="button"
                        className="sp-action-btn"
                        onClick={() => startRename(folder.id, folder.name)}
                        title="폴더 이름 변경"
                      >
                        ✏
                      </button>
                      <button
                        type="button"
                        className="sp-action-btn sp-delete-btn"
                        onClick={() => onDeleteFolder(folder.id)}
                        title="폴더 삭제"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="sp-folder-contents">
                    {folderScenarios.map((s) => renderScenario(s, true))}
                    {folderScenarios.length === 0 && (
                      <div className="sp-folder-empty">비어있음</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {scenarios.length === 0 && (
            <div className="sp-empty">시나리오가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
