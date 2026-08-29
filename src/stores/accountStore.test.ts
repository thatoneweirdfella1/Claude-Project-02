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
  OptimizationProfile,
  OptimizationRun,
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
    expect(state.creditBalance).toBe(0);
    expect(state.billingDate).toBe(0);
    expect(state.appMode).toBe("user");
    expect(state.creditLedger).toEqual([]);
    expect(state.manualPaymentRequests).toEqual([]);
    expect(state.optimizationProfile.schemaVersion).toBe(1);
    expect(state.optimizationProfile.selectedGoals).toEqual([]);
    expect(state.optimizationRuns).toEqual([]);
    expect(state.archivedPairs).toEqual([]);
    expect(state.ratings).toEqual([]);
    expect(state.savedPrompts).toEqual([]);
    expect(state.variables).toEqual({});
    expect(state.visibility).toEqual(DEFAULT_VISIBILITY);
    expect(state.learnedPreferences).toEqual({ routing: {}, technique: {} });
    expect(state.stateCorrections).toEqual([]);
    expect(state.rememberedStateChoices).toEqual([]);
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
  it("sets minimalist defaults with core panels visible", () => {
    // Frozen provider-neutral amendment: Quick Tools and most statistics
    // are hidden by default and remain user-configurable from Visibility.
    // Core panels: context, model status, and metadata snapshot are visible.
    expect(DEFAULT_VISIBILITY).toEqual({
      recentSessions: false,
      contextSnapshot: true,
      recentActivity: false,
      tokenUsage: false,
      modelStatus: true,
      quickTools: false,
      activeSession: true,
    });
  });
});

describe("ACCOUNT_PERSISTED_KEYS", () => {
  it("includes the complete durable account, credit, and optimization state", () => {
    expect([...ACCOUNT_PERSISTED_KEYS].sort()).toEqual(
      [
        "plan",
        "creditBalance",
        "billingDate",
        "appMode",
        "creditLedger",
        "manualPaymentRequests",
        "optimizationProfile",
        "optimizationRuns",
        "archivedPairs",
        "ratings",
        "savedPrompts",
        "variables",
        "visibility",
        "theme",
        "layout",
        "learnedPreferences",
        "stateCorrections",
        "rememberedStateChoices",
        "sessions",
        "trashed",
        "templates",
        "learningAuditLog",
        "learningSignalCount",
        "learningSignalBuffer",
        "methodologyLog",
        "autoSelectUsedThisMonth",
        "autoSelectUsageResetDate",
        "autoSelectUsageLogs",
        "disconnectedProviders",
      ].sort(),
    );
  });
});

describe("plain setters", () => {
  it("setPlan sets the plan flag", () => {
    useAccountStore.getState().setPlan("pro");
    expect(useAccountStore.getState().plan).toBe("pro");
  });

  it("setLearnedPreferences replaces the whole value", () => {
    useAccountStore.getState().setLearnedPreferences({ routing: { x: 1 }, technique: {} });
    expect(useAccountStore.getState().learnedPreferences).toEqual({ routing: { x: 1 }, technique: {} });
  });
});

describe("credits and manual payments", () => {
  it("adds and deducts credits without allowing a negative balance", () => {
    useAccountStore.getState().setPlan("plus");
    expect(useAccountStore.getState().addCredits(2, "seed")).toBe(true);
    expect(useAccountStore.getState().deductCredits(0.75, "test call")).toBe(true);
    expect(useAccountStore.getState().creditBalance).toBe(1.25);
    expect(useAccountStore.getState().deductCredits(2, "too expensive")).toBe(false);
    expect(useAccountStore.getState().creditBalance).toBe(1.25);
    expect(useAccountStore.getState().creditLedger).toHaveLength(2);
  });

  it("keeps the Free tier UI-only even if a balance exists", () => {
    useAccountStore.getState().addCredits(5, "carried balance");
    expect(useAccountStore.getState().deductCredits(1, "blocked call")).toBe(false);
    expect(useAccountStore.getState().creditBalance).toBe(5);
  });

  it("does not let Developer Mode bypass plan, balance, or ledger safeguards", () => {
    useAccountStore.getState().setAppMode("developer");
    expect(useAccountStore.getState().deductCredits(500, "dev test")).toBe(false);
    useAccountStore.getState().setPlan("plus");
    useAccountStore.getState().addCredits(1, "bounded developer credit");
    expect(useAccountStore.getState().deductCredits(2, "over balance")).toBe(false);
    expect(useAccountStore.getState().creditBalance).toBe(1);
  });

  it("requires operator resolution before a manual purchase adds credits", () => {
    const id = useAccountStore.getState().requestManualPayment({
      kind: "subscription",
      paidAmount: 15,
      creditAmount: 10.5,
      tier: "plus",
    });
    expect(useAccountStore.getState().creditBalance).toBe(0);
    expect(useAccountStore.getState().resolveManualPayment(id, true)).toBe(true);
    const state = useAccountStore.getState();
    expect(state.creditBalance).toBe(10.5);
    expect(state.plan).toBe("plus");
    expect(state.billingDate).toBeGreaterThan(Date.now());
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
    expect(v.recentSessions).toBe(false); // untouched default
    expect(v.activeSession).toBe(true); // untouched default
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

describe("rememberStateChoice", () => {
  it("keeps only the newest choice for an exact state signature", () => {
    const signature = "emotion:overwhelmed|rsd:none|interest:none|cognitive:execution";
    useAccountStore.getState().rememberStateChoice({ signature, action: "accept", timestamp: 1 });
    useAccountStore.getState().rememberStateChoice({ signature, action: "keep-current", timestamp: 2 });
    expect(useAccountStore.getState().rememberedStateChoices).toEqual([
      { signature, action: "keep-current", timestamp: 2 },
    ]);
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

describe("customer optimization state", () => {
  it("applies no-change runs so incremental scan checkpoints are durable", () => {
    const before = { routing: {}, technique: {} };
    const after = {
      ...before,
      personalization: {
        schemaVersion: 1 as const,
        version: 0,
        rules: {},
        ui: {},
        processedSessionHashes: { C01: { s1: "hash-1" } },
        updatedAt: null,
      },
    };
    const run: OptimizationRun = {
      id: "run-1",
      timestamp: 100,
      goals: ["C01"],
      status: "no-change",
      scannedSessions: 1,
      evidence: [],
      changes: [],
      beforePreferences: before,
      afterPreferences: after,
      summary: "No validated changes.",
    };
    useAccountStore.getState().recordOptimizationRun(run);
    expect(useAccountStore.getState().learnedPreferences).toEqual(after);
    expect(useAccountStore.getState().optimizationProfile.lastRunAt).toBe(100);
  });

  it("filters legacy prototype goals during hydration", () => {
    const selectedGoals = ["reduce-overwhelm", "C04"] as unknown as OptimizationProfile["selectedGoals"];
    useAccountStore.getState().hydrate({
      optimizationProfile: {
        schemaVersion: 1,
        enabled: true,
        selectedGoals,
        minimumEvidence: 3,
        lastRunAt: null,
      },
    });
    expect(useAccountStore.getState().optimizationProfile.selectedGoals).toEqual(["C04"]);
  });

  it("rolls back only the current applied snapshot and never erases newer learning", () => {
    const before = { routing: {}, technique: {} };
    const after = {
      routing: {},
      technique: { simplify: { weight: 1, lastAdjustedAt: 100, totalAdjustments: 1 } },
    };
    const run: OptimizationRun = {
      id: "run-applied",
      timestamp: 100,
      goals: ["C04"],
      status: "applied",
      scannedSessions: 1,
      evidence: [],
      changes: [],
      beforePreferences: before,
      afterPreferences: after,
      summary: "Applied.",
    };
    useAccountStore.getState().recordOptimizationRun(run);
    expect(useAccountStore.getState().rollbackOptimizationRun(run.id)).toBe(true);
    expect(useAccountStore.getState().learnedPreferences).toEqual(before);

    resetStore();
    useAccountStore.getState().recordOptimizationRun(run);
    useAccountStore.getState().setLearnedPreferences({
      ...after,
      routing: { newer: true },
    });
    expect(useAccountStore.getState().rollbackOptimizationRun(run.id)).toBe(false);
    expect(useAccountStore.getState().learnedPreferences.routing).toEqual({ newer: true });
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
    useAccountStore.getState().setPlan("pro");
    useAccountStore.getState().hydrate({ plan: "free", variables: { restored: "1" } });
    const s = useAccountStore.getState();
    expect(s.plan).toBe("free");
    expect(s.variables).toEqual({ restored: "1" });
  });
});
