export interface LocalProjectTask {
  id: string;
  project: string;
  text: string;
  completed: boolean;
}

export interface LocalProjectResource {
  id: string;
  project: string;
  label: string;
  content: string;
}

export interface LocalWorkspaceSnapshot {
  tasks: LocalProjectTask[];
  resources: LocalProjectResource[];
}

export interface SyntheticJobUnit {
  id: string;
  source: string;
  result: string | null;
  status: "pending" | "complete";
}

let workspace: LocalWorkspaceSnapshot = { tasks: [], resources: [] };
const subscribers = new Set<(snapshot: LocalWorkspaceSnapshot) => void>();

function notify(): void {
  const snapshot = getLocalWorkspace();
  for (const subscriber of subscribers) subscriber(snapshot);
}

export function subscribeLocalWorkspace(
  subscriber: (snapshot: LocalWorkspaceSnapshot) => void,
): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function getLocalWorkspace(): LocalWorkspaceSnapshot {
  return {
    tasks: workspace.tasks.map((task) => ({ ...task })),
    resources: workspace.resources.map((resource) => ({ ...resource })),
  };
}

export function restoreLocalWorkspace(value: unknown): LocalWorkspaceSnapshot {
  if (!value || typeof value !== "object") return getLocalWorkspace();
  const candidate = value as Partial<LocalWorkspaceSnapshot>;
  workspace = {
    tasks: Array.isArray(candidate.tasks)
      ? candidate.tasks.filter((task): task is LocalProjectTask =>
          Boolean(task) && typeof task.id === "string" && typeof task.project === "string" &&
          typeof task.text === "string" && typeof task.completed === "boolean")
      : [],
    resources: Array.isArray(candidate.resources)
      ? candidate.resources.filter((resource): resource is LocalProjectResource =>
          Boolean(resource) && typeof resource.id === "string" && typeof resource.project === "string" &&
          typeof resource.label === "string" && typeof resource.content === "string")
      : [],
  };
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function addLocalTask(project: string, text: string): LocalWorkspaceSnapshot {
  const cleanProject = project.trim() || "Local project";
  const cleanText = text.trim();
  if (!cleanText) return getLocalWorkspace();
  workspace.tasks.push({ id: id("task"), project: cleanProject, text: cleanText, completed: false });
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function toggleLocalTask(taskId: string): LocalWorkspaceSnapshot {
  workspace.tasks = workspace.tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task);
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function removeLocalTask(taskId: string): LocalWorkspaceSnapshot {
  workspace.tasks = workspace.tasks.filter((task) => task.id !== taskId);
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function addLocalResource(project: string, label: string, content: string): LocalWorkspaceSnapshot {
  const cleanProject = project.trim() || "Local project";
  const cleanLabel = label.trim();
  const cleanContent = content.trim();
  if (!cleanLabel || !cleanContent) return getLocalWorkspace();
  workspace.resources.push({ id: id("resource"), project: cleanProject, label: cleanLabel, content: cleanContent });
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function removeLocalResource(resourceId: string): LocalWorkspaceSnapshot {
  workspace.resources = workspace.resources.filter((resource) => resource.id !== resourceId);
  const snapshot = getLocalWorkspace();
  notify();
  return snapshot;
}

export function planSyntheticJob(source: string, batchSize: number): SyntheticJobUnit[] {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const size = Math.max(1, Math.min(25, Math.floor(batchSize) || 1));
  const units: SyntheticJobUnit[] = [];
  for (let index = 0; index < lines.length; index += size) {
    const chunk = lines.slice(index, index + size);
    units.push({
      id: `synthetic-${index / size + 1}`,
      source: chunk.join("\n"),
      result: null,
      status: "pending",
    });
  }
  return units;
}

export function runNextSyntheticBatch(units: SyntheticJobUnit[]): SyntheticJobUnit[] {
  let completed = false;
  return units.map((unit) => {
    if (completed || unit.status === "complete") return unit;
    completed = true;
    const items = unit.source.split(/\r?\n/).filter(Boolean);
    return {
      ...unit,
      status: "complete",
      result: `Local synthetic worker processed ${items.length} item${items.length === 1 ? "" : "s"}; no provider was called.`,
    };
  });
}
