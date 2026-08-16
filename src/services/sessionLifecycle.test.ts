import { describe, expect, it } from "vitest";
import { buildSessionRecord } from "./sessionLifecycle";
import type { SessionState } from "../stores/types";

function session(overrides: Partial<SessionState> = {}): SessionState {
  return {
    draftInput: "unsent thought",
    model: "auto",
    destination: { providerId: "universal", modelId: "universal" },
    translatorEngine: "local-rules",
    reviewBeforeSend: true,
    paidFallbackEnabled: false,
    maxRequestCost: 0,
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
  });

  it("gives every record a unique id", () => {
    const a = buildSessionRecord(session(), { archived: false });
    const b = buildSessionRecord(session(), { archived: false });
    expect(a.id).not.toBe(b.id);
  });

  it("a duplicate (archived: false) has no closedAt", () => {
    const record = buildSessionRecord(session(), { archived: false });
    expect(record.archived).toBe(false);
    expect(record.closedAt).toBeUndefined();
  });

  it("an archived close sets closedAt and archived", () => {
    const record = buildSessionRecord(session(), { archived: true });
    expect(record.archived).toBe(true);
    expect(record.closedAt).toBeGreaterThan(0);
  });

  it("carries an archive tag when given one, and omits it otherwise", () => {
    const tagged = buildSessionRecord(session(), { archived: true, tag: "important" });
    expect(tagged.tag).toBe("important");

    const untagged = buildSessionRecord(session(), { archived: true });
    expect(untagged.tag).toBeUndefined();
  });
});
