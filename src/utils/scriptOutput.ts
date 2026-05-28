import type { LabelSetting, PlatformMode, ScriptLine } from "@/types/editor";

export function getLineOutput(
  line: ScriptLine,
  label: LabelSetting,
  platform: PlatformMode,
): string {
  if (label.excludeFromOutput) return "";
  if (platform === "ccfolia") return line.content;
  if (!label.command) return line.content;
  if (label.roll20Style) {
    return `${label.command} [${line.content}](#" style="${label.roll20Style}")`;
  }
  return `${label.command} ${line.content}`;
}
