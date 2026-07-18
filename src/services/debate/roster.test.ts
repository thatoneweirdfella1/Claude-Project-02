/* Step 8.3 verification — the roster matches ROUTING.md DEBATE PARTNERS
   exactly, and CANON Feature 9's "never two Claude calls" is structural. */

import { describe, expect, it } from "vitest";
import {
  DEBATE_PARTNERS,
  DEBATE_PARTNER_IDS,
  DEFAULT_DEBATE_PARTNER,
  getDebatePartner,
  isDebatePartnerId,
} from "./roster";
import { partnerEndpoint } from "./client";
import { debateSystemPrompt } from "./prompt";

describe("the roster matches ROUTING.md DEBATE PARTNERS", () => {
  it("has exactly the four api strings ROUTING.md names, in its listed order", () => {
    expect(DEBATE_PARTNER_IDS).toEqual([
      "gpt-5.5",
      "gemini-3.1-pro",
      "grok-4.3",
      "deepseek-v4-pro",
    ]);
  });

  it("maps each api string to the provider ROUTING.md assigns it", () => {
    expect(DEBATE_PARTNERS["gpt-5.5"].provider).toBe("openai");
    expect(DEBATE_PARTNERS["gemini-3.1-pro"].provider).toBe("google");
    expect(DEBATE_PARTNERS["grok-4.3"].provider).toBe("xai");
    expect(DEBATE_PARTNERS["deepseek-v4-pro"].provider).toBe("deepseek");
  });

  it("defaults to gpt-5.5, per CANON Feature 9 and ROUTING.md", () => {
    expect(DEFAULT_DEBATE_PARTNER).toBe("gpt-5.5");
  });

  it("contains NO Anthropic/Claude entry — Claude is always the other side", () => {
    const ids = DEBATE_PARTNER_IDS.join(" ").toLowerCase();
    expect(ids).not.toContain("claude");
    expect(ids).not.toContain("anthropic");
    for (const id of DEBATE_PARTNER_IDS) {
      expect(DEBATE_PARTNERS[id].provider).not.toBe("anthropic");
    }
  });

  it("gives every partner a non-empty display label and role description", () => {
    for (const id of DEBATE_PARTNER_IDS) {
      const partner = getDebatePartner(id);
      expect(partner.label.length).toBeGreaterThan(0);
      expect(partner.role.length).toBeGreaterThan(0);
      // The label is a display name, never the raw api string.
      expect(partner.label).not.toBe(partner.id);
    }
  });

  it("validates ids, rejecting a Claude model id", () => {
    expect(isDebatePartnerId("gpt-5.5")).toBe(true);
    expect(isDebatePartnerId("claude-sonnet-5")).toBe(false);
    expect(isDebatePartnerId(null)).toBe(false);
  });
});

describe("partner endpoints are per-provider and never the Claude proxy", () => {
  it("routes each partner to its own api/proxy-<provider> endpoint", () => {
    expect(partnerEndpoint("gpt-5.5")).toBe("/api/proxy-openai");
    expect(partnerEndpoint("gemini-3.1-pro")).toBe("/api/proxy-google");
    expect(partnerEndpoint("grok-4.3")).toBe("/api/proxy-xai");
    expect(partnerEndpoint("deepseek-v4-pro")).toBe("/api/proxy-deepseek");
  });

  it("never routes a partner through the Anthropic proxy", () => {
    for (const id of DEBATE_PARTNER_IDS) {
      expect(partnerEndpoint(id)).not.toBe("/api/proxy");
    }
  });
});

describe("the two stance prompts are genuine opposites", () => {
  it("assigns opposing sides", () => {
    expect(debateSystemPrompt("for")).toContain("arguing FOR");
    expect(debateSystemPrompt("against")).toContain("arguing AGAINST");
  });

  it("gives both sides identical rules — only the stance differs", () => {
    const forRules = debateSystemPrompt("for").split("Rules:")[1];
    const againstRules = debateSystemPrompt("against").split("Rules:")[1];
    expect(forRules).toBe(againstRules);
  });

  it("tells both sides not to fabricate and not to converge into agreement", () => {
    for (const stance of ["for", "against"] as const) {
      const prompt = debateSystemPrompt(stance);
      expect(prompt).toContain("Never fabricate");
      expect(prompt).toContain("Do not hedge into agreement");
    }
  });
});
