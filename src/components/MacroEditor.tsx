"use client";

import { useEffect, useMemo, useState } from "react";
import MacroList from "@/components/MacroList";
import { macroCategories } from "@/data/macroCategories";
import { macroTemplates } from "@/data/macroTemplates";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useTemplateMemo } from "@/hooks/useTemplateMemo";
import type { ColorPreset, MacroTemplate, StyleVariant } from "@/types/macro";
import { roll20CodeToHtml } from "@/utils/roll20Preview";
import {
  applyFieldValues,
  parseTemplateFields,
  type FieldDef,
} from "@/utils/templateFields";

const DEFAULT_PALETTE = [
  "#EF1E2B", "#EF1B62", "#FE8A01", "#F4C540",
  "#86BD03", "#31A749", "#03E4FD", "#253BFE",
  "#022B92", "#8424FA", "#11182A", "#343434",
  "#666666", "#FFFFFF",
];

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
  const { colors: customPalette, saveColor, removeColor } = useColorPalette();

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

  const fields = useMemo(() => parseTemplateFields(activeCode), [activeCode]);

  const textFields = useMemo(() => fields.filter((f) => f.type === "text"), [fields]);
  const colorFields = useMemo(() => fields.filter((f) => f.type === "color"), [fields]);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const defaults = Object.fromEntries(
      fields.map((f) => [f.key, f.defaultValue]),
    );
    return { ...defaults, ...(selectedTemplate.fieldDefaults ?? {}) };
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const [memo, setMemo] = useTemplateMemo(selectedTemplate.id, selectedTemplate.memo);
  const [codeOverride, setCodeOverride] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  const generatedCode = useMemo(
    () => applyFieldValues(activeCode, fields, fieldValues),
    [activeCode, fields, fieldValues],
  );

  const finalCode = codeOverride ?? generatedCode;

  const previewSource = useMemo(() => {
    if (codeOverride !== null) return codeOverride;
    if (selectedTemplate.previewCode) {
      return applyFieldValues(
        selectedTemplate.previewCode,
        fields,
        fieldValues,
      );
    }
    return generatedCode;
  }, [
    codeOverride,
    selectedTemplate.previewCode,
    fields,
    fieldValues,
    generatedCode,
  ]);

  const previewHtml = roll20CodeToHtml(previewSource);

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

  const previewBoxStyle = selectedTemplate.previewBackground
    ? { background: selectedTemplate.previewBackground }
    : undefined;

  return (
    <>
      <section className="edit-panel">
        <div className="top-bar">
          <div className="top-bar-inner">
            <p className="category-label">{selectedTemplate.categoryId}</p>
            <h2>{selectedTemplate.name}</h2>
            <textarea
              className="top-bar-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요..."
              aria-label="메모"
            />
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

        {/* Color presets + color fields */}
        {(selectedTemplate.colorPresets?.length || colorFields.length > 0) ? (
          <section className="card">
            {selectedTemplate.colorPresets && selectedTemplate.colorPresets.length > 0 && (
              <>
                <h3>컬러 프리셋</h3>
                <div className="preset-buttons" style={{ marginBottom: colorFields.length > 0 ? 16 : 0 }}>
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
              </>
            )}

            {colorFields.length > 0 && (
              <>
                {selectedTemplate.colorPresets && selectedTemplate.colorPresets.length > 0 && (
                  <h3 style={{ marginBottom: 12 }}>색상 편집</h3>
                )}
                {!selectedTemplate.colorPresets?.length && <h3>색상 편집</h3>}
                {colorFields.map((field) => (
                  <ColorFieldInput
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key] ?? field.defaultValue}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    customPalette={customPalette}
                    onSaveColor={saveColor}
                    onRemoveColor={removeColor}
                  />
                ))}
              </>
            )}
          </section>
        ) : null}

        {/* Text fields */}
        {textFields.length > 0 && (
          <section className="card">
            <h3>내용 편집</h3>
            {textFields.map((field) => (
              <TextFieldInput
                key={field.key}
                field={field}
                value={fieldValues[field.key] ?? field.defaultValue}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            ))}
          </section>
        )}

        {colorFields.length === 0 && textFields.length === 0 && (
          <section className="card">
            <p className="no-fields-hint">이 템플릿은 편집 가능한 필드가 없습니다.</p>
          </section>
        )}

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
          style={previewBoxStyle}
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

// ── Text field ──────────────────────────────────────────

type TextFieldInputProps = {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
};

function TextFieldInput({ field, value, onChange }: TextFieldInputProps) {
  return (
    <div className="field-row">
      <label className="field-label">{field.label}</label>
      <div className="field-input-area">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${field.label} 입력...`}
          aria-label={field.label}
        />
      </div>
    </div>
  );
}

// ── Color field ─────────────────────────────────────────

type ColorFieldInputProps = {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  customPalette: string[];
  onSaveColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
};

function ColorFieldInput({
  field,
  value,
  onChange,
  customPalette,
  onSaveColor,
  onRemoveColor,
}: ColorFieldInputProps) {
  const safeColorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#333333";

  return (
    <div className="field-row">
      <label className="field-label">{field.label}</label>
      <div className="field-input-area">
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
          <button
            type="button"
            className="save-color-btn"
            onClick={() => onSaveColor(safeColorValue)}
            title="현재 색상을 내 색상에 저장"
          >
            저장
          </button>
        </div>
        <div className="palette-section">
          <span className="palette-label">기본 팔레트</span>
          <div className="default-palette">
            {DEFAULT_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className="default-swatch"
                style={{ background: c }}
                title={c}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
          {customPalette.length > 0 && (
            <>
              <span className="palette-label">내 색상</span>
              <div className="color-palette">
                {customPalette.map((c) => (
                  <span key={c} className="palette-swatch-wrap">
                    <button
                      type="button"
                      className="palette-swatch"
                      style={{ background: c }}
                      title={c}
                      onClick={() => onChange(c)}
                    />
                    <button
                      type="button"
                      className="swatch-delete"
                      aria-label={`${c} 삭제`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveColor(c);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
