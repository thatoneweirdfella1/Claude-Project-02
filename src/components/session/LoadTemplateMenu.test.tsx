import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState } from "../../stores/accountStore";
import { createInitialSessionState } from "../../stores/sessionStore";
import type { ContextItem, PromptTemplate } from "../../stores/types";

describe("LoadTemplateMenu — template save/load workflow", () => {
  beforeEach(() => {
    useAccountStore.setState(createInitialAccountState());
    useSessionStore.setState(createInitialSessionState());
  });

  it("should save template with starter question and context", () => {
    const testContext: ContextItem = {
      id: "ctx-1",
      type: "text",
      title: "Test context",
      content: "This is test context",
      bytes: 100,
      removable: true,
    };

    // Set up session state with context and starter question
    useSessionStore.setState({
      context: [testContext],
      draftInput: "What is the meaning of life?",
      model: "claude-opus-4-8",
      directness: "detailed",
    });

    const current = useSessionStore.getState();
    expect(current.context).toHaveLength(1);
    expect(current.draftInput).toBe("What is the meaning of life?");

    // Simulate template save from current session (with the fixed logic)
    const template: PromptTemplate = {
      id: `template-${Date.now()}`,
      title: "Philosophy Template",
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      context: current.context.length > 0 ? current.context : undefined,
      starterQuestion: current.draftInput.trim().length > 0 ? current.draftInput : undefined,
    };

    useAccountStore.getState().addTemplate(template);

    // Verify template was saved with full data (find by title since defaults exist)
    const templates = useAccountStore.getState().templates;
    const savedTemplate = templates.find((t) => t.title === "Philosophy Template");
    expect(savedTemplate).toBeDefined();
    expect(savedTemplate!.title).toBe("Philosophy Template");
    expect(savedTemplate!.model).toBe("claude-opus-4-8");
    expect(savedTemplate!.directness).toBe("detailed");
    expect(savedTemplate!.context).toHaveLength(1);
    expect(savedTemplate!.context![0]).toMatchObject({ id: "ctx-1", title: "Test context" });
    expect(savedTemplate!.starterQuestion).toBe("What is the meaning of life?");
  });

  it("should load template with starter question and context back into session", () => {
    const testContext: ContextItem = {
      id: "ctx-2",
      type: "text",
      title: "Philosophy notes",
      content: "Ancient Greek thought",
      bytes: 200,
      removable: true,
    };

    const template: PromptTemplate = {
      id: "template-phil",
      title: "Philosophy Template",
      model: "claude-opus-4-8",
      directness: "detailed",
      techniques: ["reasoning", "examples"],
      context: [testContext],
      starterQuestion: "Analyze Plato's theory",
    };

    useAccountStore.setState({ templates: [template] });

    // Simulate loading the template
    const sessionState = useSessionStore.getState();
    const loaded = useAccountStore.getState().templates[0]!;
    sessionState.setModel(loaded.model);
    sessionState.setDirectness(loaded.directness);
    sessionState.setTechniques(loaded.techniques);
    if (loaded.context) {
      for (const item of loaded.context) {
        sessionState.addContextItem(item);
      }
    }
    if (loaded.starterQuestion) {
      sessionState.setDraftInput(loaded.starterQuestion);
    }

    // Verify everything was loaded correctly
    const afterLoad = useSessionStore.getState();
    expect(afterLoad.model).toBe("claude-opus-4-8");
    expect(afterLoad.directness).toBe("detailed");
    expect(afterLoad.context).toHaveLength(1);
    expect(afterLoad.context[0]).toMatchObject({ id: "ctx-2", title: "Philosophy notes" });
    expect(afterLoad.draftInput).toBe("Analyze Plato's theory");
  });

  it("should handle empty context and starter question gracefully", () => {
    useSessionStore.setState({ context: [], draftInput: "" });
    const current = useSessionStore.getState();

    // Save with empty context/starter
    const template: PromptTemplate = {
      id: `template-minimal-${Date.now()}`,
      title: "Minimal Template",
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      context: current.context.length > 0 ? current.context : undefined,
      starterQuestion: current.draftInput.trim().length > 0 ? current.draftInput : undefined,
    };

    useAccountStore.getState().addTemplate(template);

    const saved = useAccountStore.getState().templates[0];
    expect(saved).toBeDefined();
    expect(saved!.context).toBeUndefined();
    expect(saved!.starterQuestion).toBeUndefined();
  });
});
