export { HomeScreen } from "./HomeScreen";
export { DashboardScreen } from "./DashboardScreen";
export { MessagesScreen } from "./MessagesScreen";
export { ArchiveScreen } from "./ArchiveScreen";
export { ResourcesScreen } from "./ResourcesScreen";
export { ProjectsScreen } from "./ProjectsScreen";
export { IntegrationsScreen } from "./IntegrationsScreen";
export { TasksScreen } from "./TasksScreen";
export { TemplatesScreen } from "./TemplatesScreen";
export { CustomizeScreen } from "./CustomizeScreen";
export { SettingsScreen } from "./SettingsScreen";
export { SessionsScreen } from "./SessionsScreen";
export { TranslateScreen } from "./TranslateScreen";

import type { ScreenId } from "../stores/types";
import { DashboardScreen } from "./DashboardScreen";
import { ResourcesScreen } from "./ResourcesScreen";
import { ProjectsScreen } from "./ProjectsScreen";
import { TemplatesScreen } from "./TemplatesScreen";
import { CustomizeScreen } from "./CustomizeScreen";
import { SettingsScreen } from "./SettingsScreen";
import { SessionsScreen } from "./SessionsScreen";
import { TranslateScreen } from "./TranslateScreen";

/** Legacy screen registry retained for feature modules that import individual
    screens. AppShell now routes through ScreenRouter; saved-prompts and trash
    live there, so this secondary registry is intentionally partial. */
export const SCREENS: Partial<Record<ScreenId, React.FC>> = {
  insights: DashboardScreen,
  techniques: ResourcesScreen,
  projects: ProjectsScreen,
  variables: CustomizeScreen,
  "saved-tools": TemplatesScreen,
  settings: SettingsScreen,
  sessions: SessionsScreen,
  translate: TranslateScreen,
};
