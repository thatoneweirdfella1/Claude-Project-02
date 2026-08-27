import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore, createInitialAccountState } from "../../stores/accountStore";
import { useSessionStore, createInitialSessionState } from "../../stores/sessionStore";
import type { ContextItem } from "../../stores/types";

/**
 * Integration test for R07: Create Template
 *
 * Verifies the complete user workflow:
 * 1. Create a template with context and starter question
 * 2. Validate it saves correctly
 * 3. Reload (simulate persistence)
 * 4. Load the template back into a fresh session
 * 5. Verify all fields are restored
 */
describe("R07 Template Workflow — End-to-End Integration", () => {
  beforeEach(() => {
    useAccountStore.setState(createInitialAccountState());
    useSessionStore.setState(createInitialSessionState());
  });

  it("complete template lifecycle: create, save, reload, load, verify", () => {
    // Step 1: USER CREATES CONTENT IN SESSION
    // - Sets model and directness
    useSessionStore.getState().setModel("claude-3-5-sonnet");
    useSessionStore.getState().setDirectness(2);
    useSessionStore.getState().setTechniques(["chain-of-thought", "verify"]);

    // - Adds context
    const contextItem: ContextItem = {
      id: "research-notes",
      type: "text",
      title: "Research Document",
      content: "Key findings from user research",
      source: "manual",
      added: Date.now(),
    };
    useSessionStore.getState().addContextItem(contextItem);

    // - Types a starter question
    useSessionStore.getState().setDraftInput("Based on this research, what are our next steps?");

    // Step 2: USER SAVES THIS AS A TEMPLATE
    const templateName = "Research Analysis";
    const current = useSessionStore.getState();

    // Simulate saveCurrentAsTemplate() function behavior
    const templateId = `template-${Date.now()}-workflow`;
    const templateToSave = {
      id: templateId,
      title: templateName,
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      ...(current.context.length > 0 && { context: current.context }),
      ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
    };

    useAccountStore.getState().addTemplate(templateToSave);

    // Step 3: VERIFY TEMPLATE WAS SAVED WITH ALL FIELDS
    let savedTemplate = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(savedTemplate).toBeDefined();
    expect(savedTemplate?.title).toBe("Research Analysis");
    expect(savedTemplate?.model).toBe("claude-3-5-sonnet");
    expect(savedTemplate?.directness).toBe(2);
    expect(savedTemplate?.techniques).toEqual(["chain-of-thought", "verify"]);
    expect(savedTemplate?.context).toHaveLength(1);
    expect(savedTemplate?.context?.[0].title).toBe("Research Document");
    expect(savedTemplate?.starterQuestion).toBe("Based on this research, what are our next steps?");

    // Step 4: SIMULATE BROWSER RELOAD
    // User closes browser and comes back later
    const persistedAccountState = {
      templates: useAccountStore.getState().templates,
    };

    // Fresh store state
    useAccountStore.setState(createInitialAccountState());
    useSessionStore.setState(createInitialSessionState());

    // Restore from persistence
    useAccountStore.getState().hydrate(persistedAccountState);

    // Step 5: VERIFY TEMPLATE REDISCOVERED AFTER RELOAD
    savedTemplate = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(savedTemplate).toBeDefined();
    expect(savedTemplate?.title).toBe("Research Analysis");
    expect(savedTemplate?.starterQuestion).toBe("Based on this research, what are our next steps?");

    // Step 6: USER LOADS THE TEMPLATE INTO A NEW SESSION
    const templateToLoad = useAccountStore.getState().templates.find((t) => t.id === templateId)!;

    // Simulate loadTemplate() function behavior
    useSessionStore.getState().setModel(templateToLoad.model);
    useSessionStore.getState().setDirectness(templateToLoad.directness);
    useSessionStore.getState().setTechniques(templateToLoad.techniques);

    // Add context items from template (don't replace existing)
    for (const item of templateToLoad.context ?? []) {
      useSessionStore.getState().addContextItem(item);
    }

    // Set starter question as draft input
    if (templateToLoad.starterQuestion) {
      useSessionStore.getState().setDraftInput(templateToLoad.starterQuestion);
    }

    // Step 7: VERIFY SESSION HAS ALL TEMPLATE CONTENT
    const loadedSession = useSessionStore.getState();
    expect(loadedSession.model).toBe("claude-3-5-sonnet");
    expect(loadedSession.directness).toBe(2);
    expect(loadedSession.techniques).toEqual(["chain-of-thought", "verify"]);
    expect(loadedSession.context).toHaveLength(1);
    expect(loadedSession.context[0].title).toBe("Research Document");
    expect(loadedSession.context[0].content).toBe("Key findings from user research");
    expect(loadedSession.draftInput).toBe("Based on this research, what are our next steps?");

    // Step 8: USER CAN EDIT LOADED TEMPLATE (optional)
    // updateTemplate supports updating any field
    useAccountStore.getState().updateTemplate(templateId, {
      title: "Updated Research Template",
      directness: 3,
    });

    const updated = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(updated?.title).toBe("Updated Research Template");
    expect(updated?.directness).toBe(3);
    // Context and starter question remain unchanged
    expect(updated?.context).toHaveLength(1);
    expect(updated?.starterQuestion).toBe("Based on this research, what are our next steps?");

    // Step 9: USER CAN DELETE TEMPLATE (via UI guard on default templates)
    useAccountStore.getState().removeTemplate(templateId);
    const removed = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(removed).toBeUndefined();
  });

  it("templates with only settings (no context or question) work correctly", () => {
    // User might save just model/directness/techniques without context
    useSessionStore.getState().setModel("claude-3-5-opus");
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().setTechniques(["auto-detect"]);
    // No context added
    // No draft input

    const current = useSessionStore.getState();
    const templateId = `template-minimal-${Date.now()}`;
    const template = {
      id: templateId,
      title: "Quick Settings",
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      ...(current.context.length > 0 && { context: current.context }),
      ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
    };

    useAccountStore.getState().addTemplate(template);

    const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(saved?.model).toBe("claude-3-5-opus");
    expect(saved?.directness).toBe(3);
    // These should be undefined/not set because they were empty
    expect(saved?.context).toBeUndefined();
    expect(saved?.starterQuestion).toBeUndefined();
  });

  it("template with only context (no question) works", () => {
    const contextItem: ContextItem = {
      id: "ctx-only",
      type: "text",
      title: "Knowledge Base",
      content: "Important reference",
      source: "manual",
      added: Date.now(),
    };
    useSessionStore.getState().addContextItem(contextItem);
    useSessionStore.getState().setModel("auto");
    useSessionStore.getState().setDirectness(2);
    // No draft input

    const current = useSessionStore.getState();
    const templateId = `template-ctx-only-${Date.now()}`;
    const template = {
      id: templateId,
      title: "Context Only",
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      ...(current.context.length > 0 && { context: current.context }),
      ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
    };

    useAccountStore.getState().addTemplate(template);

    const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(saved?.context).toHaveLength(1);
    expect(saved?.context?.[0].title).toBe("Knowledge Base");
    // Should not have question
    expect(saved?.starterQuestion).toBeUndefined();
  });

  it("template with only question (no context) works", () => {
    useSessionStore.getState().setModel("auto");
    useSessionStore.getState().setDirectness(2);
    useSessionStore.getState().setDraftInput("What should we do?");
    // No context added

    const current = useSessionStore.getState();
    const templateId = `template-q-only-${Date.now()}`;
    const template = {
      id: templateId,
      title: "Question Only",
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
      ...(current.context.length > 0 && { context: current.context }),
      ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
    };

    useAccountStore.getState().addTemplate(template);

    const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
    expect(saved?.starterQuestion).toBe("What should we do?");
    // Should not have context
    expect(saved?.context).toBeUndefined();
  });
});
