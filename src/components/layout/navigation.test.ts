import { describe, expect, it } from "vitest";
import { OBSOLETE_SCREEN_IDS, PRIMARY_NAVIGATION, QUICK_TOOL_NAVIGATION, TOOL_NAVIGATION } from "./navigation";

const allNavigation = [...PRIMARY_NAVIGATION, ...TOOL_NAVIGATION, ...QUICK_TOOL_NAVIGATION];

describe("canonical whole-site navigation", () => {
  it("contains each approved primary destination exactly once", () => {
    expect(PRIMARY_NAVIGATION.map((entry) => entry.label)).toEqual([
      "Talk to AI", "Sessions", "Saved Tools", "Projects", "Insights", "Settings",
    ]);
    expect(new Set(PRIMARY_NAVIGATION.map((entry) => entry.id)).size).toBe(PRIMARY_NAVIGATION.length);
  });

  it("never exposes an obsolete duplicate screen", () => {
    expect(allNavigation.filter((entry) => (OBSOLETE_SCREEN_IDS as readonly string[]).includes(entry.screen))).toEqual([]);
  });

  it("routes semantically exact tool destinations", () => {
    expect(TOOL_NAVIGATION.find((entry) => entry.id === "connections")).toMatchObject({ screen: "settings", section: "connections" });
    expect(TOOL_NAVIGATION.find((entry) => entry.id === "templates")).toMatchObject({ screen: "saved-tools", section: "templates" });
    expect(TOOL_NAVIGATION.find((entry) => entry.id === "saved-prompts")).toMatchObject({ screen: "saved-tools", section: "saved-prompts" });
    expect(QUICK_TOOL_NAVIGATION.find((entry) => entry.id === "insights")).toMatchObject({ screen: "insights", section: "overview" });
    expect(TOOL_NAVIGATION.find((entry) => entry.id === "large-jobs")).toMatchObject({ screen: "large-jobs" });
  });
});
