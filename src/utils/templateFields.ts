export type FieldType = "text" | "color";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  defaultValue: string;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseTemplateFields(code: string): FieldDef[] {
  const fields: FieldDef[] = [];
  const seenKeys = new Set<string>();

  // ?{label} or ?{label|default} or ?{label|opt1|opt2}
  const promptRegex = /\?\{([^}|]*)(?:\|([^}]*))?\}/g;
  let m: RegExpExecArray | null;
  while ((m = promptRegex.exec(code)) !== null) {
    const label = m[1].trim();
    if (!label || seenKeys.has(`prompt_${label}`)) continue;
    seenKeys.add(`prompt_${label}`);
    const rawRest = m[2];
    // If no default provided, use label as preview fallback
    const defaultValue =
      rawRest !== undefined ? rawRest.split("|")[0] || label : label;
    fields.push({ key: `prompt_${label}`, label, type: "text", defaultValue });
  }

  // #한글색상이름 (Korean color placeholder names like #색상코드, #배경색)
  const colorRegex = /#([가-힣]+)/g;
  while ((m = colorRegex.exec(code)) !== null) {
    const colorName = m[1];
    const key = `color_${colorName}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    fields.push({
      key,
      label: colorName,
      type: "color",
      defaultValue: "#333333",
    });
  }

  return fields;
}

export function applyFieldValues(
  code: string,
  fields: FieldDef[],
  values: Record<string, string>,
): string {
  let result = code;
  for (const field of fields) {
    const value = values[field.key] ?? field.defaultValue;
    if (!value) continue;
    if (field.type === "text") {
      result = result.replace(
        new RegExp(`\\?\\{${escapeRegex(field.label)}[^}]*\\}`, "g"),
        value,
      );
    } else {
      const colorName = field.key.slice("color_".length);
      result = result.replace(
        new RegExp(`#${escapeRegex(colorName)}`, "g"),
        value,
      );
    }
  }
  return result;
}
