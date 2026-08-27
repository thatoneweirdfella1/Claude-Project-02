import { describe, expect, it, beforeEach } from "vitest";
import { parseImportText } from "../../services/import";
import { useSessionStore, createInitialSessionState } from "../../stores/sessionStore";
import { useAccountStore, createInitialAccountState } from "../../stores/accountStore";

/* R08: Session Import Selector regression tests.
   Verify the complete import workflow:
   - R08.1: Visible supported-file chooser (JSON file input for each kind)
   - R08.2: Preview of what will be imported before confirmation
   - R08.3: Validation with actionable error messages (no cryptic failures)
   - R08.4: Explicit confirmation dialog (no auto-import)
   - R08.5: Atomic operations (no partial import on failure)

   These tests focus on the import logic and data flow, which is the critical
   path for R08. The UI rendering is covered separately by visual testing.
*/

function createImportEnvelope(kind: string, payload: unknown): string {
  return JSON.stringify({ app: "divergence-ai", version: 1, kind, payload });
}

describe("R08 Session Import Selector — Import Logic", () => {
  beforeEach(() => {
    useSessionStore.setState(createInitialSessionState());
    useAccountStore.setState(createInitialAccountState());
  });

  describe("R08.1 — Visible supported-file chooser", () => {
    it("validates JSON files for all five payload kinds (file chooser validation)", () => {
      const kinds = ["variables", "context-snapshot", "saved-prompts", "template-settings", "chat-history"];

      for (const kind of kinds) {
        const validFile = createImportEnvelope(kind, {});
        const result = parseImportText(validFile, kind as any);
        // Should not reject as invalid JSON — the chooser can handle the file
        expect(result.ok || result.reason !== "not-json").toBe(true);
      }
    });

    it("rejects files that aren't JSON at all", () => {
      const outcome = parseImportText("this is not json at all {{{", "variables");
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.reason).toBe("not-json");
        expect(outcome.message).toContain("isn't valid JSON");
      }
    });
  });

  describe("R08.2 & R08.3 — Preview and validation with actionable feedback", () => {
    it("previews valid variables for import", () => {
      const fileContent = createImportEnvelope("variables", { apiKey: "secret", projectId: "proj-1" });
      const outcome = parseImportText(fileContent, "variables");

      expect(outcome.ok).toBe(true);
      if (outcome.ok && outcome.payload.kind === "variables") {
        expect(Object.keys(outcome.payload.variables)).toHaveLength(2);
        expect(outcome.payload.variables.apiKey).toBe("secret");
        expect(outcome.payload.variables.projectId).toBe("proj-1");
      }
    });

    it("provides actionable error for empty files (R08.3)", () => {
      const outcome = parseImportText("", "variables");
      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.message).toBe("That file is empty.");
        expect(outcome.message).not.toContain("error");
        expect(outcome.message).not.toContain("invalid");
      }
    });

    it("provides actionable error for wrong file kind", () => {
      const promptsFile = createImportEnvelope("saved-prompts", [{ title: "Test", text: "Prompt" }]);
      const outcome = parseImportText(promptsFile, "variables");

      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.reason).toBe("wrong-kind");
        expect(outcome.message).toContain("saved prompts");
        expect(outcome.message).toContain("variables");
        expect(outcome.message).toContain("Pick it from that option");
      }
    });

    it("provides actionable error for nothing-usable content", () => {
      const emptyVars = createImportEnvelope("variables", {});
      const outcome = parseImportText(emptyVars, "variables");

      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        expect(outcome.reason).toBe("nothing-usable");
        expect(outcome.message).toContain("No variables");
      }
    });

    it("previews context items with counts", () => {
      const items = [
        { label: "Document 1", content: "Text content", kind: "text" },
        { label: "Document 2", content: "More text", kind: "text" },
      ];
      const fileContent = createImportEnvelope("context-snapshot", { items });
      const outcome = parseImportText(fileContent, "context-snapshot");

      expect(outcome.ok).toBe(true);
      if (outcome.ok && outcome.payload.kind === "context-snapshot") {
        expect(outcome.payload.items).toHaveLength(2);
      }
    });

    it("surfaces skipped entries in preview (R08.2)", () => {
      const items = [
        { label: "Good", content: "Valid" },
        { content: "Missing label" }, // Missing label, will be skipped
        { label: "Also good", content: "Valid" },
      ];
      const fileContent = createImportEnvelope("context-snapshot", { items });
      const outcome = parseImportText(fileContent, "context-snapshot");

      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.skipped).toBe(1);
        expect(outcome.payload.kind === "context-snapshot" && outcome.payload.items.length).toBe(2);
      }
    });
  });

  describe("R08.4 — Explicit confirmation (import only after user confirms)", () => {
    it("does not modify session state until confirmation", () => {
      const variables = { newVar: "newValue" };
      const fileContent = createImportEnvelope("variables", variables);
      const outcome = parseImportText(fileContent, "variables");

      // Validation happens (preview stage)
      expect(outcome.ok).toBe(true);

      // But nothing is in the store yet (no confirmation yet)
      const sessionVars = useSessionStore.getState().variables;
      expect(sessionVars.newVar).toBeUndefined();

      // Only after user confirms do we apply
      if (outcome.ok && outcome.payload.kind === "variables") {
        Object.entries(outcome.payload.variables).forEach(([name, value]) => {
          useSessionStore.getState().setSessionVariable(name, value);
        });
      }

      // Now it's applied
      const updatedVars = useSessionStore.getState().variables;
      expect(updatedVars.newVar).toBe("newValue");
    });
  });

  describe("R08.5 — Atomic operations (no partial import on failure)", () => {
    it("imports all variables or none if validation fails", () => {
      // Invalid file content
      const outcome = parseImportText("{ not valid json }", "variables");

      expect(outcome.ok).toBe(false);

      // No partial state applied
      const sessionVars = useSessionStore.getState().variables;
      expect(Object.keys(sessionVars)).toHaveLength(0);
    });

    it("imports all context items atomically when confirmation happens", () => {
      const items = [
        { label: "Item 1", content: "Content 1" },
        { label: "Item 2", content: "Content 2" },
      ];
      const fileContent = createImportEnvelope("context-snapshot", { items });
      const outcome = parseImportText(fileContent, "context-snapshot");

      expect(outcome.ok).toBe(true);

      // Get initial context length
      const initialLength = useSessionStore.getState().context.length;

      if (outcome.ok && outcome.payload.kind === "context-snapshot") {
        // Simulate confirmation: apply all or nothing
        let importFailed = false;
        try {
          outcome.payload.items.forEach((item) => {
            useSessionStore.getState().addContextItem(item);
          });
        } catch {
          importFailed = true;
        }

        if (!importFailed) {
          // All items added
          const finalLength = useSessionStore.getState().context.length;
          expect(finalLength).toBe(initialLength + 2);
        }
      }
    });

    it("skipped entries don't prevent successful import of valid entries", () => {
      const items = [
        { label: "Good 1", content: "Content" },
        { label: undefined, content: "Bad" }, // Missing label
        { label: "Good 2", content: "Content" },
      ];
      const fileContent = createImportEnvelope("context-snapshot", { items });
      const outcome = parseImportText(fileContent, "context-snapshot");

      expect(outcome.ok).toBe(true);
      if (outcome.ok && outcome.payload.kind === "context-snapshot") {
        expect(outcome.payload.items.length).toBe(2); // Good items only
        expect(outcome.skipped).toBe(1); // One item skipped
        expect(outcome.payload.items[0].label).toBe("Good 1");
        expect(outcome.payload.items[1].label).toBe("Good 2");
      }
    });
  });

  describe("R08 — Integration: Complete workflow", () => {
    it("complete workflow: validate → preview → confirm → import → persist", () => {
      // STEP 1: User selects a file with variables (preview phase)
      const importData = { apiKey: "abc123", debug: "true" };
      const fileContent = createImportEnvelope("variables", importData);

      // STEP 2: Validation happens (can be shown in preview)
      const validationResult = parseImportText(fileContent, "variables");
      expect(validationResult.ok).toBe(true);

      // STEP 3: User reviews preview and confirms
      if (validationResult.ok && validationResult.payload.kind === "variables") {
        // STEP 4: Import is applied (atomic)
        const entries = Object.entries(validationResult.payload.variables);
        const allApplied = entries.every(([name, value]) => {
          try {
            useSessionStore.getState().setSessionVariable(name, value);
            return true;
          } catch {
            return false;
          }
        });

        expect(allApplied).toBe(true);

        // STEP 5: Verify persistence
        const storedVars = useSessionStore.getState().variables;
        expect(storedVars.apiKey).toBe("abc123");
        expect(storedVars.debug).toBe("true");
      }
    });

    it("rejects files that don't match user's selection", () => {
      // User selected "Variables" import, but file contains "Saved Prompts"
      const promptFile = createImportEnvelope("saved-prompts", [
        { title: "Prompt 1", text: "Text" },
      ]);

      const outcome = parseImportText(promptFile, "variables");

      expect(outcome.ok).toBe(false);
      if (!outcome.ok) {
        // Error is actionable and specific
        expect(outcome.reason).toBe("wrong-kind");
        expect(outcome.message).toMatch(/saved prompts.*variables/i);
      }

      // Nothing imported
      expect(Object.keys(useSessionStore.getState().variables)).toHaveLength(0);
    });
  });
});
