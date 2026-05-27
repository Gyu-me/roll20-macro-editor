"use client";

import { useMemo, useState } from "react";
import type { MacroCategory, MacroTemplate } from "@/types/macro";
import { roll20CodeToHtml } from "@/utils/roll20Preview";
import { applyFieldValues, parseTemplateFields } from "@/utils/templateFields";

type MacroListProps = {
  categories: MacroCategory[];
  templates: MacroTemplate[];
  selectedId: string;
  onSelect: (template: MacroTemplate) => void;
};

function getTemplateThumbnailHtml(template: MacroTemplate): string {
  if (!template.code) return template.previewText;
  const activeCode =
    template.variants?.[0]?.code ?? template.code;
  const fields = parseTemplateFields(activeCode);
  const values = {
    ...Object.fromEntries(fields.map((f) => [f.key, f.defaultValue])),
    ...(template.fieldDefaults ?? {}),
  };
  const resolved = applyFieldValues(activeCode, fields, values);
  const html = roll20CodeToHtml(resolved);
  return html || template.previewText;
}

export default function MacroList({
  categories,
  templates,
  selectedId,
  onSelect,
}: MacroListProps) {
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) =>
      [t.name, t.memo, t.previewText, t.categoryId, ...t.keywords]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, templates]);

  const thumbnails = useMemo(
    () =>
      Object.fromEntries(
        templates.map((t) => [t.id, getTemplateThumbnailHtml(t)]),
      ),
    [templates],
  );

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <aside className="macro-sidebar">
      <div className="sidebar-header">
        <h1>Roll20 매크로 편집기</h1>
        <p>TRPG GM용 매크로를 정리하고 생성합니다.</p>
      </div>

      <div className="search-area">
        <label htmlFor="macro-search">기능 검색</label>
        <input
          id="macro-search"
          type="search"
          placeholder="기능명, 메모, 키워드 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className="macro-count">{filteredTemplates.length}개 기능 표시 중</p>

      <nav className="category-list" aria-label="매크로 카테고리 목록">
        {sortedCategories.map((category) => {
          const items = filteredTemplates
            .filter((t) => t.categoryId === category.id)
            .sort((a, b) => a.order - b.order);

          if (items.length === 0) return null;

          return (
            <section key={category.id} className="category-section">
              <div className="category-title">
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </div>

              <div className="macro-items">
                {items.map((template) => {
                  const html = thumbnails[template.id] ?? template.previewText;
                  const isHtml = html.includes("<");

                  return (
                    <button
                      key={template.id}
                      type="button"
                      className={`macro-item${template.id === selectedId ? " is-selected" : ""}`}
                      onClick={() => onSelect(template)}
                    >
                      <span className="macro-preview">
                        {isHtml ? (
                          <span
                            className="macro-preview-html"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        ) : (
                          html
                        )}
                      </span>

                      <span className="macro-text">
                        <strong>{template.name}</strong>
                        <small>{template.memo}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
