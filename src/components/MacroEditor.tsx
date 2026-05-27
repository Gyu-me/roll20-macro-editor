"use client";

import { useState } from "react";
import MacroList from "@/components/MacroList";
import { macroCategories } from "@/data/macroCategories";
import { macroTemplates } from "@/data/macroTemplates";
import type { MacroTemplate } from "@/types/macro";

export default function MacroEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<MacroTemplate>(
    macroTemplates[0],
  );

  return (
    <main className="editor-layout">
      <MacroList
        categories={macroCategories}
        templates={macroTemplates}
        selectedId={selectedTemplate.id}
        onSelect={setSelectedTemplate}
      />

      <section className="edit-panel">
        <div className="top-bar">
          <div>
            <p className="category-label">{selectedTemplate.categoryId}</p>
            <h2>{selectedTemplate.name}</h2>
            <p>{selectedTemplate.memo}</p>
          </div>

          <button type="button" className="small-button">
            스타일 설정
          </button>
        </div>

        <section className="card">
          <h3>내용 편집</h3>
          <input
            type="text"
            defaultValue={selectedTemplate.previewText}
            aria-label="내용 편집"
          />
        </section>

        <section className="card">
          <h3>메모</h3>
          <textarea defaultValue={selectedTemplate.memo} aria-label="메모" />
        </section>

        <section className="card">
          <h3>원본 매크로 코드</h3>
          <textarea
            readOnly
            value={selectedTemplate.code}
            aria-label="원본 매크로 코드"
          />
        </section>
      </section>

      <section className="preview-panel">
        <div className="top-bar">
          <div>
            <p className="category-label">실시간 미리보기</p>
            <h2>미리보기</h2>
          </div>
        </div>

        <div className="preview-box">
          <span className="sample-preview">{selectedTemplate.previewText}</span>
        </div>

        <section className="card">
          <h3>Roll20 최종 코드</h3>
          <textarea
            readOnly
            value={selectedTemplate.code}
            aria-label="Roll20 최종 코드"
          />
        </section>

        <section className="card">
          <h3>HTML 미리보기 코드</h3>
          <textarea
            readOnly
            value="다음 이슈에서 Roll20 코드를 HTML 미리보기 코드로 변환할 예정입니다."
            aria-label="HTML 미리보기 코드"
          />
        </section>
      </section>
    </main>
  );
}
