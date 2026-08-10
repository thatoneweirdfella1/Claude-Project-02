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
import { HomeScreen } from "./HomeScreen";
import { DashboardScreen } from "./DashboardScreen";
import { MessagesScreen } from "./MessagesScreen";
import { ArchiveScreen } from "./ArchiveScreen";
import { ResourcesScreen } from "./ResourcesScreen";
import { ProjectsScreen } from "./ProjectsScreen";
import { IntegrationsScreen } from "./IntegrationsScreen";
import { TasksScreen } from "./TasksScreen";
import { TemplatesScreen } from "./TemplatesScreen";
import { CustomizeScreen } from "./CustomizeScreen";
import { SettingsScreen } from "./SettingsScreen";
import { SessionsScreen } from "./SessionsScreen";
import { TranslateScreen } from "./TranslateScreen";

export const SCREENS: Record<ScreenId, React.FC> = {
  home: HomeScreen,
  dashboard: DashboardScreen,
  messages: MessagesScreen,
  archive: ArchiveScreen,
  resources: ResourcesScreen,
  projects: ProjectsScreen,
  integrations: IntegrationsScreen,
  tasks: TasksScreen,
  templates: TemplatesScreen,
  customize: CustomizeScreen,
  settings: SettingsScreen,
  sessions: SessionsScreen,
  translate: TranslateScreen,
};
