export type PlatformMode = "roll20" | "ccfolia";
export type EditorMode = "edit" | "mastering";

export type ScriptLineType =
  | "main"
  | "dialogue"
  | "whisper"
  | "memo"
  | "handout"
  | "divider"
  | "roll"
  | "emphasis"
  | "raw"
  | "custom";

export type ScriptLine = {
  id: string;
  type: ScriptLineType;
  labelId: string;
  content: string;
  collapsed?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type BranchOption = {
  id: string;
  title: string;
  description?: string;
  condition?: string;
  lines: ScriptLine[];
  collapsed?: boolean;
};

export type BranchBlock = {
  id: string;
  type: "branch";
  title: string;
  description?: string;
  selectedOptionId?: string;
  options: BranchOption[];
  createdAt: number;
  updatedAt: number;
};

export type ScriptNode = ScriptLine | BranchBlock;

export type Scenario = {
  id: string;
  folderId: string | null;
  title: string;
  lines: ScriptNode[];
  createdAt: number;
  updatedAt: number;
};

export type ScenarioFolder = {
  id: string;
  name: string;
  scenarioIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type LabelSetting = {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  command: string;
  roll20Style?: string;
  order: number;
  excludeFromOutput?: boolean;
  isDefault?: boolean;
  hideFromToolbar?: boolean;
};

export type EditorSettings = {
  platformMode: PlatformMode;
  editorMode: EditorMode;
  autoSaveEnabled: boolean;
  fontSize: number;
  fontFamily: string;
  autoResizeTextarea: boolean;
  labels: LabelSetting[];
};

export type AppState = {
  folders: ScenarioFolder[];
  scenarios: Scenario[];
  selectedScenarioId: string | null;
  settings: EditorSettings;
  lastSavedAt: number | null;
};
