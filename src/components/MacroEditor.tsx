"use client";

import { useEffect, useMemo, useState } from "react";
import MacroList from "@/components/MacroList";
import { macroCategories } from "@/data/macroCategories";
import { macroTemplates } from "@/data/macroTemplates";
import type { ColorPreset, MacroTemplate, StyleVariant } from "@/types/macro";
import { roll20CodeToHtml } from "@/utils/roll20Preview";
import {
  applyFieldValues,
  parseTemplateFields,
  type FieldDef,
} from "@/utils/templateFields";

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
      <MacroEditorPanels
        key={selectedTemplate.id}
        selectedTemplate={selectedTemplate}
      />
    </main>
  );
}

type MacroEditorPanelsProps = {
  selectedTemplate: MacroTemplate;
};

function MacroEditorPanels({ selectedTemplate }: MacroEditorPanelsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    selectedTemplate.variants?.[0]?.id ?? "",
  );

  const activeCode = useMemo(() => {
    if (selectedTemplate.variants && selectedVariantId) {
      return (
        selectedTemplate.variants.find((v) => v.id === selectedVariantId)
          ?.code ?? selectedTemplate.code
      );
    }
    return selectedTemplate.code;
  }, [selectedTemplate, selectedVariantId]);

  const fields = useMemo(
    () => parseTemplateFields(activeCode),
    [activeCode],
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const defaults = Object.fromEntries(
      fields.map((f) => [f.key, f.defaultValue]),
    );
    return { ...defaults, ...(selectedTemplate.fieldDefaults ?? {}) };
  });

  // When variant changes, fill in any new field defaults
  useEffect(() => {
    setFieldValues((prev) => {
      const next = { ...prev };
      for (const f of fields) {
        if (!(f.key in next)) {
          next[f.key] =
            selectedTemplate.fieldDefaults?.[f.key] ?? f.defaultValue;
        }
      }
      return next;
    });
  }, [fields, selectedTemplate.fieldDefaults]);

  const [memo, setMemo] = useState(selectedTemplate.memo);
  const [codeOverride, setCodeOverride] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  const generatedCode = useMemo(
    () => applyFieldValues(activeCode, fields, fieldValues),
    [activeCode, fields, fieldValues],
  );

  const finalCode = codeOverride ?? generatedCode;
  const previewHtml = roll20CodeToHtml(finalCode);

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setCodeOverride(null);
  };

  const handleVariantChange = (variant: StyleVariant) => {
    setSelectedVariantId(variant.id);
    setCodeOverride(null);
  };

  const handlePresetSelect = (preset: ColorPreset) => {
    const prefixed = Object.fromEntries(
      Object.entries(preset.values).map(([k, v]) => [`color_${k}`, v]),
    );
    setFieldValues((prev) => ({ ...prev, ...prefixed }));
    setCodeOverride(null);
  };

  const handleCopyFinalCode = async () => {
    try {
      await navigator.clipboard.writeText(finalCode);
      setCopyMessage("Roll20 최종 코드를 복사했어요.");
    } catch {
      setCopyMessage("복사에 실패했어요. 코드를 직접 선택해서 복사해주세요.");
    }
  };

  return (
    <>
      <section className="edit-panel">
        <div className="top-bar">
          <div>
            <p className="category-label">{selectedTemplate.categoryId}</p>
            <h2>{selectedTemplate.name}</h2>
            <p>{selectedTemplate.memo}</p>
          </div>
        </div>

        {/* Variant selector */}
        {selectedTemplate.variants && selectedTemplate.variants.length > 0 && (
          <section className="card">
            <h3>스타일 선택</h3>
            <div className="variant-buttons">
              {selectedTemplate.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`variant-btn${selectedVariantId === v.id ? " is-active" : ""}`}
                  onClick={() => handleVariantChange(v)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Color presets */}
        {selectedTemplate.colorPresets &&
          selectedTemplate.colorPresets.length > 0 && (
            <section className="card">
              <h3>컬러 프리셋</h3>
              <div className="preset-buttons">
                {selectedTemplate.colorPresets.map((preset) => {
                  const firstColor = Object.values(preset.values)[0] ?? "#333";
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      className="preset-btn"
                      style={{ background: firstColor }}
                      onClick={() => handlePresetSelect(preset)}
                      title={preset.name}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

        {/* Dynamic fields */}
        {fields.length > 0 && (
          <section className="card">
            <h3>내용 / 색상 편집</h3>
            {fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={fieldValues[field.key] ?? field.defaultValue}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            ))}
          </section>
        )}

        <section className="card">
          <div className="card-title-row">
            <h3>내 메모</h3>
            <span className="helper-text">사용법이나 수정 포인트 기록</span>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            aria-label="메모"
          />
        </section>

        <section className="card">
          <div className="card-title-row">
            <h3>Roll20 코드 직접 편집</h3>
            <span className="helper-text">
              {codeOverride !== null ? "직접 수정 중" : "자동 생성됨"}
            </span>
          </div>
          <textarea
            value={finalCode}
            onChange={(e) => setCodeOverride(e.target.value)}
            aria-label="Roll20 코드 직접 편집"
          />
          {codeOverride !== null && (
            <button
              type="button"
              className="reset-code-button"
              onClick={() => setCodeOverride(null)}
            >
              자동 생성으로 되돌리기
            </button>
          )}
        </section>
      </section>

      <section className="preview-panel">
        <div className="top-bar">
          <div>
            <p className="category-label">실시간 미리보기</p>
            <h2>미리보기</h2>
          </div>
        </div>

        <div
          className="preview-box roll20-preview"
          dangerouslySetInnerHTML={{
            __html:
              previewHtml ||
              '<span style="color:#aaa;font-size:13px;">미리보기 없음</span>',
          }}
        />

        <section className="card">
          <div className="card-title-row">
            <h3>Roll20 최종 코드</h3>
            <button
              type="button"
              className="copy-button"
              onClick={handleCopyFinalCode}
            >
              코드 복사
            </button>
          </div>
          <textarea readOnly value={finalCode} aria-label="Roll20 최종 코드" />
          {copyMessage && <p className="copy-message">{copyMessage}</p>}
        </section>

        <section className="card">
          <h3>현재 선택한 기능 정보</h3>
          <dl className="template-info-list">
            <div>
              <dt>기능명</dt>
              <dd>{selectedTemplate.name}</dd>
            </div>
            <div>
              <dt>카테고리</dt>
              <dd>{selectedTemplate.categoryId}</dd>
            </div>
            <div>
              <dt>메모</dt>
              <dd>{memo}</dd>
            </div>
          </dl>
        </section>
      </section>
    </>
  );
}

type FieldInputProps = {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
};

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const safeColorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#333333";

  return (
    <div className="field-row">
      <label className="field-label">{field.label}</label>
      {field.type === "text" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${field.label} 입력...`}
          aria-label={field.label}
        />
      ) : (
        <div className="color-field-row">
          <input
            type="color"
            className="color-picker"
            value={safeColorValue}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${field.label} 색상 선택`}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
            }}
            placeholder="#333333"
            aria-label={`${field.label} 직접 입력`}
          />
        </div>
      )}
    </div>
  );
}
