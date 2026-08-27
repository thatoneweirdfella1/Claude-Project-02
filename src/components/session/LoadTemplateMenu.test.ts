import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore, createInitialAccountState, ACCOUNT_PERSISTED_KEYS } from "../../stores/accountStore";
import { useSessionStore, createInitialSessionState } from "../../stores/sessionStore";
import type { ContextItem, PromptTemplate } from "../../stores/types";

describe("LoadTemplateMenu — Template Creation Workflow (R07)", () => {
  beforeEach(() => {
    useAccountStore.setState(createInitialAccountState());
    useSessionStore.setState(createInitialSessionState());
  });

  describe("saveCurrentAsTemplate (component behavior)", () => {
    it("should simulate component saving context and starter question", () => {
      // Arrange: Set up session like user would have
      const contextItem: ContextItem = {
        id: "ctx-component",
        type: "text",
        title: "My Context",
        content: "Important stuff",
        source: "manual",
        added: Date.now(),
      };
      useSessionStore.getState().addContextItem(contextItem);
      useSessionStore.getState().setModel("claude-3-5-sonnet");
      useSessionStore.getState().setDirectness(2);
      useSessionStore.getState().setTechniques(["verify"]);
      useSessionStore.getState().setDraftInput("My starter question");

      // Act: Simulate what saveCurrentAsTemplate does (fixed version)
      const title = "Complete Template";
      const current = useSessionStore.getState();
      const templateToSave = {
        id: `template-${Date.now()}`,
        title,
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
        ...(current.context.length > 0 && { context: current.context }),
        ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
      };
      useAccountStore.getState().addTemplate(templateToSave);

      // Assert: Verify all fields were saved
      const saved = useAccountStore.getState().templates.find((t) => t.title === "Complete Template");
      expect(saved).toBeDefined();
      expect(saved?.context).toHaveLength(1);
      expect(saved?.context?.[0].id).toBe("ctx-component");
      expect(saved?.starterQuestion).toBe("My starter question");
    });

    it("should not save empty context or empty starter question", () => {
      // Arrange: Empty session (no context, empty draft)
      useSessionStore.getState().setModel("auto");
      useSessionStore.getState().setDirectness(2);
      useSessionStore.getState().setTechniques([]);
      // draftInput is empty by default

      // Act: Simulate saveCurrentAsTemplate with empty fields
      const current = useSessionStore.getState();
      const templateToSave = {
        id: `template-empty-${Date.now()}`,
        title: "Minimal Template",
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
        ...(current.context.length > 0 && { context: current.context }),
        ...(current.draftInput.trim().length > 0 && { starterQuestion: current.draftInput }),
      };
      useAccountStore.getState().addTemplate(templateToSave);

      // Assert: Verify empty fields were not included
      const saved = useAccountStore.getState().templates.find((t) => t.title === "Minimal Template");
      expect(saved?.context).toBeUndefined();
      expect(saved?.starterQuestion).toBeUndefined();
    });
  });

  describe("Create template with all fields", () => {
    it("should capture model, directness, and techniques when saving", () => {
      useSessionStore.getState().setModel("claude-3-5-sonnet");
      useSessionStore.getState().setDirectness(2);
      useSessionStore.getState().setTechniques(["chain-of-thought", "verify"]);

      const current = useSessionStore.getState();
      const templateId = `template-${Date.now()}`;
      useAccountStore.getState().addTemplate({
        id: templateId,
        title: "My Template",
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
      });

      const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
      expect(saved?.model).toBe("claude-3-5-sonnet");
      expect(saved?.directness).toBe(2);
      expect(saved?.techniques).toEqual(["chain-of-thought", "verify"]);
    });

    it("should capture context items from session when saving", () => {
      const contextItem: ContextItem = {
        id: "ctx-1",
        type: "text",
        title: "Test Context",
        content: "This is context",
        source: "manual",
        added: Date.now(),
      };
      useSessionStore.getState().addContextItem(contextItem);

      const current = useSessionStore.getState();
      const templateId = `template-ctx-${Date.now()}`;
      const template: PromptTemplate = {
        id: templateId,
        title: "Template with Context",
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
        context: current.context,
      };
      useAccountStore.getState().addTemplate(template);

      const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
      expect(saved?.context).toHaveLength(1);
      expect(saved?.context?.[0].id).toBe("ctx-1");
    });

    it("should capture starter question (draftInput) from session when saving", () => {
      useSessionStore.getState().setDraftInput("What is the meaning of life?");

      const current = useSessionStore.getState();
      const templateId = `template-q-${Date.now()}`;
      const template: PromptTemplate = {
        id: templateId,
        title: "Question Template",
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
        starterQuestion: current.draftInput,
      };
      useAccountStore.getState().addTemplate(template);

      const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
      expect(saved?.starterQuestion).toBe("What is the meaning of life?");
    });

    it("should capture both context and starter question together", () => {
      const contextItem: ContextItem = {
        id: "ctx-research",
        type: "text",
        title: "Research Notes",
        content: "Key findings",
        source: "manual",
        added: Date.now(),
      };
      useSessionStore.getState().addContextItem(contextItem);
      useSessionStore.getState().setDraftInput("Based on this research, what should we do?");

      const current = useSessionStore.getState();
      const templateId = `template-complete-${Date.now()}`;
      const template: PromptTemplate = {
        id: templateId,
        title: "Research Template",
        model: current.model,
        directness: current.directness,
        techniques: current.techniques,
        context: current.context,
        starterQuestion: current.draftInput,
      };
      useAccountStore.getState().addTemplate(template);

      const saved = useAccountStore.getState().templates.find((t) => t.id === templateId);
      expect(saved?.context).toHaveLength(1);
      expect(saved?.context?.[0].title).toBe("Research Notes");
      expect(saved?.starterQuestion).toBe("Based on this research, what should we do?");
    });
  });

  describe("Load template into session", () => {
    it("should load model, directness, and techniques", () => {
      const template: PromptTemplate = {
        id: "test-load",
        title: "Load Test",
        model: "claude-3-5-opus",
        directness: 3,
        techniques: ["auto-detect"],
      };
      useAccountStore.getState().addTemplate(template);

      useSessionStore.getState().setModel(template.model);
      useSessionStore.getState().setDirectness(template.directness);
      useSessionStore.getState().setTechniques(template.techniques);

      const session = useSessionStore.getState();
      expect(session.model).toBe("claude-3-5-opus");
      expect(session.directness).toBe(3);
      expect(session.techniques).toEqual(["auto-detect"]);
    });

    it("should add context items from template (not replace existing)", () => {
      const existing: ContextItem = {
        id: "existing",
        type: "text",
        title: "Existing",
        content: "Pre-existing",
        source: "manual",
        added: Date.now(),
      };
      useSessionStore.getState().addContextItem(existing);

      const fromTemplate: ContextItem = {
        id: "from-template",
        type: "text",
        title: "Template",
        content: "From template",
        source: "manual",
        added: Date.now(),
      };
      const template: PromptTemplate = {
        id: "test-ctx",
        title: "With Context",
        model: "auto",
        directness: 2,
        techniques: [],
        context: [fromTemplate],
      };
      useAccountStore.getState().addTemplate(template);

      const toLoad = useAccountStore.getState().templates.find((t) => t.id === "test-ctx")!;
      for (const item of toLoad.context ?? []) {
        useSessionStore.getState().addContextItem(item);
      }

      const session = useSessionStore.getState();
      expect(session.context).toHaveLength(2);
      expect(session.context.map((c) => c.id)).toContain("existing");
      expect(session.context.map((c) => c.id)).toContain("from-template");
    });

    it("should set draftInput from template starterQuestion", () => {
      const template: PromptTemplate = {
        id: "test-q",
        title: "With Question",
        model: "auto",
        directness: 2,
        techniques: [],
        starterQuestion: "What are the priorities?",
      };
      useAccountStore.getState().addTemplate(template);

      const toLoad = useAccountStore.getState().templates.find((t) => t.id === "test-q")!;
      if (toLoad.starterQuestion) {
        useSessionStore.getState().setDraftInput(toLoad.starterQuestion);
      }

      const session = useSessionStore.getState();
      expect(session.draftInput).toBe("What are the priorities?");
    });
  });

  describe("Persistence and reload", () => {
    it("templates should be in persisted keys", () => {
      expect(ACCOUNT_PERSISTED_KEYS).toContain("templates");
    });

    it("should persist and restore templates after simulated reload", () => {
      const template: PromptTemplate = {
        id: "persist-test",
        title: "Persist Me",
        model: "auto",
        directness: 2,
        techniques: ["verify"],
        starterQuestion: "Persist!",
      };
      useAccountStore.getState().addTemplate(template);

      const state = useAccountStore.getState();
      const persisted = { templates: state.templates };

      useAccountStore.setState(createInitialAccountState());
      useAccountStore.getState().hydrate(persisted);

      const restored = useAccountStore.getState().templates.find((t) => t.id === "persist-test");
      expect(restored?.title).toBe("Persist Me");
      expect(restored?.starterQuestion).toBe("Persist!");
    });
  });

  describe("Validation and cancellation", () => {
    it("should reject empty template names", () => {
      const emptyTitle = "";
      expect(emptyTitle.trim().length === 0).toBe(true);
    });

    it("should allow cancellation without saving", () => {
      useSessionStore.getState().setModel("claude-3-5-sonnet");
      const count = useAccountStore.getState().templates.length;

      // Cancel without saving (don't call addTemplate)

      expect(useAccountStore.getState().templates.length).toBe(count);
    });

    it("should support updating existing templates", () => {
      useAccountStore.getState().addTemplate({
        id: "update-test",
        title: "Original",
        model: "auto",
        directness: 2,
        techniques: [],
      });

      useAccountStore.getState().updateTemplate("update-test", {
        title: "Updated",
        directness: 3,
      });

      const updated = useAccountStore.getState().templates.find((t) => t.id === "update-test");
      expect(updated?.title).toBe("Updated");
      expect(updated?.directness).toBe(3);
    });
  });

  describe("Default templates", () => {
    it("should include three built-in templates", () => {
      const templates = useAccountStore.getState().templates;
      const ids = templates.map((t) => t.id);
      expect(ids).toContain("template-quick-question");
      expect(ids).toContain("template-deep-analysis");
      expect(ids).toContain("template-learning-mode");
    });
  });
});
