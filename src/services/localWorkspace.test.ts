import { afterEach, describe, expect, it } from "vitest";
import {
  createLocalProject,
  getLocalWorkspace,
  restoreLocalWorkspace,
  addLocalTask,
} from "./localWorkspace";

/* R17 second-pass correction: a project's existence was previously derived
   entirely from session tags / tasks / resources — there was no way to
   create an EMPTY project (nothing assigned to it yet) that survived
   anything, including a reload. createLocalProject() is the fix: a real,
   independently-persisted project name, round-tripped the same way tasks
   and resources already are (restoreLocalWorkspace / the durable IndexedDB
   layer in durableLayer4.ts, unchanged here). */

afterEach(() => {
  restoreLocalWorkspace({ tasks: [], resources: [], syntheticJobs: [], projects: [] });
});

describe("R17: createLocalProject", () => {
  it("adds a brand-new project name with nothing assigned to it", () => {
    const snapshot = createLocalProject("Kitchen Remodel");
    expect(snapshot.projects).toContain("Kitchen Remodel");
    expect(getLocalWorkspace().projects).toContain("Kitchen Remodel");
  });

  it("trims whitespace and ignores an empty/whitespace-only name", () => {
    const snapshot = createLocalProject("  Padded Name  ");
    expect(snapshot.projects).toContain("Padded Name");
    expect(snapshot.projects).not.toContain("  Padded Name  ");

    const before = getLocalWorkspace().projects.length;
    createLocalProject("   ");
    expect(getLocalWorkspace().projects.length).toBe(before);
  });

  it("is idempotent — creating the same name (case-insensitively) twice never duplicates it", () => {
    createLocalProject("Website Redesign");
    createLocalProject("website redesign");
    createLocalProject("WEBSITE REDESIGN");
    const matches = getLocalWorkspace().projects.filter((name) => name.toLowerCase() === "website redesign");
    expect(matches.length).toBe(1);
  });

  it("survives a restore round-trip — the same durable path tasks/resources already use", () => {
    createLocalProject("Durable Project");
    const persisted = getLocalWorkspace();

    // Simulate a reload: a fresh module-level restore from whatever the
    // durability layer last saved (durableLayer4.ts's loadDurableWorkspace).
    const restored = restoreLocalWorkspace(persisted);
    expect(restored.projects).toContain("Durable Project");
    expect(getLocalWorkspace().projects).toContain("Durable Project");
  });

  it("restoring an old snapshot with no projects field at all defaults to an empty list, never a crash", () => {
    const restored = restoreLocalWorkspace({ tasks: [], resources: [], syntheticJobs: [] });
    expect(restored.projects).toEqual([]);
  });

  it("a project that already has a task assigned can still be created explicitly and stays a single entry", () => {
    addLocalTask("Existing Project", "first task");
    createLocalProject("Existing Project");
    const matches = getLocalWorkspace().projects.filter((name) => name === "Existing Project");
    expect(matches.length).toBe(1);
  });
});
