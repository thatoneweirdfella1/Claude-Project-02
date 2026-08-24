import type { ScreenId, ScreenSectionId } from "../../stores/types";

export interface AppLocation {
  screen: ScreenId;
  section?: ScreenSectionId;
}

export interface NavigationEntry extends AppLocation {
  id: string;
  label: string;
  description: string;
}

export const PRIMARY_NAVIGATION: readonly NavigationEntry[] = [
  { id: "talk-to-ai", label: "Talk to AI", screen: "translate", description: "Active conversation and draft" },
  { id: "sessions", label: "Sessions", screen: "sessions", section: "active", description: "Active, saved, archived, and trashed sessions" },
  { id: "saved-tools", label: "Saved Tools", screen: "saved-tools", description: "Templates and Saved Prompts" },
  { id: "projects", label: "Projects", screen: "projects", section: "overview", description: "Project tasks, resources, and integrations" },
  { id: "insights", label: "Insights", screen: "insights", section: "overview", description: "Overview, usage, activity, and communication patterns" },
  { id: "settings", label: "Settings", screen: "settings", description: "Account and application settings" },
] as const;

export const TOOL_NAVIGATION: readonly NavigationEntry[] = [
  { id: "templates", label: "Templates", screen: "saved-tools", section: "templates", description: "Reusable request templates" },
  { id: "saved-prompts", label: "Saved Prompts", screen: "saved-tools", section: "saved-prompts", description: "Saved prompt library" },
  { id: "techniques", label: "Techniques", screen: "techniques", description: "Technique reference" },
  { id: "variables", label: "Variables", screen: "variables", description: "Reusable context variables" },
  { id: "checkpoints", label: "Checkpoints", screen: "checkpoints", description: "Saved recovery checkpoints" },
  { id: "connections", label: "AI Connections", screen: "settings", section: "connections", description: "Provider and model connections" },
  { id: "large-jobs", label: "Large Jobs", screen: "large-jobs", description: "Resumable high-volume work" },
] as const;

export const QUICK_TOOL_NAVIGATION: readonly NavigationEntry[] = [
  { id: "router", label: "Router", screen: "translate", description: "Open routing controls" },
  { id: "techniques", label: "Techniques", screen: "techniques", description: "Technique reference" },
  { id: "prompt-library", label: "Prompt Library", screen: "saved-tools", section: "saved-prompts", description: "Saved prompt library" },
  { id: "variables", label: "Variables", screen: "variables", description: "Reusable context variables" },
  { id: "checkpoints", label: "Checkpoints", screen: "checkpoints", description: "Saved recovery checkpoints" },
  { id: "insights", label: "Insights", screen: "insights", section: "overview", description: "Usage and communication insights" },
] as const;

export const OBSOLETE_SCREEN_IDS = ["home", "dashboard", "messages", "archive", "resources", "integrations", "tasks", "customize", "templates", "saved-prompts"] as const;

export function isSameLocation(screen: ScreenId, section: ScreenSectionId | null, location: AppLocation): boolean {
  return screen === location.screen && (!location.section || section === location.section);
}
