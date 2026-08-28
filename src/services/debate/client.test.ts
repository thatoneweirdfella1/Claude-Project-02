import { describe, expect, it } from "vitest";
import { withDebateUsage, createPartnerClient, DEBATE_CLAUDE_MODEL } from "./client";
import { getDebatePartner } from "./roster";
import { calculateUsageCost } from "../costTracking";

/* R15 second-pass correction: both withDebateUsage() and createPartnerClient()
   previously hardcoded `actualCost: null` unconditionally, even when the real
   input/output token counts were already in hand from the call that just
   completed — so the "final cost" MultiAiRunHistory renders was permanently
   "cost unavailable" for every participant, always. Fixed to compute it via
   the same explicitly-priced calculateUsageCost() R14 already requires. */

describe("R15: withDebateUsage computes a real actualCost from captured usage", () => {
  it("computes actualCost from the real token counts, matching calculateUsageCost exactly", async () => {
    const client = withDebateUsage(async (req) => {
      req.onUsage?.({ inputTokens: 500, outputTokens: 300 });
      return "Claude's argument.";
    });

    const result = await client({ model: DEBATE_CLAUDE_MODEL, system: "sys", input: "q" });

    expect(result.usage?.inputTokens).toBe(500);
    expect(result.usage?.outputTokens).toBe(300);
    expect(result.usage?.actualCost).toBe(calculateUsageCost(500, 300, DEBATE_CLAUDE_MODEL));
    expect(result.usage?.actualCost).toBeGreaterThan(0);
  });

  it("leaves actualCost null when usage was never reported at all", async () => {
    const client = withDebateUsage(async () => "Claude's argument, no usage reported.");
    const result = await client({ model: DEBATE_CLAUDE_MODEL, system: "sys", input: "q" });
    expect(result.usage).toBeUndefined();
  });
});

describe("R15: createPartnerClient computes a real actualCost from the partner's reported usage", () => {
  it("computes actualCost for a real partner response with usage", async () => {
    const partner = getDebatePartner("gpt-5.5");
    const fetchImpl = (async () =>
      new Response(
        JSON.stringify({ text: "The partner's argument.", usage: { inputTokens: 420, outputTokens: 310 } }),
        { status: 200, headers: { "content-type": "application/json" } },
      )) as unknown as typeof fetch;

    const client = createPartnerClient(fetchImpl);
    const result = await client({ partner, system: "sys", input: "q" });

    expect(result.usage?.inputTokens).toBe(420);
    expect(result.usage?.outputTokens).toBe(310);
    expect(result.usage?.actualCost).toBe(calculateUsageCost(420, 310, "gpt-5.5"));
    expect(result.usage?.actualCost).toBeGreaterThan(0);
    // Distinct partners must never share a price — R14/R27's own rule.
    expect(result.usage?.actualCost).not.toBe(calculateUsageCost(420, 310, "claude-sonnet-5"));
  });

  it("leaves actualCost null when the partner reply carries no usage field", async () => {
    const partner = getDebatePartner("gemini-3.1-pro");
    const fetchImpl = (async () =>
      new Response(JSON.stringify({ text: "No usage reported." }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as unknown as typeof fetch;

    const client = createPartnerClient(fetchImpl);
    const result = await client({ partner, system: "sys", input: "q" });

    expect(result.usage).toBeUndefined();
  });
});
