import { beforeEach, describe, expect, it } from "vitest";
import {
  ACCOUNT_PERSISTED_KEYS,
  DEFAULT_TEMPLATES,
  DEFAULT_VISIBILITY,
  MAX_LEARNING_AUDIT_ENTRIES,
  MAX_STATE_CORRECTIONS,
  createInitialAccountState,
  useAccountStore,
} from "./accountStore";
import type {
  LearningAuditEntry,
  PromptTemplate,
  Rating,
  SavedPrompt,
  SessionRecord,
  StateCorrection,
} from "./types";

/* Step 12.1 — direct unit tests for accountStore's own actions, same
   posture as sessionStore.test.ts: other files exercise a few of these
   incidentally, but each action's own state transition — defaults, upsert
   vs. append, capping/eviction, immutability — is verified directly here
   for the first time. */

function resetStore() {
  useAccountStore.setState(createInitialAccountState());
}

beforeEach(resetStore);

const RATING: Rating = { messageId: "m1", stars: 4, timestamp: 100 };

const SAVED_PROMPT: SavedPrompt = { id: "p1", title: "Boiling point", text: "what temp does water boil at" };

const TEMPLATE: PromptTemplate = {
  id: "t1",
  title: "Custom template",
  model: "auto",
  directness: 2,
  techniques: ["auto-detect"],
};

const SESSION_RECORD: SessionRecord = {
  id: "r1",
  createdAt: 500,
  archived: true,
  model: "auto",
  directness: 2,
  techniques: ["auto-detect"],
  context: [],
  variables: {},
  conversation: [],
};

function correction(overrides: Partial<StateCorrection> = {}): StateCorrection {
  return { dimension: "emotion", from: "overwhelmed", to: "calm", timestamp: 1, ...overrides };
}

function auditEntry(overrides: Partial<LearningAuditEntry> = {}): LearningAuditEntry {
  return {
    id: "a1",
    timestamp: 1,
    proposalType: "technique-weight",
    target: "detailed",
    adjustment: "decrease",
    previousWeight: 0,
    newWeight: -1,
    confidence: 80,
    reasoning: "low ratings plus 'too verbose'",
    affectedRunCount: 15,
    ...overrides,
  };
}

describe("createInitialAccountState", () => {
  it("matches CANON's documented defaults", () => {
    const state = createInitialAccountState();
    expect(state.plan).toBe("free");
    expect(state.archivedPairs).toEqual([]);
    expect(state.ratings).toEqual([]);
    expect(state.savedPrompts).toEqual([]);
    expect(state.variables).toEqual({});
    expect(state.visibility).toEqual(DEFAULT_VISIBILITY);
    expect(state.learnedPreferences).toEqual({ routing: {}, technique: {} });
    expect(state.stateCorrections).toEqual([]);
    expect(state.sessions).toEqual([]);
    expect(state.templates).toHaveLength(3);
    expect(state.learningAuditLog).toEqual([]);
  });

  it("gives every field its own fresh instance — no shared references across calls", () => {
    const a = createInitialAccountState();
    const b = createInitialAccountState();
    expect(a.templates).not.toBe(b.templates);
    expect(a.templates[0]).not.toBe(b.templates[0]);
    expect(a.templates[0].techniques).not.toBe(b.templates[0].techniques);
    a.templates[0].techniques.push("verify");
    expect(b.templates[0].techniques).toEqual(["auto-detect"]);
  });

  it("templates are not shared references into DEFAULT_TEMPLATES itself", () => {
    const state = createInitialAccountState();
    state.templates[0].techniques.push("verify");
    expect(DEFAULT_TEMPLATES[0].techniques).toEqual(["auto-detect"]);
  });
});

describe("DEFAULT_VISIBILITY", () => {
  it("matches CANON Feature 12's seven documented defaults", () => {
    // quickTools: true as of an operator-directed override (this session) —
    // CANON's own rule #1 ("V3 screenshot wins on disagreement") already
    // outranked rule #9's "hidden (OFF)"; V3 shows the grid always visible.
    // See BUILD-LOG.md DECISIONS.
    expect(DEFAULT_VISIBILITY).toEqual({
      recentSessions: true,
      contextSnapshot: true,
      recentActivity: true,
      tokenUsage: true,
      modelStatus: true,
      quickTools: true,
      activeSession: false,
    });
  });
});

describe("ACCOUNT_PERSISTED_KEYS", () => {
  it("is exactly the twelve documented fields", () => {
    expect([...ACCOUNT_PERSISTED_KEYS].sort()).toEqual(
      [
        "plan",
        "archivedPairs",
        "ratings",
        "savedPrompts",
        "variables",
        "visibility",
        "theme",
        "learnedPreferences",
        "stateCorrections",
        "sessions",
        "templates",
        "learningAuditLog",
      ].sort(),
    );
  });
});

describe("plain setters", () => {
  it("setPlan sets the plan flag", () => {
    useAccountStore.getState().setPlan("paid");
    expect(useAccountStore.getState().plan).toBe("paid");
  });

  it("setLearnedPreferences replaces the whole value", () => {
    useAccountStore.getState().setLearnedPreferences({ routing: { x: 1 }, technique: {} });
    expect(useAccountStore.getState().learnedPreferences).toEqual({ routing: { x: 1 }, technique: {} });
  });
});

describe("archivePair", () => {
  it("appends", () => {
    useAccountStore.getState().archivePair({ id: "p1", question: "q", answer: "a", timestamp: 1 });
    useAccountStore.getState().archivePair({ id: "p2", question: "q2", answer: "a2", timestamp: 2 });
    expect(useAccountStore.getState().archivedPairs.map((p) => p.id)).toEqual(["p1", "p2"]);
  });
});

describe("ratings: addRating vs. setRating", () => {
  it("addRating always appends, even for a repeated messageId", () => {
    useAccountStore.getState().addRating(RATING);
    useAccountStore.getState().addRating({ ...RATING, stars: 2 });
    expect(useAccountStore.getState().ratings).toHaveLength(2);
  });

  it("setRating appends when the messageId is new", () => {
    useAccountStore.getState().setRating(RATING);
    expect(useAccountStore.getState().ratings).toEqual([RATING]);
  });

  it("setRating upserts (replaces in place) when the messageId already has a rating", () => {
    useAccountStore.getState().setRating(RATING);
    useAccountStore.getState().setRating({ messageId: "m1", stars: 1, comment: "changed my mind", timestamp: 200 });
    const ratings = useAccountStore.getState().ratings;
    expect(ratings).toHaveLength(1); // replaced, not appended
    expect(ratings[0]).toEqual({ messageId: "m1", stars: 1, comment: "changed my mind", timestamp: 200 });
  });

  it("setRating only replaces the matching messageId, leaving others untouched", () => {
    useAccountStore.getState().setRating(RATING);
    useAccountStore.getState().setRating({ messageId: "m2", stars: 5, timestamp: 150 });
    useAccountStore.getState().setRating({ messageId: "m1", stars: 3, timestamp: 300 });
    const ratings = useAccountStore.getState().ratings;
    expect(ratings.find((r) => r.messageId === "m2")?.stars).toBe(5);
    expect(ratings.find((r) => r.messageId === "m1")?.stars).toBe(3);
  });
});

describe("saved prompts", () => {
  it("addSavedPrompt appends", () => {
    useAccountStore.getState().addSavedPrompt(SAVED_PROMPT);
    expect(useAccountStore.getState().savedPrompts).toEqual([SAVED_PROMPT]);
  });

  it("removeSavedPrompt removes only the matching id", () => {
    useAccountStore.getState().addSavedPrompt(SAVED_PROMPT);
    useAccountStore.getState().addSavedPrompt({ ...SAVED_PROMPT, id: "p2" });
    useAccountStore.getState().removeSavedPrompt("p1");
    expect(useAccountStore.getState().savedPrompts.map((p) => p.id)).toEqual(["p2"]);
  });

  it("removeSavedPrompt on a nonexistent id is a harmless no-op", () => {
    useAccountStore.getState().addSavedPrompt(SAVED_PROMPT);
    useAccountStore.getState().removeSavedPrompt("nope");
    expect(useAccountStore.getState().savedPrompts).toHaveLength(1);
  });
});

describe("account variables", () => {
  it("setVariable creates and updates without touching other keys", () => {
    useAccountStore.getState().setVariable("a", "1");
    useAccountStore.getState().setVariable("b", "2");
    useAccountStore.getState().setVariable("a", "updated");
    expect(useAccountStore.getState().variables).toEqual({ a: "updated", b: "2" });
  });

  it("removeVariable removes only the named key, immutably", () => {
    useAccountStore.getState().setVariable("a", "1");
    const before = useAccountStore.getState().variables;
    useAccountStore.getState().removeVariable("a");
    expect(useAccountStore.getState().variables).toEqual({});
    expect(useAccountStore.getState().variables).not.toBe(before);
  });

  it("removeVariable on a nonexistent key is a harmless no-op", () => {
    useAccountStore.getState().setVariable("a", "1");
    useAccountStore.getState().removeVariable("nope");
    expect(useAccountStore.getState().variables).toEqual({ a: "1" });
  });
});

describe("setVisibility", () => {
  it("merges a partial patch, leaving other fields untouched", () => {
    useAccountStore.getState().setVisibility({ quickTools: true });
    const v = useAccountStore.getState().visibility;
    expect(v.quickTools).toBe(true);
    expect(v.recentSessions).toBe(true); // untouched default
    expect(v.activeSession).toBe(false); // untouched default
  });

  it("a full-object patch (Reset to defaults) restores every field", () => {
    useAccountStore.getState().setVisibility({ quickTools: true, recentSessions: false });
    useAccountStore.getState().setVisibility(DEFAULT_VISIBILITY);
    expect(useAccountStore.getState().visibility).toEqual(DEFAULT_VISIBILITY);
  });
});

describe("applyLearningRefinements", () => {
  it("sets learnedPreferences and appends audit entries together, atomically", () => {
    useAccountStore.getState().applyLearningRefinements(
      { routing: {}, technique: { detailed: { weight: -1, lastAdjustedAt: 1, totalAdjustments: 1 } } },
      [auditEntry()],
    );
    const s = useAccountStore.getState();
    expect(s.learnedPreferences.technique.detailed?.weight).toBe(-1);
    expect(s.learningAuditLog).toEqual([auditEntry()]);
  });

  it("caps the audit log at MAX_LEARNING_AUDIT_ENTRIES, dropping the oldest first", () => {
    const overflow = MAX_LEARNING_AUDIT_ENTRIES + 5;
    for (let i = 0; i < overflow; i++) {
      useAccountStore
        .getState()
        .applyLearningRefinements({ routing: {}, technique: {} }, [auditEntry({ id: `a${i}` })]);
    }
    const log = useAccountStore.getState().learningAuditLog;
    expect(log).toHaveLength(MAX_LEARNING_AUDIT_ENTRIES);
    // Oldest (a0..a4) dropped; the newest entries survive in order.
    expect(log[0].id).toBe(`a${overflow - MAX_LEARNING_AUDIT_ENTRIES}`);
    expect(log[log.length - 1].id).toBe(`a${overflow - 1}`);
  });
});

describe("recordStateCorrection", () => {
  it("appends", () => {
    useAccountStore.getState().recordStateCorrection(correction());
    useAccountStore.getState().recordStateCorrection(correction({ dimension: "rsd", from: "low", to: "high" }));
    expect(useAccountStore.getState().stateCorrections).toHaveLength(2);
  });

  it("caps at MAX_STATE_CORRECTIONS, dropping the oldest first", () => {
    const overflow = MAX_STATE_CORRECTIONS + 3;
    for (let i = 0; i < overflow; i++) {
      useAccountStore.getState().recordStateCorrection(correction({ timestamp: i }));
    }
    const corrections = useAccountStore.getState().stateCorrections;
    expect(corrections).toHaveLength(MAX_STATE_CORRECTIONS);
    expect(corrections[0].timestamp).toBe(overflow - MAX_STATE_CORRECTIONS);
    expect(corrections[corrections.length - 1].timestamp).toBe(overflow - 1);
  });
});

describe("sessions", () => {
  it("addSessionRecord appends and never mutates a past record", () => {
    useAccountStore.getState().addSessionRecord(SESSION_RECORD);
    const firstRef = useAccountStore.getState().sessions[0];
    useAccountStore.getState().addSessionRecord({ ...SESSION_RECORD, id: "r2" });
    expect(useAccountStore.getState().sessions).toHaveLength(2);
    expect(useAccountStore.getState().sessions[0]).toBe(firstRef); // untouched by the second append
  });
});

describe("templates", () => {
  it("addTemplate appends", () => {
    useAccountStore.getState().addTemplate(TEMPLATE);
    expect(useAccountStore.getState().templates.map((t) => t.id)).toContain("t1");
    expect(useAccountStore.getState().templates).toHaveLength(4); // 3 defaults + 1
  });

  it("removeTemplate removes only the matching id, including a built-in default's id", () => {
    // The store itself is deliberately "dumb" (no built-in-vs-user distinction) —
    // ADHD-AUDIT D1's fix that hides the remove control for default ids lives in
    // LoadTemplateMenu.tsx, the UI layer, not here. Confirming that boundary holds.
    useAccountStore.getState().removeTemplate("template-quick-question");
    expect(useAccountStore.getState().templates.map((t) => t.id)).not.toContain("template-quick-question");
    expect(useAccountStore.getState().templates).toHaveLength(2);
  });

  it("removeTemplate on a nonexistent id is a harmless no-op", () => {
    useAccountStore.getState().removeTemplate("nope");
    expect(useAccountStore.getState().templates).toHaveLength(3);
  });
});

describe("hydrate", () => {
  it("replaces only the given fields, leaving the rest untouched", () => {
    useAccountStore.getState().setPlan("paid");
    useAccountStore.getState().hydrate({ plan: "free", variables: { restored: "1" } });
    const s = useAccountStore.getState();
    expect(s.plan).toBe("free");
    expect(s.variables).toEqual({ restored: "1" });
  });
});
