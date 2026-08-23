import { describe, expect, it } from "vitest";
import { buildSessionRecord } from "./sessionLifecycle";
import type { SessionState } from "../stores/types";

function session(overrides: Partial<SessionState> = {}): SessionState {
  return {
    sessionId: "live-session-1",
    sessionCreatedAt: 100,
    sessionTitle: "",
    draftInput: "unsent thought",
    draftSelectionStart: 3,
    draftSelectionEnd: 7,
    conversationScrollTop: 42,
    model: "auto",
    destination: { providerId: "universal", modelId: "universal" },
    translatorEngine: "local-rules",
    reviewBeforeSend: true,
    paidFallbackEnabled: false,
    maxRequestCost: 0.25,
    directness: 2,
    techniques: ["auto-detect"],
    context: [],
    conversation: [{ id: "m1", role: "user", content: "hi", timestamp: 0 }],
    statePills: { emotion: "calm", rsd: "low", interest: "medium", cognitive: "analytical" },
    variables: { name: "value" },
    currentScreen: "translate",
    methodology: "standard",
    methodologyPhase: "define",
    lockedProblemStatement: "",
    ...overrides,
  };
}

describe("buildSessionRecord", () => {
  it("copies conversation, context, variables, and settings verbatim", () => {
    const record = buildSessionRecord(session(), { archived: false });
    expect(record.model).toBe("auto");
    expect(record.directness).toBe(2);
    expect(record.techniques).toEqual(["auto-detect"]);
    expect(record.conversation).toEqual(session().conversation);
    expect(record.variables).toEqual({ name: "value" });
    expect(record.draftInput).toBe("unsent thought");
    expect(record.draftSelectionStart).toBe(3);
    expect(record.conversationScrollTop).toBe(42);
    expect(record.statePills?.emotion).toBe("calm");
    expect(record.maxRequestCost).toBe(0.25);
  });

  it("keeps one stable id for repeated recovery snapshots", () => {
    const a = buildSessionRecord(session(), { archived: false });
    const b = buildSessionRecord(session(), { archived: false });
    expect(a.id).toBe("live-session-1");
    expect(b.id).toBe(a.id);
  });

  it("accepts a fresh id for a deliberate duplicate", () => {
    const record = buildSessionRecord(session(), { status: "active", id: "copy-1" });
    expect(record.id).toBe("copy-1");
  });

  it("a duplicate (archived: false) has no closedAt", () => {
    const record = buildSessionRecord(session(), { archived: false });
    expect(record.archived).toBe(false);
    expect(record.status).toBe("active");
    expect(record.closedAt).toBeUndefined();
  });

  it("an archived close sets closedAt and archived", () => {
    const record = buildSessionRecord(session(), { archived: true });
    expect(record.archived).toBe(true);
    expect(record.status).toBe("archived");
    expect(record.closedAt).toBeGreaterThan(0);
  });

  it("carries an explicit tag and otherwise derives a useful title", () => {
    const tagged = buildSessionRecord(session(), { archived: true, tag: "important" });
    expect(tagged.tag).toBe("important");

    const untagged = buildSessionRecord(session(), { archived: true });
    expect(untagged.tag).toBe("hi");
  });
});
