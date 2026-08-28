import { beforeEach, describe, expect, it } from "vitest";
import { createInitialSessionState, SESSION_PERSISTED_KEYS, useSessionStore } from "./sessionStore";
import type { ConversationMessage, ContextItem, SessionRecord } from "./types";

/* Step 12.1 — direct unit tests for sessionStore's own actions. Other test
   files (persistence.test.ts, sessionLifecycle.test.ts) exercise several of
   these actions incidentally as a side effect of testing something else
   (round-tripping through IndexedDB, buildSessionRecord); this file is the
   one place each action's own state transition — defaults, edge cases,
   which fields it does and doesn't touch — is verified directly. */

function resetStore() {
  useSessionStore.setState(createInitialSessionState());
}

beforeEach(resetStore);

const MESSAGE: ConversationMessage = {
  id: "m1",
  role: "user",
  content: "what is the boiling point of water",
  timestamp: 1000,
  messageState: "sent", // R19: explicit message state
};

const CONTEXT_ITEM: ContextItem = {
  id: "c1",
  kind: "text",
  label: "notes.txt",
  content: "some notes",
  bytes: 42,
};

const SESSION_RECORD: SessionRecord = {
  id: "r1",
  createdAt: 500,
  archived: false,
  status: "active",
  tag: "Recovered work",
  model: "claude-opus-4-8",
  directness: 3,
  techniques: ["chain-of-thought"],
  context: [CONTEXT_ITEM],
  variables: { project: "Divergence" },
  conversation: [MESSAGE],
  draftInput: "unfinished",
  draftSelectionStart: 2,
  draftSelectionEnd: 6,
  conversationScrollTop: 88,
  paidFallbackEnabled: true,
  maxRequestCost: 0.5,
  statePills: { emotion: "calm", rsd: "low", interest: "high", cognitive: "analytical" },
  methodology: "3-state",
  methodologyPhase: "test",
  lockedProblemStatement: "Keep the work",
};

describe("createInitialSessionState", () => {
  it("matches CANON's documented defaults", () => {
    const state = createInitialSessionState();
    expect(state.sessionId).not.toBe("");
    expect(state.sessionCreatedAt).toBeGreaterThan(0);
    expect(state.sessionTitle).toBe("");
    expect(state.draftInput).toBe("");
    expect(state.draftSelectionStart).toBe(0);
    expect(state.draftSelectionEnd).toBe(0);
    expect(state.conversationScrollTop).toBe(0);
    expect(state.model).toBe("auto");
    expect(state.destination).toEqual({ providerId: "universal", modelId: "universal" });
    expect(state.translatorEngine).toBe("auto-free-first");
    expect(state.reviewBeforeSend).toBe(true);
    expect(state.directness).toBe(2);
    expect(state.techniques).toEqual(["auto-detect"]);
    expect(state.context).toEqual([]);
    expect(state.conversation).toEqual([]);
    expect(state.statePills).toEqual({ emotion: null, rsd: null, interest: null, cognitive: null });
    expect(state.variables).toEqual({});
    expect(state.currentScreen).toBe("translate");
  });

  it("returns fresh array/object instances each call, no shared references", () => {
    const a = createInitialSessionState();
    const b = createInitialSessionState();
    expect(a.techniques).not.toBe(b.techniques);
    expect(a.context).not.toBe(b.context);
    expect(a.statePills).not.toBe(b.statePills);
    a.techniques.push("verify");
    expect(b.techniques).toEqual(["auto-detect"]);
  });
});

describe("SESSION_PERSISTED_KEYS", () => {
  it("persists every documented session field", () => {
    expect([...SESSION_PERSISTED_KEYS].sort()).toEqual(
      [
        "draftInput",
        "sessionId",
        "sessionCreatedAt",
        "sessionTitle",
        "draftSelectionStart",
        "draftSelectionEnd",
        "conversationScrollTop",
        "model",
        "destination",
        "translatorEngine",
        "reviewBeforeSend",
        "directness",
        "techniques",
        "context",
        "conversation",
        "statePills",
        "variables",
        "currentScreen",
        "currentSection",
        "methodology",
        "methodologyPhase",
        "lockedProblemStatement",
        "maxRequestCost",
        "paidFallbackEnabled",
        "multiAiRuns",
      ].sort(),
    );
  });
});

describe("plain setters", () => {
  it("plain settings setters update their fields and draft input moves the caret to the end", () => {
    useSessionStore.getState().setDraftInput("hello");
    useSessionStore.getState().setModel("claude-sonnet-5");
    useSessionStore.getState().setDirectness(1);
    useSessionStore.getState().setTechniques(["socratic", "examples"]);

    const s = useSessionStore.getState();
    expect(s.draftInput).toBe("hello");
    expect(s.draftSelectionStart).toBe(5);
    expect(s.draftSelectionEnd).toBe(5);
    expect(s.model).toBe("claude-sonnet-5");
    expect(s.directness).toBe(1);
    expect(s.techniques).toEqual(["socratic", "examples"]);
  });

  it("setCurrentScreen navigates", () => {
    useSessionStore.getState().setScreenLocation("sessions", "archived");
    expect(useSessionStore.getState().currentScreen).toBe("sessions");
    expect(useSessionStore.getState().currentSection).toBe("archived");
  });

  it("setStatePills replaces the whole reading", () => {
    useSessionStore.getState().setStatePills({
      emotion: "calm",
      rsd: "low",
      interest: "high",
      cognitive: "analytical",
    });
    expect(useSessionStore.getState().statePills).toEqual({
      emotion: "calm",
      rsd: "low",
      interest: "high",
      cognitive: "analytical",
    });
  });
});

describe("context items", () => {
  it("addContextItem appends", () => {
    useSessionStore.getState().addContextItem(CONTEXT_ITEM);
    useSessionStore.getState().addContextItem({ ...CONTEXT_ITEM, id: "c2" });
    expect(useSessionStore.getState().context.map((c) => c.id)).toEqual(["c1", "c2"]);
  });

  it("removeContextItem removes only the matching id", () => {
    useSessionStore.getState().addContextItem(CONTEXT_ITEM);
    useSessionStore.getState().addContextItem({ ...CONTEXT_ITEM, id: "c2" });
    useSessionStore.getState().removeContextItem("c1");
    expect(useSessionStore.getState().context.map((c) => c.id)).toEqual(["c2"]);
  });

  it("removeContextItem on a nonexistent id is a harmless no-op", () => {
    useSessionStore.getState().addContextItem(CONTEXT_ITEM);
    useSessionStore.getState().removeContextItem("nope");
    expect(useSessionStore.getState().context).toHaveLength(1);
  });
});

describe("conversation", () => {
  it("addMessage appends in call order", () => {
    useSessionStore.getState().addMessage(MESSAGE);
    useSessionStore.getState().addMessage({ ...MESSAGE, id: "m2", role: "assistant" });
    expect(useSessionStore.getState().conversation.map((m) => m.id)).toEqual(["m1", "m2"]);
  });
});

describe("session variables", () => {
  it("setSessionVariable creates and updates without touching other keys", () => {
    useSessionStore.getState().setSessionVariable("a", "1");
    useSessionStore.getState().setSessionVariable("b", "2");
    useSessionStore.getState().setSessionVariable("a", "updated");
    expect(useSessionStore.getState().variables).toEqual({ a: "updated", b: "2" });
  });

  it("removeSessionVariable removes only the named key, immutably", () => {
    useSessionStore.getState().setSessionVariable("a", "1");
    useSessionStore.getState().setSessionVariable("b", "2");
    const before = useSessionStore.getState().variables;
    useSessionStore.getState().removeSessionVariable("a");
    expect(useSessionStore.getState().variables).toEqual({ b: "2" });
    expect(useSessionStore.getState().variables).not.toBe(before); // new object, not mutated in place
  });

  it("removeSessionVariable on a nonexistent key is a harmless no-op", () => {
    useSessionStore.getState().setSessionVariable("a", "1");
    useSessionStore.getState().removeSessionVariable("nope");
    expect(useSessionStore.getState().variables).toEqual({ a: "1" });
  });
});

describe("setMessageRating", () => {
  beforeEach(() => {
    useSessionStore.getState().addMessage({ ...MESSAGE, role: "assistant", confidence: 90 });
  });

  it("sets ratingStars", () => {
    useSessionStore.getState().setMessageRating("m1", 4);
    expect(useSessionStore.getState().conversation[0].ratingStars).toBe(4);
  });

  it("sets ratingComment when provided", () => {
    useSessionStore.getState().setMessageRating("m1", 5, "great answer");
    const msg = useSessionStore.getState().conversation[0];
    expect(msg.ratingStars).toBe(5);
    expect(msg.ratingComment).toBe("great answer");
  });

  it("re-rating with just a star does not erase a previously-saved comment", () => {
    useSessionStore.getState().setMessageRating("m1", 5, "great answer");
    useSessionStore.getState().setMessageRating("m1", 3);
    const msg = useSessionStore.getState().conversation[0];
    expect(msg.ratingStars).toBe(3);
    expect(msg.ratingComment).toBe("great answer"); // untouched — comment was undefined this call
  });

  it("is a no-op for a message id that doesn't exist", () => {
    useSessionStore.getState().setMessageRating("nope", 5);
    expect(useSessionStore.getState().conversation[0].ratingStars).toBeUndefined();
  });

  it("only mutates the targeted message, leaving siblings untouched", () => {
    useSessionStore.getState().addMessage({ ...MESSAGE, id: "m2", role: "assistant", confidence: 80 });
    useSessionStore.getState().setMessageRating("m2", 2);
    const [first, second] = useSessionStore.getState().conversation;
    expect(first.ratingStars).toBeUndefined();
    expect(second.ratingStars).toBe(2);
  });
});

describe("resetSession", () => {
  it("clears every field, including model/directness/techniques/currentScreen, to fresh defaults", () => {
    useSessionStore.getState().setModel("claude-opus-4-8");
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().setTechniques(["verify"]);
    useSessionStore.getState().setScreenLocation("sessions", "archived");
    useSessionStore.getState().addMessage(MESSAGE);
    useSessionStore.getState().addContextItem(CONTEXT_ITEM);
    useSessionStore.getState().setSessionVariable("a", "1");
    useSessionStore.getState().setDraftInput("mid sentence");

    useSessionStore.getState().resetSession();

    const s = useSessionStore.getState();
    expect(s.model).toBe("auto");
    expect(s.directness).toBe(2);
    expect(s.techniques).toEqual(["auto-detect"]);
    expect(s.currentScreen).toBe("translate");
    expect(s.conversation).toEqual([]);
    expect(s.context).toEqual([]);
    expect(s.variables).toEqual({});
    expect(s.draftInput).toBe("");
  });
});

describe("newSession", () => {
  it("clears conversation/context/variables/statePills/draftInput but keeps model/directness/techniques/currentScreen", () => {
    useSessionStore.getState().setModel("claude-opus-4-8");
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().setTechniques(["verify"]);
    useSessionStore.getState().setScreenLocation("sessions", "archived");
    useSessionStore.getState().addMessage(MESSAGE);
    useSessionStore.getState().addContextItem(CONTEXT_ITEM);
    useSessionStore.getState().setSessionVariable("a", "1");
    useSessionStore.getState().setDraftInput("mid sentence");
    useSessionStore.getState().setStatePills({ emotion: "calm", rsd: null, interest: null, cognitive: null });

    const previousId = useSessionStore.getState().sessionId;
    useSessionStore.getState().newSession();

    const s = useSessionStore.getState();
    // Kept — CANON Feature 11: "New Session (fresh conversation, keeps settings...)"
    expect(s.model).toBe("claude-opus-4-8");
    expect(s.directness).toBe(3);
    expect(s.techniques).toEqual(["verify"]);
    expect(s.currentScreen).toBe("sessions");
    expect(s.currentSection).toBe("archived");
    expect(s.sessionId).not.toBe(previousId);
    // Cleared
    expect(s.conversation).toEqual([]);
    expect(s.context).toEqual([]);
    expect(s.variables).toEqual({});
    expect(s.draftInput).toBe("");
    expect(s.statePills).toEqual({ emotion: null, rsd: null, interest: null, cognitive: null });
  });
});

describe("loadSessionRecord", () => {
  it("restores complete recoverable state while leaving navigation alone", () => {
    useSessionStore.getState().setScreenLocation("sessions", "archived");
    useSessionStore.getState().setDraftInput("half-typed thought");
    useSessionStore.getState().setStatePills({ emotion: "calm", rsd: null, interest: null, cognitive: null });

    useSessionStore.getState().loadSessionRecord(SESSION_RECORD);

    const s = useSessionStore.getState();
    expect(s.sessionId).toBe("r1");
    expect(s.sessionCreatedAt).toBe(500);
    expect(s.sessionTitle).toBe("Recovered work");
    expect(s.model).toBe("claude-opus-4-8");
    expect(s.directness).toBe(3);
    expect(s.techniques).toEqual(["chain-of-thought"]);
    expect(s.context).toEqual([CONTEXT_ITEM]);
    expect(s.variables).toEqual({ project: "Divergence" });
    expect(s.conversation).toEqual([MESSAGE]);
    expect(s.draftInput).toBe("unfinished");
    expect(s.draftSelectionStart).toBe(2);
    expect(s.draftSelectionEnd).toBe(6);
    expect(s.conversationScrollTop).toBe(88);
    expect(s.statePills).toEqual({ emotion: "calm", rsd: "low", interest: "high", cognitive: "analytical" });
    expect(s.paidFallbackEnabled).toBe(true);
    expect(s.maxRequestCost).toBe(0.5);
    expect(s.methodology).toBe("3-state");
    expect(s.methodologyPhase).toBe("test");
    expect(s.lockedProblemStatement).toBe("Keep the work");
    // Untouched — navigation is orthogonal to which session is loaded.
    expect(s.currentScreen).toBe("sessions");
    expect(s.currentSection).toBe("archived");
  });
});

describe("hydrate", () => {
  it("migrates every retired screen to its canonical destination", () => {
    const cases = [
      ["home", "translate", null], ["dashboard", "insights", "overview"],
      ["messages", "sessions", "active"], ["archive", "sessions", "archived"],
      ["resources", "techniques", null], ["integrations", "projects", "integrations"],
      ["tasks", "projects", "tasks"], ["customize", "variables", null],
      ["templates", "saved-tools", "templates"], ["saved-prompts", "saved-tools", "saved-prompts"],
    ] as const;
    for (const [retired, screen, section] of cases) {
      useSessionStore.getState().hydrate({ currentScreen: retired as never });
      expect(useSessionStore.getState().currentScreen).toBe(screen);
      expect(useSessionStore.getState().currentSection).toBe(section);
    }
  });

  it("replaces only the given fields, leaving the rest untouched", () => {
    useSessionStore.getState().setModel("claude-opus-4-8");
    useSessionStore.getState().hydrate({ directness: 1, draftInput: "restored" });
    const s = useSessionStore.getState();
    expect(s.directness).toBe(1);
    expect(s.draftInput).toBe("restored");
    expect(s.model).toBe("claude-opus-4-8"); // untouched by this hydrate call
  });
});
