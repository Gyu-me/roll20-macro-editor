"use client";

import { useMemo, useState } from "react";
import type { MacroCategory, MacroTemplate } from "@/types/macro";

type MacroListProps = {
  categories: MacroCategory[];
  templates: MacroTemplate[];
  selectedId: string;
  onSelect: (template: MacroTemplate) => void;
};

export default function MacroList({
  categories,
  templates,
  selectedId,
  onSelect,
}: MacroListProps) {
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
      return templates;
    }

    return templates.filter((template) => {
      const searchableText = [
        template.name,
        template.memo,
        template.previewText,
        template.categoryId,
        ...template.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(trimmedQuery);
    });
  }, [query, templates]);

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
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <p className="macro-count">{filteredTemplates.length}개 기능 표시 중</p>

      <nav className="category-list" aria-label="매크로 카테고리 목록">
        {sortedCategories.map((category) => {
          const categoryTemplates = filteredTemplates
            .filter((template) => template.categoryId === category.id)
            .sort((a, b) => a.order - b.order);

          if (categoryTemplates.length === 0) {
            return null;
          }

          return (
            <section key={category.id} className="category-section">
              <div className="category-title">
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </div>

              <div className="macro-items">
                {categoryTemplates.map((template) => {
                  const isSelected = template.id === selectedId;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      className={`macro-item ${isSelected ? "is-selected" : ""}`}
                      onClick={() => onSelect(template)}
                    >
                      <span className="macro-preview">
                        {template.previewText}
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
